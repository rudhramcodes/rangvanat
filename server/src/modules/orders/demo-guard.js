import { Settings } from '../settings/settings.model.js';

export async function preventDemoOrders(req, res, next) {
  try {
    const settings = await Settings.findOne({ key: 'store' }).lean();
    if (settings?.demoMode) return res.status(403).json({ success: false, message: 'Demo store: orders and payments are disabled.' });
    next();
  } catch (error) { next(error); }
}
