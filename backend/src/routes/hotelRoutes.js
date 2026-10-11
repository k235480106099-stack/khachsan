import { Router } from 'express';
import {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
} from '../controllers/hotelController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// Công khai — web tổng và web khách sạn đều cần xem
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Chỉ admin tổng được thêm/sửa/xoá khách sạn
router.post('/', verifyToken, requireRole('admin'), createHotel);
router.put('/:id', verifyToken, requireRole('admin'), updateHotel);
router.delete('/:id', verifyToken, requireRole('admin'), deleteHotel);

export default router;