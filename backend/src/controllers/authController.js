import crypto from 'crypto';
import pool from '../config/db.js';
import * as userRepository from '../repositories/userRepository.js';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/auth.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
  try {
    const user = await userRepository.findUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Omit password hash
    const { password_hash, ...profile } = user;
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// ─── Customer Specific Auth ──────────────────────────────────────────────

export const registerCustomer = async (req, res) => {
  try {
    const { email, password, name, phone, address, city, state, pin_code } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanPhone = (phone || '').trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit mobile number is mandatory to register' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const id = crypto.randomUUID();
    const password_hash = await hashPassword(password);
    
    // Extract first_name and last_name if single name provided
    let first_name = name || '';
    let last_name = '';
    if (name && name.includes(' ')) {
      const parts = name.trim().split(' ');
      first_name = parts[0];
      last_name = parts.slice(1).join(' ');
    }

    const user = await userRepository.createUser({
      id,
      email: normalizedEmail,
      password_hash,
      first_name,
      last_name,
      phone: cleanPhone,
      role: 'customer'
    });

    // Auto-save address if provided during registration
    if (address && city) {
      const addressId = crypto.randomUUID();
      await pool.query(
        'INSERT INTO addresses (id, user_id, full_name, phone, address_line1, city, state, pin_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
        [addressId, id, name || 'Customer', cleanPhone, address, city, state || 'India', pin_code || '']
      ).catch(e => console.warn('Registration address save note:', e.message));
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        token: accessToken
      }
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        token: accessToken
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const getCustomerProfile = async (req, res) => {
  try {
    const user = await userRepository.findUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });

    const addresses = await userRepository.getUserAddresses(req.user.id);
    const { password_hash, ...profile } = user;

    res.json({
      success: true,
      data: {
        ...profile,
        name: `${profile.first_name} ${profile.last_name}`.trim(),
        addresses
      }
    });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer profile' });
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    const updated = await userRepository.updateUser(req.user.id, { first_name, last_name, phone });
    const { password_hash, ...profile } = updated;
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...profile,
        name: `${profile.first_name} ${profile.last_name}`.trim()
      }
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const getCustomerAddresses = async (req, res) => {
  try {
    const addresses = await userRepository.getUserAddresses(req.user.id);
    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
};

export const addCustomerAddress = async (req, res) => {
  try {
    const { phone, address_line1, address_line2, city, state, pin_code, is_default } = req.body;
    const fullName = req.body.full_name || req.body.recipient_name || req.body.name;
    if (!fullName || !phone || !address_line1 || !city || !state || !pin_code) {
      return res.status(400).json({ success: false, message: 'All required address fields must be provided' });
    }

    const id = crypto.randomUUID();
    const address = await userRepository.addUserAddress({
      id,
      user_id: req.user.id,
      full_name: fullName,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      pin_code,
      is_default: Boolean(is_default)
    });

    res.status(201).json({ success: true, message: 'Address added successfully', data: address });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Failed to add address' });
  }
};

export const deleteCustomerAddress = async (req, res) => {
  try {
    await userRepository.deleteUserAddress(req.params.id, req.user.id);
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

