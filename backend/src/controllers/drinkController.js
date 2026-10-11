import { Drink } from '../models/Drink.js';
import { DrinkOrder } from '../models/DrinkOrder.js';

// Lấy danh sách menu 5 loại đồ uống
export async function getDrinkMenu(req, res) {
  try {
    const list = await Drink.getAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Khách hàng gửi yêu cầu order đồ uống tại phòng
export async function createOrder(req, res) {
  try {
    const { hotel_id, room_number, guest_name, phone, note, items } = req.body;

    if (!hotel_id || !room_number) {
      return res.status(400).json({ message: 'Vui lòng chọn khách sạn và điền số phòng' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 loại đồ uống' });
    }

    // Tính tổng tiền
    let totalPrice = 0;
    const formattedItems = [];
    for (const item of items) {
      const drink = await Drink.getById(item.drink_id);
      if (!drink) continue;
      const qty = parseInt(item.quantity) || 1;
      const subtotal = drink.price * qty;
      totalPrice += subtotal;
      formattedItems.push({
        drink_id: drink.id,
        drink_name: drink.name,
        price: drink.price,
        quantity: qty,
        subtotal
      });
    }

    if (formattedItems.length === 0) {
      return res.status(400).json({ message: 'Các món đồ uống đã chọn không hợp lệ' });
    }

    const orderId = await DrinkOrder.create({
      hotel_id,
      room_number,
      guest_name: guest_name || `Khách phòng ${room_number}`,
      phone: phone || '',
      note: note || '',
      total_price: totalPrice,
      items: formattedItems
    });

    const createdOrder = await DrinkOrder.getById(orderId);

    res.status(201).json({
      message: 'Đặt đồ uống thành công! Tiếp tân đã nhận được yêu cầu và sẽ xác nhận ngay.',
      order: createdOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Lấy thông tin 1 đơn đồ uống (cho khách theo dõi trạng thái)
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await DrinkOrder.getById(id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn đồ uống' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Tiếp tân lấy danh sách đơn của khách sạn mình
export async function getOrdersByHotel(req, res) {
  try {
    const { hotelId } = req.params;
    const orders = await DrinkOrder.getByHotel(hotelId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Web Tổng lấy toàn bộ đơn đồ uống của 10 khách sạn
export async function getAllOrders(req, res) {
  try {
    const orders = await DrinkOrder.getAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Tiếp tân cập nhật trạng thái đơn (xác nhận, đang mang lên, đã giao xong, huỷ)
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed', 'delivering', 'completed', 'cancelled'

    const order = await DrinkOrder.getById(id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn đồ uống' });

    await DrinkOrder.updateStatus(id, status);

    // Gửi tự động 1 tin nhắn hệ thống nếu cần
    let statusText = '';
    if (status === 'confirmed') statusText = 'Tiếp tân đã XÁC NHẬN đơn. Đang chuẩn bị đồ uống.';
    else if (status === 'delivering') statusText = 'Đồ uống đang được nhân viên mang lên phòng của bạn.';
    else if (status === 'completed') statusText = 'Giao đồ uống thành công. Chúc quý khách ngon miệng!';
    else if (status === 'cancelled') statusText = 'Đơn đồ uống đã bị huỷ.';

    if (statusText) {
      await DrinkOrder.addMessage(id, 'staff', 'Lễ tân', statusText);
    }

    const updated = await DrinkOrder.getById(id);
    res.json({ message: 'Cập nhật trạng thái thành công', order: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Khách hàng nhắn tin giục giao đồ uống hoặc tiếp tân phản hồi
export async function addOrderMessage(req, res) {
  try {
    const { id } = req.params;
    const { message, sender_type, sender_name } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    const order = await DrinkOrder.getById(id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn đồ uống' });

    await DrinkOrder.addMessage(
      id,
      sender_type || 'guest',
      sender_name || (sender_type === 'staff' ? 'Lễ tân' : `Phòng ${order.room_number}`),
      message.trim()
    );

    const messages = await DrinkOrder.getMessages(id);
    res.json({ message: 'Đã gửi tin nhắn thành công', messages });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

// Lấy danh sách tin nhắn của 1 đơn
export async function getOrderMessages(req, res) {
  try {
    const { id } = req.params;
    const messages = await DrinkOrder.getMessages(id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}
