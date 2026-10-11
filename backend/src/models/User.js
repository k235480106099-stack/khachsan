import { query } from '../config/db.js';

export const User = {
  async getByUsername(username) {
    const rows = await query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async getById(id) {
    const rows = await query('SELECT id, username, full_name, role, hotel_id, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async getAll() {
    return query('SELECT id, username, full_name, role, hotel_id, created_at FROM users ORDER BY id ASC');
  }
};

export default User;
