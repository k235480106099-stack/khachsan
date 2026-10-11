-- Dữ liệu mẫu 10 khách sạn, phòng, nội quy, nhân viên

-- 1. Chèn 10 Khách sạn
INSERT OR REPLACE INTO hotels (id, name, address, phone, map_url, description) VALUES
(1, 'Khách sạn Ánh Dương Hà Nội', '12 Phố Cổ, Hoàn Kiếm, Hà Nội', '02439881111', 'https://maps.google.com/maps?q=Hoan+Kiem+Hanoi&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Khách sạn tiêu chuẩn sang trọng trung tâm phố cổ Hà Nội.'),
(2, 'Khách sạn Biển Xanh Đà Nẵng', '88 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng', '02363982222', 'https://maps.google.com/maps?q=My+Khe+Beach+Da+Nang&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Tầm nhìn trực diện bãi biển Mỹ Khê Đà Nẵng thơ mộng.'),
(3, 'Khách sạn Sài Gòn Pearl TP.HCM', '45 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', '02838983333', 'https://maps.google.com/maps?q=District+1+Ho+Chi+Minh&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Khách sạn hiện đại giữa lòng trung tâm kinh tế sôi động.'),
(4, 'Khách sạn Ngàn Hoa Đà Lạt', '20 Trần Phú, Phường 3, Đà Lạt, Lâm Đồng', '02633984444', 'https://maps.google.com/maps?q=Xuan+Huong+Lake+Da+Lat&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Không gian lãng mạn, sương mờ giữa rừng thông Đà Lạt.'),
(5, 'Khách sạn Cát Vàng Nha Trang', '10 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa', '02583985555', 'https://maps.google.com/maps?q=Nha+Trang+Beach&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Thiên đường nghỉ dưỡng biển cát trắng nắng vàng Nha Trang.'),
(6, 'Khách sạn Hoàng Cung Huế', '5 Lê Lợi, Vĩnh Ninh, TP. Huế, Thừa Thiên Huế', '02343986666', 'https://maps.google.com/maps?q=Huong+River+Hue&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Kiến trúc cung đình cổ kính bên bờ sông Hương êm đềm.'),
(7, 'Khách sạn Đảo Ngọc Phú Quốc', '68 Trần Hưng Đạo, Dương Đông, Phú Quốc, Kiên Giang', '02973987777', 'https://maps.google.com/maps?q=Phu+Quoc+Island&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Resort cao cấp ngắm hoàng hôn biển đảo Phú Quốc.'),
(8, 'Khách sạn Hạ Long Bay View', '12 Đường Hạ Long, Bãi Cháy, TP. Hạ Long, Quảng Ninh', '02033988888', 'https://maps.google.com/maps?q=Ha+Long+Bay&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Khách sạn view toàn cảnh kỳ quan vịnh Hạ Long.'),
(9, 'Khách sạn Phố Hội Cổ An', '33 Cửa Đại, Cẩm Châu, TP. Hội An, Quảng Nam', '02353989999', 'https://maps.google.com/maps?q=Hoi+An+Ancient+Town&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Nét bình yên, đèn lồng rực rỡ phố cổ Hội An.'),
(10, 'Khách sạn Tây Đô Cần Thơ', '77 Hai Bà Trưng, Tân An, Ninh Kiều, Cần Thơ', '02923980000', 'https://maps.google.com/maps?q=Ninh+Kieu+Wharf+Can+Tho&t=&z=15&ie=UTF8&iwloc=&output=embed', 'Trải nghiệm văn hóa chợ nổi miền Tây sông nước Cần Thơ.');

-- 2. Chèn 4 Điều Nội Quy Bắt Buộc cho từng khách sạn
INSERT OR REPLACE INTO hotel_rules (id, hotel_id, rule_number, content) VALUES
(1, 1, 1, 'Cấm dẫn thú cưng vào khuôn viên và phòng khách sạn'),
(2, 1, 2, 'Cấm không được sử dụng, tàng trữ chất cấm, chất gây nghiện, chất dễ cháy nổ'),
(3, 1, 3, 'Không được gây gổ, đánh nhau làm mất trật tự và an ninh khách sạn'),
(4, 1, 4, 'Không được làm hư hại tài sản, trang thiết bị của khách sạn (bồi thường theo giá trị niêm yết)');

