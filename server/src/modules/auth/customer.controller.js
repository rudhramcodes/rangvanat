import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Customer } from './customer.model.js';
import { Order } from '../orders/order.model.js';
import { env } from '../../config/env.js';

const generateToken = (customer) => {
  return jwt.sign(
    { id: customer._id, email: customer.email, role: customer.role || 'customer' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || '7d' }
  );
};

export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const customer = new Customer({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone ? phone.trim() : '',
    });

    await customer.save();
    const token = generateToken(customer);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          addresses: customer.addresses,
          wishlist: customer.wishlist,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(customer);

    res.json({
      success: true,
      message: 'Welcome back to Rangvanat',
      data: {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          addresses: customer.addresses,
          wishlist: customer.wishlist,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerMe = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id).select('-passwordHash').lean();
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Also fetch past orders for this customer
    const orders = await Order.find({ 'customer.email': customer.email }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: {
        ...customer,
        orders,
      },
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
    }
    next(err);
  }
};

export const updateCustomerProfile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const { name, phone, addresses, wishlist } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (addresses !== undefined) updates.addresses = addresses;
    if (wishlist !== undefined) updates.wishlist = wishlist;

    const customer = await Customer.findByIdAndUpdate(decoded.id, { $set: updates }, { new: true })
      .select('-passwordHash')
      .lean();

    res.json({ success: true, message: 'Profile updated', data: customer });
  } catch (err) {
    next(err);
  }
};
