import { Router } from 'express';
import { getOverallStats, getHotelStats } from '../controllers/dashboardController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// Tổng quan toàn hệ thống — 10 khách sạn
router.get('/overview', verifyToken, requireRole('admin'), getOverallStats);

// Chi tiết số liệu 1 khách sạn (admin bấm vào từ web tổng)
router.get('/hotel/:hotelId', verifyToken, requireRole('admin'), getHotelStats);

export default router;