import { requestRepository, repairerRepository, reviewRepository } from '../models/dbRepository.js';

export async function getDashboardStats(req, res, next) {
  try {
    const allRequests = await requestRepository.getAll();
    const allReviews = await reviewRepository.getAll();

    const todayStr = new Date().toISOString().split('T')[0];

    const totalRequests = allRequests.length;
    const pendingRequests = allRequests.filter(r => r.status === 'Pending').length;
    const inProgressRequests = allRequests.filter(r => r.status === 'In Progress').length;
    const completedRequests = allRequests.filter(r => r.status === 'Completed').length;
    const acceptedRequests = allRequests.filter(r => r.status === 'Accepted').length;
    const cancelledRequests = allRequests.filter(r => r.status === 'Cancelled').length;

    const todaysRequests = allRequests.filter(r => {
      const createdDate = (r.created_at || '').split('T')[0];
      return createdDate === todayStr;
    }).length;

    // Estimated revenue from completed / active requests with cost
    const estimatedRevenue = allRequests
      .filter(r => r.status === 'Completed' || r.status === 'In Progress')
      .reduce((acc, curr) => acc + (parseFloat(curr.estimated_cost) || 0), 0);

    // Average rating
    const averageRating = allReviews.length > 0
      ? (allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length).toFixed(1)
      : '5.0';

    return res.json({
      success: true,
      stats: {
        totalRequests,
        pendingRequests,
        inProgressRequests,
        activeRepairs: inProgressRequests + acceptedRequests,
        completedRequests,
        acceptedRequests,
        cancelledRequests,
        todaysRequests,
        estimatedRevenue: Math.round(estimatedRevenue),
        averageRating: parseFloat(averageRating),
        totalReviews: allReviews.length,
        techniciansAvailable: 25,
        averageTechnicianRating: '4.8',
        successfulFixRate: '99.2%',
        serviceWarranty: '90 Days',
        quickResponse: '< 30 Mins',
        serviceCoverage: 'PAN India'
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const userId = req.user ? req.user.id : req.params.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const profile = await repairerRepository.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Repairer profile not found.' });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, phone, service_categories, service_area, bio } = req.body;

    const updated = await repairerRepository.updateProfile(userId, {
      name,
      phone,
      service_categories,
      service_area,
      bio
    });

    return res.json({
      success: true,
      message: 'Repairer profile updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
