import { query } from '../config/db.js';

export const Guest = {
  async findOrCreate(fullName, phone, email = '') {
    const existing = await query('SELECT * FROM guests WHERE phone = ?', [phone]);
    if (existing.length > 0) return existing[0];

    const result = await query(
      'INSERT INTO guests (full_name, phone, email) VALUES (?, ?, ?)',
      [fullName, phone, email]
    );
    return { id: result.insertId, full_name: fullName, phone, email };
  }
};

export default Guest;
