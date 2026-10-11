import { query } from '../config/db.js';
import { Room } from '../models/Room.js';

export async function getOverallStats(req, res) {
  try {
    const hotelCount = await query('SELECT COUNT(*) as count FROM hotels');
    const bookingStats = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as total_booked,
        SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as total_using,
        SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as total_checked_out,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as total_cancelled
      FROM bookings
    `);

    const roomStats = await query(`
      SELECT 
        COUNT(*) as total_rooms,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as total_available,
        SUM(CASE WHEN status = 'using' THEN 1 ELSE 0 END) as total_using_rooms,
        SUM(CASE WHEN status = 'cleaning' THEN 1 ELSE 0 END) as total_cleaning
      FROM rooms
    `);

    const staffCount = await query('SELECT COUNT(*) as count FROM staff');

    const byHotel = await query(`
      SELECT 
        h.id as hotel_id,
        h.name as hotel_name,
        h.address,
        COUNT(r.id) as total_rooms,
        SUM(CASE WHEN r.status = 'available' THEN 1 ELSE 0 END) as total_available,
        SUM(CASE WHEN r.status = 'using' THEN 1 ELSE 0 END) as total_using,
        SUM(CASE WHEN r.status = 'cleaning' THEN 1 ELSE 0 END) as total_cleaning,
        (SELECT COUNT(*) FROM bookings b WHERE b.hotel_id = h.id AND b.status = 'booked') as total_booked,
        (SELECT COUNT(*) FROM bookings b WHERE b.hotel_id = h.id AND b.status = 'checked_out') as total_checked_out,
        (SELECT COUNT(*) FROM bookings b WHERE b.hotel_id = h.id AND b.status = 'cancelled') as total_cancelled
      FROM hotels h
      LEFT JOIN rooms r ON h.id = r.hotel_id
      GROUP BY h.id
      ORDER BY h.id ASC
    `);

    const b = bookingStats[0] || {};
    const r = roomStats[0] || {};

    res.json({
      total_hotels: hotelCount[0]?.count || 0,
      total_staff: staffCount[0]?.count || 0,
      bookings: {
        total: Number(b.total_bookings || 0),
        booked: Number(b.total_booked || 0),
        using: Number(b.total_using || 0),
        checked_out: Number(b.total_checked_out || 0),
        cancelled: Number(b.total_cancelled || 0)
      },
      rooms: {
        total: Number(r.total_rooms || 0),
        available: Number(r.total_available || 0),
        using: Number(r.total_using_rooms || 0),
        cleaning: Number(r.total_cleaning || 0)
      },
      by_hotel: byHotel
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function getHotelStats(req, res) {
  try {
    const { hotelId } = req.params;
    const roomStats = await Room.getStatsByHotel(hotelId);

    const bookingRows = await query(`
      SELECT 
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as total_booked,
        SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as total_using,
        SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as total_checked_out,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as total_cancelled
      FROM bookings
      WHERE hotel_id = ?
    `, [hotelId]);

    const b = bookingRows[0] || {};

    res.json({
      rooms: roomStats,
      bookings: {
        total_booked: Number(b.total_booked || 0),
        total_using: Number(b.total_using || 0),
        total_checked_out: Number(b.total_checked_out || 0),
        total_cancelled: Number(b.total_cancelled || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}
