import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập hoặc thiếu token xác thực' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập hoặc thiếu token xác thực' });
    }
    const userRole = req.user.role;
    const effectiveRoles = [userRole];
    if (userRole === 'staff') effectiveRoles.push('receptionist');
    if (userRole === 'receptionist') effectiveRoles.push('staff');
    if (userRole === 'admin') effectiveRoles.push('receptionist', 'staff', 'cleaner');

    const hasPermission = roles.some((r) => effectiveRoles.includes(r));
    if (!hasPermission) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
    }
    next();
  };
}

export const verifyToken = authenticate;
export const requireRole = (...roles) => authorizeRoles(...roles);

