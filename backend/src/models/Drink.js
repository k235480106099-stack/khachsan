import { query } from '../config/db.js';

export const Drink = {
  async getAll() {
    return query('SELECT * FROM drinks WHERE is_available = 1 ORDER BY id ASC');
  },

  async getById(id) {
    const rows = await query('SELECT * FROM drinks WHERE id = ?', [id]);
    return rows[0] || null;
  }
};

export default Drink;
