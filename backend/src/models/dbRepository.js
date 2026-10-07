import db from '../config/db.js';

export const userRepository = {
  async findByEmail(email) {
    if (db.isPostgres()) {
      const res = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      return res.rows[0] || null;
    }
    const store = db.getFallbackStore();
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findById(id) {
    const numId = parseInt(id, 10);
    if (db.isPostgres()) {
      const res = await db.query('SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = $1', [numId]);
      return res.rows[0] || null;
    }
    const store = db.getFallbackStore();
    const u = store.users.find(user => user.id === numId);
    if (!u) return null;
    const { password, ...userWithoutPass } = u;
    return userWithoutPass;
  },

  async create({ name, email, password, role = 'customer', phone = '', address = '' }) {
    if (db.isPostgres()) {
      const res = await db.query(
        `INSERT INTO users (name, email, password, role, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, role, phone, address, created_at`,
        [name, email, password, role, phone, address]
      );
      return res.rows[0];
    }
    const store = db.getFallbackStore();
    const newId = store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      name,
      email,
      password,
      role,
      phone,
      address,
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    const { password: _, ...cleanUser } = newUser;
    return cleanUser;
  }
};

export const repairerRepository = {
  async findByUserId(userId) {
    const numId = parseInt(userId, 10);
    if (db.isPostgres()) {
      const res = await db.query('SELECT * FROM repairers WHERE user_id = $1', [numId]);
      return res.rows[0] || null;
    }
    const store = db.getFallbackStore();
    return store.repairers.find(r => r.user_id === numId) || null;
  },

  async getProfile(repairerIdOrUserId) {
    const numId = parseInt(repairerIdOrUserId, 10);
    if (db.isPostgres()) {
      const res = await db.query(
        `SELECT r.*, u.email 
         FROM repairers r 
         LEFT JOIN users u ON r.user_id = u.id 
         WHERE r.id = $1 OR r.user_id = $1`,
        [numId]
      );
      return res.rows[0] || null;
    }
    const store = db.getFallbackStore();
    const rep = store.repairers.find(r => r.id === numId || r.user_id === numId);
    if (!rep) return null;
    const user = store.users.find(u => u.id === rep.user_id);
    return { ...rep, email: user ? user.email : '' };
  },

  async updateProfile(userId, { name, phone, service_categories, service_area, bio }) {
    const numId = parseInt(userId, 10);
    if (db.isPostgres()) {
      const res = await db.query(
        `UPDATE repairers 
         SET name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             service_categories = COALESCE($3, service_categories),
             service_area = COALESCE($4, service_area),
             bio = COALESCE($5, bio)
         WHERE user_id = $6
         RETURNING *`,
        [name, phone, service_categories, service_area, bio, numId]
      );
      return res.rows[0];
    }
    const store = db.getFallbackStore();
    let rep = store.repairers.find(r => r.user_id === numId);
    if (!rep) {
      rep = {
        id: store.repairers.length + 1,
        user_id: numId,
        name: name || 'Technician',
        phone: phone || '',
        service_categories: service_categories || 'General Electronics',
        service_area: service_area || 'Citywide',
        rating: 5.0,
        completed_repairs: 0,
        bio: bio || '',
        created_at: new Date().toISOString()
      };
      store.repairers.push(rep);
    } else {
      if (name !== undefined) rep.name = name;
      if (phone !== undefined) rep.phone = phone;
      if (service_categories !== undefined) rep.service_categories = service_categories;
      if (service_area !== undefined) rep.service_area = service_area;
      if (bio !== undefined) rep.bio = bio;
    }
    return rep;
  }
};

export const requestRepository = {
  async getAll({ status, repair_type, search, customer_id, repairer_id } = {}) {
    if (db.isPostgres()) {
      let query = 'SELECT * FROM repair_requests WHERE 1=1';
      const params = [];
      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }
      if (repair_type) {
        params.push(repair_type);
        query += ` AND repair_type = $${params.length}`;
      }
      if (customer_id) {
        params.push(parseInt(customer_id, 10));
        query += ` AND customer_id = $${params.length}`;
      }
      if (repairer_id) {
        params.push(parseInt(repairer_id, 10));
        query += ` AND repairer_id = $${params.length}`;
      }
      if (search) {
        params.push(`%${search.toLowerCase()}%`);
        query += ` AND (LOWER(problem) LIKE $${params.length} OR LOWER(id) LIKE $${params.length} OR LOWER(address) LIKE $${params.length} OR LOWER(phone) LIKE $${params.length})`;
      }
      query += ' ORDER BY created_at DESC';
      const res = await db.query(query, params);
      return res.rows;
    }

    const store = db.getFallbackStore();
    let list = [...store.repair_requests];

    if (status) {
      list = list.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }
    if (repair_type) {
      list = list.filter(r => r.repair_type.toLowerCase() === repair_type.toLowerCase());
    }
    if (customer_id) {
      list = list.filter(r => r.customer_id === parseInt(customer_id, 10));
    }
    if (repairer_id) {
      list = list.filter(r => r.repairer_id === parseInt(repairer_id, 10));
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(r => 
        (r.problem && r.problem.toLowerCase().includes(s)) ||
        (r.id && r.id.toLowerCase().includes(s)) ||
        (r.address && r.address.toLowerCase().includes(s)) ||
        (r.phone && r.phone.toLowerCase().includes(s)) ||
        (r.repairer_name && r.repairer_name.toLowerCase().includes(s))
      );
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async findById(id) {
    if (db.isPostgres()) {
      const res = await db.query('SELECT * FROM repair_requests WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    const store = db.getFallbackStore();
    return store.repair_requests.find(r => r.id === id) || null;
  },

  async create(data) {
    const id = data.id || `RH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newReq = {
      id,
      customer_id: data.customer_id ? parseInt(data.customer_id, 10) : null,
      repairer_id: data.repairer_id ? parseInt(data.repairer_id, 10) : null,
      repair_type: data.repair_type,
      problem: data.problem,
      image_url: data.image_url || null,
      phone: data.phone,
      address: data.address,
      urgency: data.urgency || 'medium',
      preferred_date: data.preferred_date || null,
      preferred_time: data.preferred_time || null,
      status: data.status || 'Pending',
      estimated_cost: data.estimated_cost ? parseFloat(data.estimated_cost) : null,
      repairer_name: data.repairer_name || null,
      repair_notes: data.repair_notes || null,
      created_at: now,
      updated_at: now,
      completed_at: null
    };

    if (db.isPostgres()) {
      const res = await db.query(
        `INSERT INTO repair_requests 
         (id, customer_id, repairer_id, repair_type, problem, image_url, phone, address, urgency, preferred_date, preferred_time, status, estimated_cost, repairer_name, repair_notes, created_at, updated_at, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         RETURNING *`,
        [
          newReq.id, newReq.customer_id, newReq.repairer_id, newReq.repair_type, newReq.problem,
          newReq.image_url, newReq.phone, newReq.address, newReq.urgency, newReq.preferred_date,
          newReq.preferred_time, newReq.status, newReq.estimated_cost, newReq.repairer_name,
          newReq.repair_notes, newReq.created_at, newReq.updated_at, newReq.completed_at
        ]
      );
      // Insert initial timeline update
      await db.query(
        `INSERT INTO repair_updates (request_id, status, note, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [newReq.id, 'Pending', 'Repair request created successfully.', 'System', now]
      );
      return res.rows[0];
    }

    const store = db.getFallbackStore();
    store.repair_requests.unshift(newReq);
    store.repair_updates.push({
      id: store.repair_updates.length + 1,
      request_id: newReq.id,
      status: 'Pending',
      note: 'Repair request created successfully.',
      created_by: 'Customer',
      created_at: now
    });
    return newReq;
  },

  async update(id, updates) {
    const now = new Date().toISOString();
    let completedAt = null;
    if (updates.status === 'Completed') {
      completedAt = now;
    }

    if (db.isPostgres()) {
      const fields = [];
      const values = [];
      let idx = 1;

      for (const [key, val] of Object.entries(updates)) {
        if (key !== 'id') {
          fields.push(`${key} = $${idx}`);
          values.push(val);
          idx++;
        }
      }
      fields.push(`updated_at = $${idx}`);
      values.push(now);
      idx++;

      if (completedAt) {
        fields.push(`completed_at = $${idx}`);
        values.push(completedAt);
        idx++;
      }

      values.push(id);
      const query = `UPDATE repair_requests SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const res = await db.query(query, values);
      return res.rows[0] || null;
    }

    const store = db.getFallbackStore();
    const req = store.repair_requests.find(r => r.id === id);
    if (!req) return null;

    Object.assign(req, updates, {
      updated_at: now,
      ...(completedAt ? { completed_at: completedAt } : {})
    });
    return req;
  },

  async addUpdate(requestId, status, note, createdBy = 'Repairer') {
    const now = new Date().toISOString();
    if (db.isPostgres()) {
      const res = await db.query(
        `INSERT INTO repair_updates (request_id, status, note, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [requestId, status, note, createdBy, now]
      );
      return res.rows[0];
    }
    const store = db.getFallbackStore();
    const newUpdate = {
      id: store.repair_updates.length + 1,
      request_id: requestId,
      status,
      note,
      created_by: createdBy,
      created_at: now
    };
    store.repair_updates.push(newUpdate);
    return newUpdate;
  },

  async getUpdates(requestId) {
    if (db.isPostgres()) {
      const res = await db.query(
        'SELECT * FROM repair_updates WHERE request_id = $1 ORDER BY created_at ASC',
        [requestId]
      );
      return res.rows;
    }
    const store = db.getFallbackStore();
    return store.repair_updates
      .filter(u => u.request_id === requestId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
};

export const reviewRepository = {
  async getByRequestId(requestId) {
    if (db.isPostgres()) {
      const res = await db.query('SELECT * FROM reviews WHERE request_id = $1', [requestId]);
      return res.rows[0] || null;
    }
    const store = db.getFallbackStore();
    return store.reviews.find(r => r.request_id === requestId) || null;
  },

  async getAll() {
    if (db.isPostgres()) {
      const res = await db.query(
        `SELECT r.*, u.name as customer_name, req.repair_type 
         FROM reviews r 
         LEFT JOIN users u ON r.customer_id = u.id 
         LEFT JOIN repair_requests req ON r.request_id = req.id 
         ORDER BY r.created_at DESC`
      );
      return res.rows;
    }
    const store = db.getFallbackStore();
    return store.reviews.map(rev => {
      const u = store.users.find(user => user.id === rev.customer_id);
      const req = store.repair_requests.find(r => r.id === rev.request_id);
      return {
        ...rev,
        customer_name: u ? u.name : 'Customer',
        repair_type: req ? req.repair_type : 'General Repair'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async create({ request_id, customer_id, repairer_id, rating, review }) {
    const now = new Date().toISOString();
    const numRating = parseInt(rating, 10);
    if (db.isPostgres()) {
      const res = await db.query(
        `INSERT INTO reviews (request_id, customer_id, repairer_id, rating, review, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [request_id, customer_id, repairer_id, numRating, review, now]
      );
      return res.rows[0];
    }
    const store = db.getFallbackStore();
    const newRev = {
      id: store.reviews.length + 1,
      request_id,
      customer_id: customer_id ? parseInt(customer_id, 10) : null,
      repairer_id: repairer_id ? parseInt(repairer_id, 10) : null,
      rating: numRating,
      review,
      created_at: now
    };
    store.reviews.push(newRev);
    return newRev;
  }
};
