import { Booking } from '../models/Booking.js';
import { BookingHistory } from '../models/BookingHistory.js';
import { Room } from '../models/Room.js';
import { Hotel } from '../models/Hotel.js';
import { Guest } from '../models/Guest.js';
import { calculateStayDuration, formatCurrency } from '../utils/helpers.js';

export async function createBooking(req, res) {
  try {
    const { room_id, full_name, phone, email, check_in, check_out } = req.body;
    if (!room_id || !full_name || !phone || !check_in || !check_out) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
    }

    const room = await Room.getById(room_id);
    if (!room) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }
    if (room.status !== 'available') {
      return res.status(400).json({ message: 'Phòng này hiện đã có người đặt hoặc đang sử dụng (FULL)' });
    }

    const hotel = await Hotel.getById(room.hotel_id);

    // Tính tiền theo số ngày/đêm
    const { days } = calculateStayDuration(check_in, check_out);
    const totalPrice = Number(room.price) * days;
    const depositAmount = Math.round(totalPrice * 0.3); // Tiền cọc 30%

    // Lưu khách
    await Guest.findOrCreate(full_name, phone, email);

    // Tạo đơn đặt phòng
    const bookingId = await Booking.create({
      hotel_id: room.hotel_id,
      room_id,
      guest_name: full_name,
      phone,
      email,
      check_in,
      check_out,
      total_price: totalPrice
    });

    // Cập nhật trạng thái phòng sang 'using'
    await Room.updateStatus(room_id, 'using');

    // Lưu vào nhật ký lịch sử đặt phòng cho Web Tổng
    await BookingHistory.add(
      bookingId,
      'created',
      `Khách hàng đặt phòng qua Website. Cần cọc 30% (${formatCurrency(depositAmount)})`
    );

    res.status(201).json({
      message: 'Khởi tạo đơn đặt phòng thành công',
      bookingId,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      days,
      room_number: room.room_number,
      room_type: room.type,
      hotel_name: hotel?.name || `Khách sạn #${room.hotel_id}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function confirmDeposit(req, res) {
  try {
    const { id } = req.params;
    const { deposit_amount } = req.body;
    const booking = await Booking.getById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đặt phòng' });
    }

    const amount = deposit_amount || Math.round(Number(booking.total_price) * 0.3);

    // Ghi nhận vào nhật ký
    await BookingHistory.add(
      id,
      'deposit_paid',
      `Khách hàng đã xác nhận thanh toán tiền cọc ${formatCurrency(amount)} qua mã QR ngân hàng`
    );

    res.json({
      message: 'Xác nhận cọc phòng thành công! Khách sạn đã ghi nhận tiền cọc của bạn.',
      deposit_amount: amount,
      booking_id: id
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Lễ tân gửi thông báo nhắc khách chuyển khoản tiền cọc
export async function remindDeposit(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body || {};
    const booking = await Booking.getById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đặt phòng' });
    }

    const depositVal = Math.round(Number(booking.total_price) * 0.3);
    const defaultNote = `Lễ tân đã liên hệ/nhắc khách (${booking.guest_name} - SĐT: ${booking.phone}) chuyển khoản cọc 30% (${formatCurrency(depositVal)}) qua mã QR.`;
    const finalNote = message || defaultNote;

    await BookingHistory.add(id, 'reminded_deposit', finalNote);

    res.json({
      message: 'Đã gửi thông báo nhắc cọc thành công và lưu vào nhật ký',
      bookingId: id,
      note: finalNote
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Huỷ đặt phòng (hỗ trợ lý do từ Lễ tân khi khách không đồng ý cọc)
export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const booking = await Booking.getById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đặt phòng' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Đơn này đã được huỷ trước đó' });
    }

    // Đổi trạng thái đơn sang 'cancelled'
    await Booking.updateStatus(id, 'cancelled');

    // Trả phòng lại trạng thái 'available' để khách khác có thể đặt
    await Room.updateStatus(booking.room_id, 'available');

    // Lưu lý do huỷ phòng vào lịch sử cho Web Tổng theo dõi
    const cancelReason = reason || 'Khách hàng yêu cầu huỷ đặt phòng';
    await BookingHistory.add(id, 'cancelled', cancelReason);

    res.json({
      message: 'Huỷ đặt phòng thành công, phòng đã được mở lại cho khách khác đặt',
      bookingId: id,
      reason: cancelReason
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function checkIn(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.getById(id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    await Booking.updateStatus(id, 'checked_in');
    await Room.updateStatus(booking.room_id, 'using');
    await BookingHistory.add(id, 'checked_in', 'Lễ tân đã check-in cho khách nhận phòng');

    res.json({ message: 'Nhận phòng (Check-in) thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function checkOut(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.getById(id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    await Booking.updateStatus(id, 'checked_out');
    // Trả phòng -> Chuyển sang chờ dọn dẹp
    await Room.updateStatus(booking.room_id, 'cleaning');
    await BookingHistory.add(id, 'checked_out', 'Khách trả phòng (Check-out) - chuyển lao công dọn');

    res.json({ message: 'Trả phòng (Check-out) thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function getBookingHistoryByGuest(req, res) {
  try {
    const { phone } = req.params;
    const bookings = await Booking.getByGuestPhone(phone);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function getBookingHistoryByHotel(req, res) {
  try {
    const { hotelId } = req.params;
    const bookings = await Booking.getByHotel(hotelId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.getAll();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function getBookingLogs(req, res) {
  try {
    const { id } = req.params;
    const logs = await BookingHistory.getByBooking(id);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function getAllBookingLogs(req, res) {
  try {
    const logs = await BookingHistory.getAllLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export const checkinBooking = checkIn;
export const checkoutBooking = checkOut;

