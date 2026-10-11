import { query } from '../config/db.js';

export async function initDrinksDB() {
  console.log('--- Khởi tạo bảng Drinks & Orders ---');
  await query(`
    CREATE TABLE IF NOT EXISTS drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'Đồ uống đóng chai',
      price INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT,
      is_available INTEGER DEFAULT 1
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS drink_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hotel_id INTEGER NOT NULL,
      room_number VARCHAR(50) NOT NULL,
      guest_name VARCHAR(255),
      phone VARCHAR(50),
      total_price INTEGER NOT NULL,
      note TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS drink_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      drink_id INTEGER NOT NULL,
      drink_name VARCHAR(255) NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES drink_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (drink_id) REFERENCES drinks(id) ON DELETE CASCADE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS drink_order_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      sender_type VARCHAR(50) NOT NULL,
      sender_name VARCHAR(255),
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES drink_orders(id) ON DELETE CASCADE
    );
  `);

  // Xóa cũ và nạp 5 sản phẩm tương ứng 5 ảnh khách gửi
  await query('DELETE FROM drinks');
  await query(`
    INSERT INTO drinks (id, name, category, price, image_url, description) VALUES
    (1, 'Trà Ô Long TEA+ PLUS Suntory (450ml)', 'Trà đóng chai', 15000, '/drinks/teaplus.webp', 'Trà Ô Long thanh mát, hỗ trợ hạn chế hấp thu chất béo (OTPP)'),
    (2, 'Nước Ngọt 7UP Hương Chanh (Lon 330ml)', 'Nước có ga', 15000, '/drinks/7up.jpg', 'Nước giải khát có ga hương chanh tự nhiên, sảng khoái mát lạnh'),
    (3, 'Nước Tinh Khiết Aquafina (Chai 500ml)', 'Nước khoáng tinh khiết', 10000, '/drinks/aquafina.jpg', 'Nước uống tinh khiết xử lý qua quy trình lọc Hydro-7 tiêu chuẩn'),
    (4, 'Nước Ngọt Coca-Cola Vị Nguyên Bản (Lon 320ml)', 'Nước có ga', 15000, '/drinks/cocacola.jpg', 'Hương vị thơm ngon truyền thống, giải khát tức thì sảng khoái'),
    (5, 'Trà Xanh Không Độ Vị Chanh (Chai 500ml)', 'Trà đóng chai', 15000, '/drinks/khongdo.jpg', 'Được chiết xuất từ lá trà xanh Thái Nguyên, giàu EGCG giải nhiệt cuộc sống'),
    (6, 'Bia Hà Nội Habeco (Lon 330ml)', 'Bia & Có cồn', 20000, '/drinks/bia_hanoi.png', 'Bia Hà Nội truyền thống tinh hoa, hương vị đậm đà thơm mát ướp lạnh'),
    (7, 'Nước Tăng Lực Bò Húc Red Bull (Lon 250ml)', 'Nước tăng lực', 30000, '/drinks/bo_huc.png', 'Nước tăng lực Red Bull nạp năng lượng tức thì, tỉnh táo sảng khoái');
  `);

  const list = await query('SELECT * FROM drinks');
  console.log('✅ Đã nạp thành công menu 5 loại đồ uống:', list.map(d => `${d.id}. ${d.name} (${d.price}đ)`));
}

// Nếu gọi trực tiếp
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  initDrinksDB().catch(console.error);
}
