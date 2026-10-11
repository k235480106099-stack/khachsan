import { query } from '../config/db.js';

export const Room = {
  async getByHotel(hotelId) {
    return query('SELECT * FROM rooms WHERE hotel_id = ? ORDER BY room_number ASC', [hotelId]);
  },

  async getById(id) {
    const rows = await query('SELECT * FROM rooms WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    return query('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
  },

  async getStatsByHotel(hotelId) {
    const rows = await query(
      `SELECT 
        COUNT(*) as total_rooms,
        SUM(CASE WHEN type = 'normal' THEN 1 ELSE 0 END) as total_normal,
        SUM(CASE WHEN type = 'vip' THEN 1 ELSE 0 END) as total_vip,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as total_available,
        SUM(CASE WHEN type = 'normal' AND status = 'available' THEN 1 ELSE 0 END) as available_normal,
        SUM(CASE WHEN type = 'vip' AND status = 'available' THEN 1 ELSE 0 END) as available_vip
       FROM rooms WHERE hotel_id = ?`,
      [hotelId]
    );
    const stat = rows[0] || {};
    return {
      total_rooms: Number(stat.total_rooms || 0),
      total_normal: Number(stat.total_normal || 0),
      total_vip: Number(stat.total_vip || 0),
      total_available: Number(stat.total_available || 0),
      is_normal_full: Number(stat.available_normal || 0) === 0,
      is_vip_full: Number(stat.available_vip || 0) === 0
    };
  }
};

export default Room;
