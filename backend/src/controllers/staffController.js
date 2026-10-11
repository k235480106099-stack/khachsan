import { query } from '../config/db.js';

// Lấy danh sách lễ tân theo khách sạn
export async function getStaffByHotel(req, res) {
  try {
    const { hotelId } = req.params;
    const staff = await query(
      "SELECT * FROM staff WHERE hotel_id = ? AND role = 'receptionist' ORDER BY work_date DESC",
      [hotelId]
    );
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Lấy toàn bộ nhân viên & ca trực của tất cả khách sạn cho Web Tổng
export async function getAllStaffOverview(req, res) {
  try {
    const list = await query(`
      SELECT s.*, h.name as hotel_name 
      FROM staff s
      JOIN hotels h ON s.hotel_id = h.id
      ORDER BY s.work_date DESC, s.hotel_id ASC
    `);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Xếp ca lễ tân (ca ngày / ca đêm)
export async function assignStaffShift(req, res) {
  try {
    const { hotel_id, full_name, shift, work_date, phone } = req.body;
    if (!hotel_id || !full_name || !shift || !work_date) {
      return res.status(400).json({ message: 'Thiếu thông tin xếp ca' });
    }
    if (!['day', 'night'].includes(shift)) {
      return res.status(400).json({ message: 'Ca trực không hợp lệ (day/night)' });
    }

    const result = await query(
      "INSERT INTO staff (hotel_id, full_name, role, shift, work_date, phone) VALUES (?, ?, 'receptionist', ?, ?, ?)",
      [hotel_id, full_name, shift, work_date, phone || '']
    );
    res.status(201).json({ message: 'Xếp ca lễ tân thành công', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Cập nhật ca trực
export async function updateStaffShift(req, res) {
  try {
    const { id } = req.params;
    const { shift, work_date } = req.body;
    await query('UPDATE staff SET shift = ?, work_date = ? WHERE id = ?', [shift, work_date, id]);
    res.json({ message: 'Cập nhật ca trực thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Xoá ca trực lễ tân
export async function deleteStaffShift(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM staff WHERE id = ?', [id]);
    res.json({ message: 'Xoá ca trực thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}
