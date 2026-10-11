import { Hotel } from '../models/Hotel.js';
import { Rule } from '../models/Rule.js';
import { Room } from '../models/Room.js';

export async function getAllHotels(req, res) {
  try {
    const hotels = await Hotel.getAll();
    // Bổ sung thông tin phòng và tình trạng FULL cho từng khách sạn
    const enriched = await Promise.all(
      hotels.map(async (h) => {
        const stats = await Room.getStatsByHotel(h.id);
        return {
          ...h,
          total_rooms: stats.total_rooms,
          total_normal: stats.total_normal,
          total_vip: stats.total_vip,
          total_available: stats.total_available,
          is_normal_full: stats.is_normal_full,
          is_vip_full: stats.is_vip_full,
          is_fully_booked: stats.total_available === 0
        };
      })
    );
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function getHotelById(req, res) {
  try {
    const { id } = req.params;
    const hotel = await Hotel.getById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }
    const rules = await Rule.getByHotel(id);
    const stats = await Room.getStatsByHotel(id);

    res.json({
      ...hotel,
      rules,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function createHotel(req, res) {
  try {
    const { name, address, phone, map_url, description } = req.body;
    if (!name || !address) {
      return res.status(400).json({ message: 'Tên và địa chỉ khách sạn là bắt buộc' });
    }
    const result = await Hotel.create({ name, address, phone, map_url, description });
    res.status(201).json({ message: 'Tạo khách sạn thành công', id: result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function updateHotel(req, res) {
  try {
    const { id } = req.params;
    const { name, address, phone, map_url, description } = req.body;
    await Hotel.update(id, { name, address, phone, map_url, description });
    res.json({ message: 'Cập nhật khách sạn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function deleteHotel(req, res) {
  try {
    const { id } = req.params;
    await Hotel.delete(id);
    res.json({ message: 'Xoá khách sạn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}
