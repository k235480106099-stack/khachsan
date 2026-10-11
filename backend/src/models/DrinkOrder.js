import { query } from '../config/db.js';

export const DrinkOrder = {
  async create({ hotel_id, room_number, guest_name, phone, note, total_price, items }) {
    const res = await query(
      `INSERT INTO drink_orders (hotel_id, room_number, guest_name, phone, note, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [hotel_id, room_number, guest_name || '', phone || '', note || '', total_price]
    );
    const orderId = res.insertId;

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          `INSERT INTO drink_order_items (order_id, drink_id, drink_name, price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.drink_id, item.drink_name, item.price, item.quantity, item.subtotal]
        );
      }
    }

    return orderId;
  },

  async getById(id) {
    const rows = await query(
      `SELECT do.*, h.name as hotel_name
       FROM drink_orders do
       JOIN hotels h ON do.hotel_id = h.id
       WHERE do.id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const order = rows[0];

    order.items = await query(
      `SELECT doi.*, d.image_url 
       FROM drink_order_items doi 
       LEFT JOIN drinks d ON doi.drink_id = d.id 
       WHERE doi.order_id = ?`,
      [id]
    );

    order.messages = await query(
      `SELECT * FROM drink_order_messages WHERE order_id = ? ORDER BY created_at ASC`,
      [id]
    );

    return order;
  },

  async getByHotel(hotelId) {
    const orders = await query(
      `SELECT do.*, h.name as hotel_name,
              (SELECT COUNT(*) FROM drink_order_messages dom WHERE dom.order_id = do.id) as message_count,
              (SELECT dom.message FROM drink_order_messages dom WHERE dom.order_id = do.id ORDER BY dom.created_at DESC LIMIT 1) as latest_message
       FROM drink_orders do
       JOIN hotels h ON do.hotel_id = h.id
       WHERE do.hotel_id = ?
       ORDER BY do.created_at DESC`,
      [hotelId]
    );

    for (const order of orders) {
      order.items = await query(
        `SELECT doi.*, d.image_url 
         FROM drink_order_items doi 
         LEFT JOIN drinks d ON doi.drink_id = d.id 
         WHERE doi.order_id = ?`,
        [order.id]
      );
      order.messages = await query(
        `SELECT * FROM drink_order_messages WHERE order_id = ? ORDER BY created_at ASC`,
        [order.id]
      );
    }

    return orders;
  },

  async getAll() {
    const orders = await query(
      `SELECT do.*, h.name as hotel_name,
              (SELECT COUNT(*) FROM drink_order_messages dom WHERE dom.order_id = do.id) as message_count,
              (SELECT dom.message FROM drink_order_messages dom WHERE dom.order_id = do.id ORDER BY dom.created_at DESC LIMIT 1) as latest_message
       FROM drink_orders do
       JOIN hotels h ON do.hotel_id = h.id
       ORDER BY do.created_at DESC`
    );

    for (const order of orders) {
      order.items = await query(
        `SELECT doi.*, d.image_url 
         FROM drink_order_items doi 
         LEFT JOIN drinks d ON doi.drink_id = d.id 
         WHERE doi.order_id = ?`,
        [order.id]
      );
      order.messages = await query(
        `SELECT * FROM drink_order_messages WHERE order_id = ? ORDER BY created_at ASC`,
        [order.id]
      );
    }

    return orders;
  },

  async updateStatus(id, status) {
    return query(
      `UPDATE drink_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, id]
    );
  },

  async addMessage(orderId, senderType, senderName, message) {
    return query(
      `INSERT INTO drink_order_messages (order_id, sender_type, sender_name, message)
       VALUES (?, ?, ?, ?)`,
      [orderId, senderType, senderName || '', message]
    );
  },

  async getMessages(orderId) {
    return query(
      `SELECT * FROM drink_order_messages WHERE order_id = ? ORDER BY created_at ASC`,
      [orderId]
    );
  }
};

export default DrinkOrder;
