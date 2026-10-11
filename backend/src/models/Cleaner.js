import { query } from '../config/db.js';

export async function findByHotel(hotelId) {
  return query(
    'SELECT * FROM staff WHERE hotel_id = ? AND role = "cleaner" ORDER BY work_date DESC',
    [hotelId]
  );
}

export async function create({ hotel_id, full_name, shift, work_date }) {
  const result = await query(
    'INSERT INTO staff (hotel_id, full_name, role, shift, work_date) VALUES (?, ?, "cleaner", ?, ?)',
    [hotel_id, full_name, shift, work_date]
  );
  return result.insertId;
}

export async function updateShift(id, { shift, work_date }) {
  await query('UPDATE staff SET shift = ?, work_date = ? WHERE id = ?', [shift, work_date, id]);
}

export async function remove(id) {
  await query('DELETE FROM staff WHERE id = ?', [id]);
}