// ==========================================
// 1. 設定（変数名を supabaseClient に変更！）
// ==========================================
const SUPABASE_URL = 'https://あなたのプロジェクトID.supabase.co';
const SUPABASE_KEY = 'あなたのPublishable_Key';

// ★ここ！変数名を「supabaseClient」に変更してバッティングを回避！
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Canvas（描画用画面）の準備
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 丸を描く関数
function drawCircle(x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

// ==========================================
// 2. リアルタイム通信の部屋を設定
// ==========================================
const channel = supabaseClient.channel('game-room', {
  config: {
    broadcast: { self: false }
  }
});

// 相手から「click-event」が届いた時の処理
channel.on('broadcast', { event: 'click-event' }, (payload) => {
  const { x, y } = payload.payload;
  console.log('相手がクリックした位置：', x, y);
  drawCircle(x, y, 'blue');
});

// 通信部屋に接続
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    console.log('Supabaseのリアルタイム部屋に接続成功！');
  }
});

// ==========================================
// 3. 画面をクリックした時の処理（送信）
// ==========================================
window.addEventListener('click', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  // 自分の画面には「赤い丸」を描画
  drawCircle(x, y, 'red');

  // 相手の画面に向けて送信
  channel.send({
    type: 'broadcast',
    event: 'click-event',
    payload: { x: x, y: y }
  });
});