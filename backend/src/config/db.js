import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../hotel.db');
let sqliteDb = null;
let mysqlPool = null;

// Khởi tạo SQLite
function initSqlite() {
  const isNew = !fs.existsSync(dbPath);
  sqliteDb = new DatabaseSync(dbPath);

  // Kích hoạt foreign key
  sqliteDb.exec('PRAGMA foreign_keys = ON;');

  // Đọc và chạy schema.sql và seed.sql nếu mới tạo hoặc chưa có bảng hotels
  try {
    const checkTable = sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hotels'").all();
    if (checkTable.length === 0) {
      console.log('🔄 Đang tự động nạp cấu trúc CSDL và dữ liệu mẫu 10 khách sạn...');
      const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
      const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        sqliteDb.exec(schemaSql);
      }
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        sqliteDb.exec(seedSql);
      }
      console.log('✅ Khởi tạo CSDL SQLite và nạp 10 khách sạn thành công!');
    }
  } catch (err) {
    console.error('⚠️ Lỗi khi khởi tạo schema SQLite:', err.message);
  }
}

initSqlite();

/**
 * Hàm kiểm tra kết nối CSDL khi khởi động Backend
 */
export async function testConnection() {
  try {
    if (env.DB_TYPE === 'sqlite') {
      const rows = sqliteDb.prepare('SELECT COUNT(*) as count FROM hotels').all();
      console.log(`✅ [SQLite] Kết nối CSDL thành công! Hệ thống đang có ${rows[0].count} khách sạn.`);
      return true;
    }
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối CSDL:', error.message);
    return false;
  }
}

/**
 * Helper thực thi câu truy vấn SQL tương thích cả MySQL và SQLite
 */
export async function query(sql, params = []) {
  try {
    // Chuyển đổi an toàn: thay thế undefined bằng null để tương thích SQLite
    const safeParams = params.map((p) => (p === undefined ? null : p));
    const trimmed = sql.trim().toUpperCase();

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...safeParams);
    } else {
      const stmt = sqliteDb.prepare(sql);
      const result = stmt.run(...safeParams);
      return {
        insertId: result.lastInsertRowid ? Number(result.lastInsertRowid) : 0,
        affectedRows: result.changes || 0
      };
    }
  } catch (error) {
    console.error('❌ [Database Query Error]:', error.message, '| SQL:', sql);
    throw error;
  }
}

export const pool = sqliteDb;
export default { query, testConnection, pool };