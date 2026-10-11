import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { env } from '../config/env.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' });
    }

    const rows = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    }

    const user = rows[0];
    let isMatch = false;

    // So sánh mật khẩu (hỗ trợ cả hash bcrypt hoặc plain text mặc định)
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không chính xác' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, hotel_id: user.hotel_id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      hotel_id: user.hotel_id
    };

    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const rows = await query('SELECT id, username, full_name, role, hotel_id FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}
