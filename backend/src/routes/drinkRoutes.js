import express from 'express';
import {
  getDrinkMenu,
  createOrder,
  getOrderById,
  getOrdersByHotel,
  getAllOrders,
  updateOrderStatus,
  addOrderMessage,
  getOrderMessages
} from '../controllers/drinkController.js';

const router = express.Router();

// Menu đồ uống
router.get('/', getDrinkMenu);
router.get('/menu', getDrinkMenu);
router.get('/drinks', getDrinkMenu);

// Quản lý đơn đồ uống
router.get('/orders', getAllOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrderById);
router.get('/orders/hotel/:hotelId', getOrdersByHotel);
router.patch('/orders/:id/status', updateOrderStatus);

// Nhắn tin trao đổi / giục đơn giữa khách và tiếp tân
router.post('/orders/:id/messages', addOrderMessage);
router.get('/orders/:id/messages', getOrderMessages);

export default router;
