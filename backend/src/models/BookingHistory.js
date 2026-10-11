import { query } from '../config/db.js';

export const BookingHistory = {
  async add(bookingId, action, reason = '') {
    return query(
      'INSERT INTO booking_histories (booking_id, action, reason) VALUES (?, ?, ?)',
      [bookingId, action, reason]
    );
  },

  async getByBooking(bookingId) {
    return query(
      'SELECT * FROM booking_histories WHERE booking_id = ? ORDER BY created_at DESC',
      [bookingId]
    );
  },

  async getAllLogs() {
    return query(
      `SELECT bh.*, b.guest_name, b.phone, b.hotel_id, h.name as hotel_name, r.room_number, r.type as room_type
       FROM booking_histories bh
       JOIN bookings b ON bh.booking_id = b.id
       JOIN hotels h ON b.hotel_id = h.id
       JOIN rooms r ON b.room_id = r.id
       ORDER BY bh.created_at DESC`
    );
  }
};

export const add = BookingHistory.add;
export const getByBooking = BookingHistory.getByBooking;
export const getAllLogs = BookingHistory.getAllLogs;
export default BookingHistory;