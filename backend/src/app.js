import express from 'express';
import cors from 'cors';
import { testConnection } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import drinkRoutes from './routes/drinkRoutes.js';

import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Cho phép tất cả frontends (port 3000, 3001, 3002) gọi API
app.use(cors());
app.use(express.json());

// Kiểm tra kết nối CSDL khi khởi động
testConnection();

// Gắn các nhóm route
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/drinks', drinkRoutes);
app.use('/api/room-service', drinkRoutes);

// Route kiểm tra nhanh server còn sống hay không
app.get('/', (req, res) => {
  res.json({ message: 'Hotel System API đang chạy' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Middleware bắt lỗi — LUÔN đặt cuối cùng, sau mọi route
app.use(notFoundHandler);
app.use(errorHandler);

export default app;