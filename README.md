# 🏨 Hệ Thống Quản Lý Chuỗi 10 Khách Sạn (Hotel Management Multi-Site)

Hệ thống quản lý chuỗi 10 khách sạn toàn diện, gồm 1 Web Tổng Quản Lý + 10 Website Khách Sạn Thành Viên + Phân Hệ Nhân Viên (Lễ Tân & Lao Công) + Cơ sở dữ liệu SQLite tự động tích hợp sẵn.

---

## 🏗️ Cấu Trúc Dự Án

* `database/`: Chứa file `schema.sql` (cấu trúc bảng) và `seed.sql` (dữ liệu mẫu 10 khách sạn, phòng thường/VIP, 4 nội quy, tài khoản, ca trực).
* `backend/`: API Server Node.js / Express (Cổng 5000) kết nối CSDL SQLite tự động nạp.
* `frontend-master/`: Web Tổng Quản Lý (Cổng 3000) - Theo dõi realtime số người đặt, trả phòng, đang ở, huỷ phòng, ca trực ngày/đêm và link mở 10 web khách sạn con.
* `frontend-hotel/`: Web Đặt Phòng cho 10 Khách Sạn (Cổng 3001) - Chọn khách sạn qua `?hotelId=1..10`, hiển thị bản đồ Google Maps, 4 nội quy bắt buộc, giá phòng thường/VIP, tự động báo nhãn đỏ **FULL / HẾT PHÒNG** khi hết phòng.
* `frontend-staff/`: Web Tác Nghiệp Lễ Tân & Lao Công (Cổng 3002) - Check-in, Check-out, giao ca trực ngày/đêm, cập nhật trạng thái phòng đã dọn dẹp.

---

## 🚀 Hướng Dẫn Khởi Chạy Trong Visual Studio Code

Mở 4 tab Terminal trong VS Code và gõ lệnh theo thứ tự sau:

### 🔹 Terminal 1: Chạy Backend API (Port 5000)
```bash
cd backend
npm run dev
```
*(Hệ thống sẽ tự động tạo file `hotel.db` và nạp sẵn 10 khách sạn cùng dữ liệu mẫu)*

### 🔹 Terminal 2: Chạy Web Tổng Quản Lý (Port 3000)
```bash
cd frontend-master
npm run dev -- --port 3000
```
Truy cập: `http://localhost:3000` (Tài khoản: `admin` / Mật khẩu: `admin123`)

### 🔹 Terminal 3: Chạy Web Đặt Phòng 10 Khách Sạn (Port 3001)
```bash
cd frontend-hotel
npm run dev -- --port 3001
```
Truy cập: `http://localhost:3001/?hotelId=1` (Thay số 1 đến 10 để xem từng khách sạn)

### 🔹 Terminal 4: Chạy Web Lễ Tân & Lao Công (Port 3002)
```bash
cd frontend-staff
npm run dev -- --port 3002
```
Truy cập: `http://localhost:3002` (Tài khoản lễ tân: `staff_hn` / Mật khẩu: `123456`)

---

## 📋 4 Điều Nội Quy Khách Sạn
1. 🚫 Cấm dẫn thú cưng vào khuôn viên và phòng khách sạn.
2. 🚫 Cấm không được sử dụng, tàng trữ chất cấm, chất gây nghiện, chất dễ cháy nổ.
3. 🚫 Không được gây gổ, đánh nhau làm mất trật tự và an ninh khách sạn.
4. 🚫 Không được làm hư hại tài sản, trang thiết bị của khách sạn (bồi thường theo giá trị niêm yết).