-- 3. Chèn Phòng cho Khách sạn 1..10 (Có phòng Thường và VIP, giá khác nhau)
INSERT OR REPLACE INTO rooms (id, hotel_id, room_number, type, price, status, description) VALUES
-- Hotel 1 (Hà Nội)
(1, 1, '101', 'normal', 500000, 'available', 'Phòng Tiêu Chuẩn 1 Giường Đôi, View Phố Cổ'),
(2, 1, '102', 'normal', 500000, 'available', 'Phòng Tiêu Chuẩn 2 Giường Đơn'),
(3, 1, '103', 'normal', 550000, 'using', 'Phòng Tiêu Chuẩn Tiện Nghi Đầy Đủ'),
(4, 1, '201', 'vip', 1200000, 'available', 'Phòng VIP Tổng Thống Ban Công Lớn, Bồn Tắm Sục'),
(5, 1, '202', 'vip', 1200000, 'available', 'Phòng VIP Sang Trọng View Hồ Gươm'),
-- Hotel 2 (Đà Nẵng)
(6, 2, '101', 'normal', 600000, 'available', 'Phòng Deluxe View Biển'),
(7, 2, '102', 'normal', 600000, 'available', 'Phòng Deluxe Gia Đình'),
(8, 2, '201', 'vip', 1500000, 'available', 'Phòng VIP Ocean Suite Cao Cấp'),
(9, 2, '202', 'vip', 1500000, 'available', 'Phòng VIP Tổng Thống View Biển Mỹ Khê'),
-- Hotel 3 (TP.HCM)
(10, 3, '301', 'normal', 700000, 'available', 'Phòng Hiện Đại Trung Tâm Q1'),
(11, 3, '302', 'normal', 700000, 'available', 'Phòng Studio Đầy Đủ Bếp'),
(12, 3, '401', 'vip', 1800000, 'available', 'Phòng VIP Penthouse View Landmark 81'),
-- Hotel 4 (Đà Lạt)
(13, 4, '101', 'normal', 450000, 'available', 'Phòng Đồi Thông Ban Công'),
(14, 4, '102', 'normal', 450000, 'available', 'Phòng Hoa Hồng Lãng Mạn'),
(15, 4, '201', 'vip', 1100000, 'available', 'Phòng VIP Villa Sân Vườn'),
-- Hotel 5 (Nha Trang)
(16, 5, '101', 'normal', 550000, 'available', 'Phòng View Bờ Biển'),
(17, 5, '201', 'vip', 1300000, 'available', 'Phòng VIP Horizon Suite'),
-- Hotel 6 (Huế)
(18, 6, '101', 'normal', 400000, 'available', 'Phòng Cung Đình Tiêu Chuẩn'),
(19, 6, '201', 'vip', 1000000, 'available', 'Phòng VIP Hoàng Gia Sông Hương'),
-- Hotel 7 (Phú Quốc)
(20, 7, '101', 'normal', 800000, 'available', 'Phòng Bungalow Vườn Dừa'),
(21, 7, '201', 'vip', 2000000, 'available', 'Phòng VIP Beachfront Sunset Villa'),
-- Hotel 8 (Hạ Long)
(22, 8, '101', 'normal', 650000, 'available', 'Phòng Hạ Long Tiêu Chuẩn'),
(23, 8, '201', 'vip', 1600000, 'available', 'Phòng VIP Du Thuyền Trên Cạn'),
-- Hotel 9 (Hội An)
(24, 9, '101', 'normal', 500000, 'available', 'Phòng Phố Đèn Lồng'),
(25, 9, '201', 'vip', 1250000, 'available', 'Phòng VIP Heritage House'),
-- Hotel 10 (Cần Thơ)
(26, 10, '101', 'normal', 420000, 'available', 'Phòng Miền Tây Phù Sa'),
(27, 10, '201', 'vip', 950000, 'available', 'Phòng VIP Sông Nước Tây Đô');

