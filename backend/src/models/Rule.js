import { query } from '../config/db.js';

// Lấy 4 nội quy bắt buộc của khách sạn (từ bảng hotel_rules)
export const Rule = {
  async getByHotel(hotelId) {
    return query(
      'SELECT * FROM hotel_rules WHERE hotel_id = ? OR hotel_id IS NULL ORDER BY rule_number ASC',
      [hotelId]
    );
  },

  async findByHotel(hotelId) {
    return query(
      'SELECT * FROM hotel_rules WHERE hotel_id = ? OR hotel_id IS NULL ORDER BY rule_number ASC',
      [hotelId]
    );
  },

  async create({ hotel_id, rule_number, content }) {
    const result = await query(
      'INSERT INTO hotel_rules (hotel_id, rule_number, content) VALUES (?, ?, ?)',
      [hotel_id || null, rule_number || 1, content]
    );
    return result.insertId;
  },

  async remove(id) {
    await query('DELETE FROM hotel_rules WHERE id = ?', [id]);
  }
};

export const findByHotel = Rule.findByHotel;
export const getByHotel = Rule.getByHotel;
export const create = Rule.create;
export const remove = Rule.remove;
export default Rule;