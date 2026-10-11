import { query } from '../config/db.js';

// Lấy lịch trực tổng hợp (lễ tân + lao công) của 1 khách sạn theo ngày — dùng cho web tổng
export async function getScheduleByHotelAndDate(hotelId, workDate) {
  return query(
    'SELECT * FROM staff WHERE hotel_id = ? AND work_date = ? ORDER BY role, shift',
    [hotelId, workDate]
  );
}

// Đếm số người trực ca ngày / ca đêm của 1 khách sạn, tách riêng theo role
export async function countShiftsByHotel(hotelId) {
  return query(
    `SELECT role, shift, COUNT(*) AS total
     FROM staff
     WHERE hotel_id = ?
     GROUP BY role, shift`,
    [hotelId]
  );
}