-- 4. Chèn Tài Khoản Đăng Nhập cho CẢ 10 KHÁCH SẠN
INSERT OR REPLACE INTO users (id, username, password, full_name, role, hotel_id) VALUES
(1, 'admin', 'admin123', 'Tổng Quản Lý Hệ Thống', 'admin', NULL),
-- Lễ tân 10 khách sạn (Tài khoản staff_1 .. staff_10 / mật khẩu 123456)
(2, 'staff_1', '123456', 'Lễ Tân - KS Ánh Dương Hà Nội', 'staff', 1),
(3, 'staff_2', '123456', 'Lễ Tân - KS Biển Xanh Đà Nẵng', 'staff', 2),
(4, 'staff_3', '123456', 'Lễ Tân - KS Sài Gòn Pearl TP.HCM', 'staff', 3),
(5, 'staff_4', '123456', 'Lễ Tân - KS Ngàn Hoa Đà Lạt', 'staff', 4),
(6, 'staff_5', '123456', 'Lễ Tân - KS Cát Vàng Nha Trang', 'staff', 5),
(7, 'staff_6', '123456', 'Lễ Tân - KS Hoàng Cung Huế', 'staff', 6),
(8, 'staff_7', '123456', 'Lễ Tân - KS Đảo Ngọc Phú Quốc', 'staff', 7),
(9, 'staff_8', '123456', 'Lễ Tân - KS Hạ Long Bay View', 'staff', 8),
(10, 'staff_9', '123456', 'Lễ Tân - KS Phố Hội Cổ An', 'staff', 9),
(11, 'staff_10', '123456', 'Lễ Tân - KS Tây Đô Cần Thơ', 'staff', 10),
-- Bí danh cho tài khoản cũ
(12, 'staff_hn', '123456', 'Nguyễn Văn Lễ Tân (Hà Nội)', 'staff', 1),
(13, 'cleaner_hn', '123456', 'Trần Thị Lao Công (Hà Nội)', 'cleaner', 1),
-- Lao công 10 khách sạn (Tài khoản cleaner_1 .. cleaner_10 / mật khẩu 123456)
(14, 'cleaner_1', '123456', 'Lao Công - KS Ánh Dương Hà Nội', 'cleaner', 1),
(15, 'cleaner_2', '123456', 'Lao Công - KS Biển Xanh Đà Nẵng', 'cleaner', 2),
(16, 'cleaner_3', '123456', 'Lao Công - KS Sài Gòn Pearl TP.HCM', 'cleaner', 3),
(17, 'cleaner_4', '123456', 'Lao Công - KS Ngàn Hoa Đà Lạt', 'cleaner', 4),
(18, 'cleaner_5', '123456', 'Lao Công - KS Cát Vàng Nha Trang', 'cleaner', 5),
(19, 'cleaner_6', '123456', 'Lao Công - KS Hoàng Cung Huế', 'cleaner', 6),
(20, 'cleaner_7', '123456', 'Lao Công - KS Đảo Ngọc Phú Quốc', 'cleaner', 7),
(21, 'cleaner_8', '123456', 'Lao Công - KS Hạ Long Bay View', 'cleaner', 8),
(22, 'cleaner_9', '123456', 'Lao Công - KS Phố Hội Cổ An', 'cleaner', 9),
(23, 'cleaner_10', '123456', 'Lao Công - KS Tây Đô Cần Thơ', 'cleaner', 10);

