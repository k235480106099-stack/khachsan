import app from './src/app.js';
import { env } from './src/config/env.js';

app.listen(env.PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${env.PORT}`);
  console.log(`   Môi trường: ${env.NODE_ENV}`);
});