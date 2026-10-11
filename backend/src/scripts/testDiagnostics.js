import { query } from '../config/db.js';

async function testAll() {
  console.log('=== 1. Kiểm tra cấu trúc CSDL SQLite ===');
  const tables = await query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('Danh sách các bảng:', tables.map(t => t.name));

  console.log('\n=== 2. Kiểm tra bảng hotel_rules ===');
  try {
    const rules = await query('SELECT * FROM hotel_rules LIMIT 5');
    console.log('Dữ liệu hotel_rules:', rules.length, 'bản ghi');
  } catch (err) {
    console.error('Lỗi hotel_rules:', err.message);
  }

  console.log('\n=== 3. Kiểm tra các Models ===');
  try {
    const { Hotel } = await import('../models/Hotel.js');
    const hotels = await Hotel.getAll();
    console.log('Hotel.getAll():', hotels.length, 'khách sạn');
  } catch (err) {
    console.error('Lỗi Hotel model:', err.message);
  }

  try {
    const { Room } = await import('../models/Room.js');
    const rooms = await Room.getByHotel(1);
    console.log('Room.getByHotel(1):', rooms.length, 'phòng');
  } catch (err) {
    console.error('Lỗi Room model:', err.message);
  }

  try {
    const { Booking } = await import('../models/Booking.js');
    const bookings = await Booking.getAll();
    console.log('Booking.getAll():', bookings.length, 'đơn');
  } catch (err) {
    console.error('Lỗi Booking model:', err.message);
  }

  try {
    const { Drink } = await import('../models/Drink.js');
    const drinks = await Drink.getAll();
    console.log('Drink.getAll():', drinks.length, 'loại đồ uống');
  } catch (err) {
    console.error('Lỗi Drink model:', err.message);
  }

  try {
    const { DrinkOrder } = await import('../models/DrinkOrder.js');
    const drinkOrders = await DrinkOrder.getAll();
    console.log('DrinkOrder.getAll():', drinkOrders.length, 'đơn đồ uống');
  } catch (err) {
    console.error('Lỗi DrinkOrder model:', err.message);
  }

  try {
    const { Staff } = await import('../models/Staff.js');
    console.log('Staff model OK');
  } catch (err) {
    console.error('Lỗi Staff model:', err.message);
  }

  try {
    const { User } = await import('../models/User.js');
    console.log('User model OK');
  } catch (err) {
    console.error('Lỗi User model:', err.message);
  }

  try {
    const RuleModule = await import('../models/Rule.js');
    console.log('Rule exports:', Object.keys(RuleModule));
  } catch (err) {
    console.error('Lỗi Rule model:', err.message);
  }

  console.log('\n=== 4. Kiểm tra app.js ===');
  try {
    const app = (await import('../app.js')).default;
    console.log('app.js loaded successfully!');
  } catch (err) {
    console.error('Lỗi nạp app.js:', err.message);
  }
}

testAll().catch(console.error);
