import express from 'express';
import {
  createBooking,
  confirmDeposit,
  remindDeposit,
  cancelBooking,
  checkIn,
  checkOut,
  getBookingHistoryByGuest,
  getBookingHistoryByHotel,
  getAllBookings,
  getBookingLogs,
  getAllBookingLogs
} from '../controllers/bookingController.js';

const router = express.Router();

// Nhật ký hoạt động toàn hệ thống
router.get('/logs', getAllBookingLogs);
router.get('/:id/logs', getBookingLogs);

// Lấy toàn bộ đơn hoặc theo khách sạn / khách
router.get('/', getAllBookings);
router.get('/guest/:phone', getBookingHistoryByGuest);
router.get('/hotel/:hotelId', getBookingHistoryByHotel);

// Tạo đơn, cọc, nhắc cọc, huỷ đơn
router.post('/', createBooking);
router.patch('/:id/deposit', confirmDeposit);
router.post('/:id/remind', remindDeposit);
router.patch('/:id/remind', remindDeposit);
router.patch('/:id/cancel', cancelBooking);
router.post('/:id/cancel', cancelBooking);

// Check-in / Check-out
router.patch('/:id/checkin', checkIn);
router.patch('/:id/checkout', checkOut);

export default router;