-- 5. Chèn Toàn Bộ Nhân Viên & Lao Công Cho CẢ 10 KHÁCH SẠN (Ca Ngày & Ca Đêm)
DELETE FROM staff;
INSERT INTO staff (id, hotel_id, full_name, role, shift, work_date, phone) VALUES
-- Hotel 1 (Hà Nội)
(1, 1, 'Nguyễn Văn Nam', 'receptionist', 'day', '2026-10-04', '0901111222'),
(2, 1, 'Trần Minh Đức', 'receptionist', 'night', '2026-10-04', '0903333444'),
(3, 1, 'Lê Thị Mai', 'cleaner', 'day', '2026-10-04', '0912222333'),
(4, 1, 'Phạm Thị Lan', 'cleaner', 'night', '2026-10-04', '0914444555'),

-- Hotel 2 (Đà Nẵng)
(5, 2, 'Lê Quốc Hưng', 'receptionist', 'day', '2026-10-04', '0905555666'),
(6, 2, 'Đặng Hoàng Long', 'receptionist', 'night', '2026-10-04', '0907777888'),
(7, 2, 'Nguyễn Thu Trang', 'cleaner', 'day', '2026-10-04', '0918888999'),
(8, 2, 'Võ Thị Hoa', 'cleaner', 'night', '2026-10-04', '0907777888'),

-- Hotel 3 (TP.HCM)
(9, 3, 'Huỳnh Gia Bảo', 'receptionist', 'day', '2026-10-04', '0981112233'),
(10, 3, 'Phan Thanh Tùng', 'receptionist', 'night', '2026-10-04', '0982223344'),
(11, 3, 'Bùi Ánh Tuyết', 'cleaner', 'day', '2026-10-04', '0983334455'),
(12, 3, 'Đỗ Thị Thảo', 'cleaner', 'night', '2026-10-04', '0984445566'),

-- Hotel 4 (Đà Lạt)
(13, 4, 'Trương Đình Khôi', 'receptionist', 'day', '2026-10-04', '0971112233'),
(14, 4, 'Vũ Đức Thịnh', 'receptionist', 'night', '2026-10-04', '0972223344'),
(15, 4, 'Hồ Ngọc Hà', 'cleaner', 'day', '2026-10-04', '0973334455'),
(16, 4, 'Lâm Bích Ngọc', 'cleaner', 'night', '2026-10-04', '0974445566'),

-- Hotel 5 (Nha Trang)
(17, 5, 'Dương Quang Hưng', 'receptionist', 'day', '2026-10-04', '0961112233'),
(18, 5, 'Cao Nhật Minh', 'receptionist', 'night', '2026-10-04', '0962223344'),
(19, 5, 'Lý Mỹ Linh', 'cleaner', 'day', '2026-10-04', '0963334455'),
(20, 5, 'Trần Bích Thủy', 'cleaner', 'night', '2026-10-04', '0964445566'),

-- Hotel 6 (Huế)
(21, 6, 'Nguyễn Phúc Vĩnh', 'receptionist', 'day', '2026-10-04', '0931112233'),
(22, 6, 'Lê Văn Cung', 'receptionist', 'night', '2026-10-04', '0932223344'),
(23, 6, 'Tôn Nữ Diệu Tâm', 'cleaner', 'day', '2026-10-04', '0933334455'),
(24, 6, 'Hoàng Thị Nguyệt', 'cleaner', 'night', '2026-10-04', '0934445566'),

-- Hotel 7 (Phú Quốc)
(25, 7, 'Mai Trọng Tín', 'receptionist', 'day', '2026-10-04', '0941112233'),
(26, 7, 'Đoàn Hữu Phước', 'receptionist', 'night', '2026-10-04', '0942223344'),
(27, 7, 'Ngô Thanh Vân', 'cleaner', 'day', '2026-10-04', '0943334455'),
(28, 7, 'Lưu Cẩm Tú', 'cleaner', 'night', '2026-10-04', '0944445566'),

-- Hotel 8 (Hạ Long)
(29, 8, 'Chu Văn An', 'receptionist', 'day', '2026-10-04', '0911112233'),
(30, 8, 'Tạ Quang Bửu', 'receptionist', 'night', '2026-10-04', '0912223344'),
(31, 8, 'Vương Hải Yến', 'cleaner', 'day', '2026-10-04', '0913334455'),
(32, 8, 'Hà Thị Phương', 'cleaner', 'night', '2026-10-04', '0914445566'),

