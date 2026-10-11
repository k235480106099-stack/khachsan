import { query } from '../config/db.js';

// Lấy danh sách lịch trực lao công theo khách sạn
export async function getCleanersByHotel(req, res) {
  try {
    const { hotelId } = req.params;
    const cleaners = await query(
      "SELECT * FROM staff WHERE hotel_id = ? AND role = 'cleaner' ORDER BY work_date DESC",
      [hotelId]
    );
    res.json(cleaners);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Xếp ca cho lao công (ca ngày / ca đêm)
export async function assignCleanerShift(req, res) {
  try {
    const { hotel_id, full_name, shift, work_date, phone } = req.body;
    if (!hotel_id || !full_name || !shift || !work_date) {
      return res.status(400).json({ message: 'Thiếu thông tin xếp ca' });
    }
    if (!['day', 'night'].includes(shift)) {
      return res.status(400).json({ message: 'Ca trực không hợp lệ (day/night)' });
    }

    const result = await query(
      "INSERT INTO staff (hotel_id, full_name, role, shift, work_date, phone) VALUES (?, ?, 'cleaner', ?, ?, ?)",
      [hotel_id, full_name, shift, work_date, phone || '']
    );
    res.status(201).json({ message: 'Xếp ca thành công', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Cập nhật ca trực lao công
export async function updateCleanerShift(req, res) {
  try {
    const { id } = req.params;
    const { shift, work_date } = req.body;
    await query('UPDATE staff SET shift = ?, work_date = ? WHERE id = ?', [shift, work_date, id]);
    res.json({ message: 'Cập nhật ca trực thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Xoá lịch trực lao công
export async function deleteCleanerShift(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM staff WHERE id = ?', [id]);
    res.json({ message: 'Xoá lịch trực thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}