import { Room } from '../models/Room.js';
import { query } from '../config/db.js';

export async function getRoomsByHotel(req, res) {
  try {
    const { hotelId } = req.params;
    const rooms = await Room.getByHotel(hotelId);
    const stats = await Room.getStatsByHotel(hotelId);

    // Gắn nhãn trạng thái FULL cho từng phòng dựa theo loại (thường hoặc vip)
    const enrichedRooms = rooms.map((room) => {
      const isFull = room.type === 'vip' ? stats.is_vip_full : stats.is_normal_full;
      return {
        ...room,
        is_full: isFull || room.status !== 'available'
      };
    });

    res.json(enrichedRooms);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function updateRoomStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['available', 'using', 'cleaning', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái phòng không hợp lệ' });
    }
    await Room.updateStatus(id, status);
    res.json({ message: 'Cập nhật trạng thái phòng thành công', id, status });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function createRoom(req, res) {
  try {
    const { hotel_id, room_number, type, price, description } = req.body;
    if (!hotel_id || !room_number || !type || !price) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin phòng' });
    }
    const result = await query(
      "INSERT INTO rooms (hotel_id, room_number, type, price, status, description) VALUES (?, ?, ?, ?, 'available', ?)",
      [hotel_id, room_number, type, price, description || '']
    );
    res.status(201).json({ message: 'Thêm phòng thành công', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ message: 'Xoá phòng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

