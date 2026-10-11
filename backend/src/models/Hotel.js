import { query } from '../config/db.js';

export const Hotel = {
  async getAll() {
    return query('SELECT * FROM hotels ORDER BY id ASC');
  },

  async getById(id) {
    const rows = await query('SELECT * FROM hotels WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, address, phone, map_url, description }) {
    const res = await query(
      'INSERT INTO hotels (name, address, phone, map_url, description) VALUES (?, ?, ?, ?, ?)',
      [name, address, phone || '', map_url || '', description || '']
    );
    return res.insertId;
  },

  async update(id, { name, address, phone, map_url, description }) {
    return query(
      'UPDATE hotels SET name = ?, address = ?, phone = ?, map_url = ?, description = ? WHERE id = ?',
      [name, address, phone || '', map_url || '', description || '', id]
    );
  },

  async delete(id) {
    return query('DELETE FROM hotels WHERE id = ?', [id]);
  }
};

export default Hotel;
