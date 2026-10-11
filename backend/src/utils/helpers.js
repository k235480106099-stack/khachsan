// Tính thời gian khách đã sử dụng phòng, dựa trên thời điểm nhận phòng và trả phòng
export function calculateUsageDuration(checkInTime, checkOutTime) {
  if (!checkInTime || !checkOutTime) return null;
  const start = new Date(checkInTime);
  const end = new Date(checkOutTime);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) };
}

// Định dạng ngày giờ kiểu Việt Nam: dd/mm/yyyy HH:mm
export function formatDateVN(date) {
  if (!date) return null;
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Chuẩn hoá response thành công — dùng thống nhất trong các controller
export function successResponse(res, data, message = 'Thành công', statusCode = 200) {
  return res.status(statusCode).json({ message, data });
}

// Chuẩn hoá response lỗi
export function errorResponse(res, error, statusCode = 500) {
  return res.status(statusCode).json({ message: error.message || 'Lỗi server' });
}

// Tính số ngày lưu trú
export function calculateStayDuration(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  return { days };
}

// Định dạng tiền tệ VND
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}