import { query } from '../config/db.js';

export const Staff = {
  async getByHotel(hotelId) {
    return query(
      "SELECT * FROM staff WHERE hotel_id = ? AND role = 'receptionist' ORDER BY work_date DESC",
      [hotelId]
    );
  },

  async addShift(hotelId, fullName, shift, workDate, phone = '') {
    return query(
      "INSERT INTO staff (hotel_id, full_name, role, shift, work_date, phone) VALUES (?, ?, 'receptionist', ?, ?, ?)",
      [hotelId, fullName, shift, workDate, phone]
    );
  },

  async delete(id) {
    return query('DELETE FROM staff WHERE id = ?', [id]);
  }
};

export default Staff;
