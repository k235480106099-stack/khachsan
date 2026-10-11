import { Router } from 'express';
import {
  getStaffByHotel,
  getAllStaffOverview,
  assignStaffShift,
  updateStaffShift,
  deleteStaffShift
} from '../controllers/staffController.js';
import {
  getCleanersByHotel,
  assignCleanerShift,
  updateCleanerShift,
  deleteCleanerShift
} from '../controllers/cleanerController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = Router();

/* ---------- Lấy toàn bộ nhân sự 10 khách sạn cho Web Tổng ---------- */
router.get('/overview', verifyToken, requireRole('admin', 'receptionist', 'staff'), getAllStaffOverview);
router.get('/', verifyToken, requireRole('admin', 'receptionist', 'staff'), getAllStaffOverview);

/* ---------- Lễ tân (ca ngày / ca đêm) ---------- */
router.get('/hotel/:hotelId', verifyToken, requireRole('admin', 'receptionist', 'staff'), getStaffByHotel);
router.post('/', verifyToken, requireRole('admin', 'receptionist', 'staff'), assignStaffShift);
router.put('/:id', verifyToken, requireRole('admin', 'receptionist', 'staff'), updateStaffShift);
router.delete('/:id', verifyToken, requireRole('admin', 'receptionist', 'staff'), deleteStaffShift);

/* ---------- Lao công (ca ngày / ca đêm) ---------- */
router.get('/cleaners/hotel/:hotelId', verifyToken, requireRole('admin', 'receptionist', 'staff'), getCleanersByHotel);
router.post('/cleaners', verifyToken, requireRole('admin', 'receptionist', 'staff'), assignCleanerShift);
router.put('/cleaners/:id', verifyToken, requireRole('admin', 'receptionist', 'staff'), updateCleanerShift);
router.delete('/cleaners/:id', verifyToken, requireRole('admin', 'receptionist', 'staff'), deleteCleanerShift);

export default router;