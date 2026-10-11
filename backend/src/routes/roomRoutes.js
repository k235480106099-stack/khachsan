import { Router } from 'express';
import {
  getRoomsByHotel,
  createRoom,
  updateRoomStatus,
  deleteRoom
} from '../controllers/roomController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// Công khai — khách xem danh sách phòng + trạng thái FULL
router.get('/hotel/:hotelId', getRoomsByHotel);

// Admin thêm phòng mới cho khách sạn
router.post('/', verifyToken, requireRole('admin'), createRoom);

// Admin hoặc lễ tân cập nhật trạng thái phòng (available/booked/maintenance)
router.patch('/:id/status', verifyToken, requireRole('admin', 'receptionist'), updateRoomStatus);

// Chỉ admin được xoá phòng
router.delete('/:id', verifyToken, requireRole('admin'), deleteRoom);

export default router;