-- Hotel 9 (Hội An)
(33, 9, 'Trịnh Công Sơn', 'receptionist', 'day', '2026-10-04', '0921112233'),
(34, 9, 'Đỗ Nhuận', 'receptionist', 'night', '2026-10-04', '0922223344'),
(35, 9, 'Nguyễn Thị Sen', 'cleaner', 'day', '2026-10-04', '0923334455'),
(36, 9, 'Phan Kim Chi', 'cleaner', 'night', '2026-10-04', '0924445566'),

-- Hotel 10 (Cần Thơ)
(37, 10, 'Võ Văn Kiệt', 'receptionist', 'day', '2026-10-04', '0951112233'),
(38, 10, 'Phạm Hùng', 'receptionist', 'night', '2026-10-04', '0952223344'),
(39, 10, 'Lê Thị Hồng', 'cleaner', 'day', '2026-10-04', '0953334455'),
(40, 10, 'Đinh Thị Cúc', 'cleaner', 'night', '2026-10-04', '0954445566');

-- 6. Đơn Đặt Phòng Mẫu
INSERT OR IGNORE INTO bookings (id, hotel_id, room_id, guest_name, phone, email, check_in, check_out, total_price, status) VALUES
(1, 1, 3, 'Hoàng Văn Quân', '0988777666', 'quan.hoang@gmail.com', '2026-10-03 14:00', '2026-10-05 12:00', 1100000, 'checked_in');

INSERT OR IGNORE INTO booking_histories (booking_id, action, reason) VALUES
(1, 'created', 'Đặt phòng qua web'),
(1, 'checked_in', 'Lễ tân hoàn tất nhận phòng');

-- 7. Danh Mục 7 Loại Đồ Uống Phục Vụ Tại Phòng (Room Service)
INSERT OR REPLACE INTO drinks (id, name, category, price, image_url, description) VALUES
(1, 'Trà Ô Long TEA+ PLUS Suntory (450ml)', 'Trà đóng chai', 15000, '/drinks/teaplus.webp', 'Trà Ô Long thanh mát, hỗ trợ hạn chế hấp thu chất béo (OTPP)'),
(2, 'Nước Ngọt 7UP Hương Chanh (Lon 330ml)', 'Nước có ga', 15000, '/drinks/7up.jpg', 'Nước giải khát có ga hương chanh tự nhiên, sảng khoái mát lạnh'),
(3, 'Nước Tinh Khiết Aquafina (Chai 500ml)', 'Nước khoáng tinh khiết', 10000, '/drinks/aquafina.jpg', 'Nước uống tinh khiết xử lý qua quy trình lọc Hydro-7 tiêu chuẩn'),
(4, 'Nước Ngọt Coca-Cola Vị Nguyên Bản (Lon 320ml)', 'Nước có ga', 15000, '/drinks/cocacola.jpg', 'Hương vị thơm ngon truyền thống, giải khát tức thì sảng khoái'),
(5, 'Trà Xanh Không Độ Vị Chanh (Chai 500ml)', 'Trà đóng chai', 15000, '/drinks/khongdo.jpg', 'Được chiết xuất từ lá trà xanh Thái Nguyên, giàu EGCG giải nhiệt cuộc sống'),
(6, 'Bia Hà Nội Habeco (Lon 330ml)', 'Bia & Có cồn', 20000, '/drinks/bia_hanoi.png', 'Bia Hà Nội truyền thống tinh hoa, hương vị đậm đà thơm mát ướp lạnh'),
(7, 'Nước Tăng Lực Bò Húc Red Bull (Lon 250ml)', 'Nước tăng lực', 30000, '/drinks/bo_huc.png', 'Nước tăng lực Red Bull nạp năng lượng tức thì, tỉnh táo sảng khoái');

