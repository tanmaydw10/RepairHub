import { requestRepository, reviewRepository, repairerRepository } from '../models/dbRepository.js';

export async function createRequest(req, res, next) {
  try {
    const {
      repair_type,
      problem,
      phone,
      address,
      urgency = 'medium',
      preferred_date,
      preferred_time,
      image_url: customImageUrl
    } = req.body;

    if (!repair_type || !problem || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Repair type, problem description, phone number, and address are required.'
      });
    }

    let finalImageUrl = customImageUrl || null;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const customerId = req.user ? req.user.id : null;

    const newRequest = await requestRepository.create({
      customer_id: customerId,
      repair_type,
      problem,
      image_url: finalImageUrl,
      phone,
      address,
      urgency,
      preferred_date,
      preferred_time,
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Repair request created successfully.',
      data: newRequest
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllRequests(req, res, next) {
  try {
    const { status, repair_type, search, customer_id, repairer_id } = req.query;

    let filterCustomerId = customer_id;
    let filterRepairerId = repairer_id;

    // If customer role, restrict to their requests unless repairer/admin
    if (req.user && req.user.role === 'customer' && !customer_id) {
      filterCustomerId = req.user.id;
    }

    const requests = await requestRepository.getAll({
      status,
      repair_type,
      search,
      customer_id: filterCustomerId,
      repairer_id: filterRepairerId
    });

    return res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
}

export async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const request = await requestRepository.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: `Repair request '${id}' not found.` });
    }

    const timeline = await requestRepository.getUpdates(id);
    const review = await reviewRepository.getByRequestId(id);

    return res.json({
      success: true,
      data: {
        ...request,
        timeline,
        review
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function trackRequest(req, res, next) {
  try {
    const { id } = req.params;
    const cleanId = id.trim().toUpperCase();

    const request = await requestRepository.findById(cleanId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `No active repair request found with ID: ${cleanId}. Please check the tracking code.`
      });
    }

    const timeline = await requestRepository.getUpdates(cleanId);
    const review = await reviewRepository.getByRequestId(cleanId);

    return res.json({
      success: true,
      data: {
        ...request,
        timeline,
        review
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRequest(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await requestRepository.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const {
      status,
      estimated_cost,
      repairer_name,
      repair_notes,
      preferred_date,
      preferred_time,
      urgency,
      repairer_id
    } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (estimated_cost !== undefined) updates.estimated_cost = estimated_cost;
    if (repairer_name !== undefined) updates.repairer_name = repairer_name;
    if (repair_notes !== undefined) updates.repair_notes = repair_notes;
    if (preferred_date !== undefined) updates.preferred_date = preferred_date;
    if (preferred_time !== undefined) updates.preferred_time = preferred_time;
    if (urgency !== undefined) updates.urgency = urgency;
    if (repairer_id !== undefined) updates.repairer_id = repairer_id;

    const updated = await requestRepository.update(id, updates);

    // If status changed or notes added, add update entry
    if (status && status !== existing.status) {
      const actor = req.user ? req.user.name : (repairer_name || 'Technician');
      const note = req.body.status_note || `Status updated to ${status}${repair_notes ? ': ' + repair_notes : ''}`;
      await requestRepository.addUpdate(id, status, note, actor);
    }

    return res.json({
      success: true,
      message: 'Repair request updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const existing = await requestRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const updated = await requestRepository.update(id, { status });
    const actor = req.user ? req.user.name : (existing.repairer_name || 'Technician');
    const updateNote = note || `Status progressed to ${status}`;

    await requestRepository.addUpdate(id, status, updateNote, actor);

    return res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function assignRepairer(req, res, next) {
  try {
    const { id } = req.params;
    const { repairer_id, repairer_name, estimated_cost } = req.body;

    const existing = await requestRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const updates = {
      status: 'Accepted',
      repairer_id: repairer_id ? parseInt(repairer_id, 10) : (req.user ? req.user.id : null),
      repairer_name: repairer_name || (req.user ? req.user.name : 'Assigned Technician')
    };

    if (estimated_cost !== undefined) {
      updates.estimated_cost = estimated_cost;
    }

    const updated = await requestRepository.update(id, updates);
    await requestRepository.addUpdate(
      id,
      'Accepted',
      `Request accepted by ${updates.repairer_name}.${estimated_cost ? ` Estimated cost: ₹${Number(estimated_cost).toLocaleString('en-IN')}` : ''}`,
      updates.repairer_name
    );

    return res.json({
      success: true,
      message: 'Repairer assigned successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
