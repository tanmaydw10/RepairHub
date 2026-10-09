import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, repairerRepository } from '../models/dbRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'repairhub_dev_secret_key_change_in_production_32char';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role = 'customer',
      phone = '',
      address = '',
      service_categories,
      service_area,
      bio
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and password are required.'
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters.'
      });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match password.'
      });
    }

    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Strict RBAC: users can only register as customer or repairer, never admin
    const validRole = role === 'repairer' ? 'repairer' : 'customer';

    const newUser = await userRepository.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: validRole,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : ''
    });

    if (validRole === 'repairer') {
      await repairerRepository.updateProfile(newUser.id, {
        name: trimmedName,
        phone: phone ? phone.trim() : '',
        service_categories: service_categories || 'All Categories',
        service_area: service_area || 'Citywide',
        bio: bio || 'Professional certified repair technician.'
      });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let repairerProfile = null;
    if (user.role === 'repairer') {
      repairerProfile = await repairerRepository.findByUserId(user.id);
    }

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        repairerProfile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let repairerProfile = null;
    if (user.role === 'repairer') {
      repairerProfile = await repairerRepository.findByUserId(user.id);
    }

    return res.json({
      success: true,
      user: {
        ...user,
        repairerProfile
      }
    });
  } catch (error) {
    next(error);
  }
}
