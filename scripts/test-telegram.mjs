import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function testTelegram() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) env[key.trim()] = value.join('=').trim();
  });

  const token = env['TELEGRAM_BOT_TOKEN'];
  const chatId = env['TELEGRAM_CHAT_ID'];
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await axios.post(url, {
      chat_id: chatId,
      text: '🏠 Housing Notifier (ID 7) 복구 완료! 🚀\n\n✅ Axios 기반 안정화\n✅ LH 주소 오타 수정\n✅ 타임아웃 3회 재시도 적용'
    }, { timeout: 15000 });
    
    if (res.data.ok) console.log('✅ 텔레그램 전송 성공!');
  } catch (error) {
    console.error('❌ 실패:', error.message);
  }
}
testTelegram();
