import { query } from '../config/db.js';

export const Booking = {
  async create(data) {
    const { hotel_id, room_id, guest_name, phone, email, check_in, check_out, total_price } = data;
    const res = await query(
      `INSERT INTO bookings (hotel_id, room_id, guest_name, phone, email, check_in, check_out, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked')`,
      [hotel_id, room_id, guest_name, phone, email, check_in, check_out, total_price]
    );
    return res.insertId;
  },

  async getById(id) {
    const rows = await query(
      `SELECT b.*, b.guest_name as full_name, h.name as hotel_name, r.room_number, r.type as room_type, r.type as type 
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       JOIN rooms r ON b.room_id = r.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async getByHotel(hotelId) {
    return query(
      `SELECT b.*, b.guest_name as full_name, h.name as hotel_name, r.room_number, r.type as room_type, r.type as type,
              (SELECT 1 FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'deposit_paid' LIMIT 1) as is_deposited,
              (SELECT 1 FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'reminded_deposit' LIMIT 1) as is_reminded,
              (SELECT bh.reason FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'cancelled' ORDER BY bh.created_at DESC LIMIT 1) as cancel_reason
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       JOIN rooms r ON b.room_id = r.id
       WHERE b.hotel_id = ?
       ORDER BY b.created_at DESC`,
      [hotelId]
    );
  },

  async getAll() {
    return query(
      `SELECT b.*, b.guest_name as full_name, h.name as hotel_name, r.room_number, r.type as room_type, r.type as type,
              (SELECT 1 FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'deposit_paid' LIMIT 1) as is_deposited,
              (SELECT 1 FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'reminded_deposit' LIMIT 1) as is_reminded,
              (SELECT bh.reason FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'cancelled' ORDER BY bh.created_at DESC LIMIT 1) as cancel_reason
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       JOIN rooms r ON b.room_id = r.id
       ORDER BY b.created_at DESC`
    );
  },

  async getByGuestPhone(phone) {
    return query(
      `SELECT b.*, b.guest_name as full_name, h.name as hotel_name, r.room_number, r.type as room_type, r.type as type,
              (SELECT 1 FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'deposit_paid' LIMIT 1) as is_deposited,
              (SELECT 1 FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'reminded_deposit' LIMIT 1) as is_reminded,
              (SELECT bh.reason FROM booking_histories bh WHERE bh.booking_id = b.id AND bh.action = 'cancelled' ORDER BY bh.created_at DESC LIMIT 1) as cancel_reason
       FROM bookings b
       JOIN hotels h ON b.hotel_id = h.id
       JOIN rooms r ON b.room_id = r.id
       WHERE b.phone = ?
       ORDER BY b.created_at DESC`,
      [phone]
    );
  },

  async updateStatus(id, status) {
    return query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
  }
};

export const create = Booking.create;
export const getById = Booking.getById;
export const getByHotel = Booking.getByHotel;
export const getAll = Booking.getAll;
export const getByGuestPhone = Booking.getByGuestPhone;
export const updateStatus = Booking.updateStatus;
export default Booking;