//SupabaseのURLとキー
const SUPABASE_URL = 'https://lwidtpxsjquplvzcdsev.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tYFGjp6_GiqW8OpDfDSqVQ_1TyasvCn';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// リアルタイム通信の部屋を設定
// ==========================================

// const channel = supabaseClient.channel('game-room', {
//   config: {
//     broadcast: { self: false }
//   }
// });

function joinRoom(id) {
  channel = supabaseClient.channel(`game-room-${id}`, {
    config: { broadcast: { self: false } }
  });

  // イベント受信処理
  channel
    .on('broadcast', { event: 'send-action' }, (data) => onReceiveAction(data.payload))
    .on('broadcast', { event: 'sync-state' }, (data) => onReceiveSync(data.payload))
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        addLog(`部屋【${id}】に接続完了！`);
        // ホストなら接続完了時に初期データをゲストへ同期
        if (myPlayerIndex === 0) broadcastState();
      }
    });
}



//プレイヤー識別
let myPlayerIndex = null;
let roomId = null;

document.getElementById("hostBtn").onclick = () => {
  roomId = Math.floor(1000 + Math.random() * 9000).toString();
  myPlayerIndex = 0;
  initGame();
  joinRoom(roomId);
  alert(`部屋コード【 ${roomId} 】を相手に教えてください!`);
};

document.getElementById("joinBtn").onclick = () => {
  const inputRoom = prompt("部屋コード（4桁の数字）を入力してください!：");
  console.log('roomcodeDetected');
  if (!inputRoom) return;
  console.log('inputpassed');


  roomId = inputRoom;
  myPlayerIndex = 1;
  joinRoom(roomId);
};

// ホストから全員（ゲスト）へ最新状態を送信
function broadcastState() {
  if (myPlayerIndex !== 0) return; // ホスト以外は送信しない
  channel.send({
    type: 'broadcast',
    event: 'sync-state',
    payload: { state: state }
  });
}

// 【ホスト限定】ゲストから「カード使ったで」と届いたときの処理
function onReceiveAction(payload) {
  if (myPlayerIndex !== 0) return; // ホストだけが計算を担当

  const { playerIndex, cardIndex } = payload;
  executeCardLogic(playerIndex, cardIndex);
  
  // 計算結果を最新のstateとして全員に一斉送信！
  broadcastState();
  render();
}

// 【ゲスト限定】ホストから最新状態が届いたときの処理
function onReceiveSync(payload) {
  // ホストから届いた最新データを自分の state に上書き！
  Object.assign(state, payload.state);
  render();
}

// ----------------------
// カード定義
// ----------------------
const cards = [
  { id: '00001', rank: 1, type: "attack", power: 5, price: 10, name: "輪ゴム" },
  { id: '00002', rank: 1, type: "attack", power: 10, price: 10, name: "木の棒" },
  { id: '00003', rank: 1, type: "attack", power: 20, price: 10, name: "柔らかいムチ" },
  { id: '00004', rank: 1, type: "attack", power: 25, price: 10, name: "レゴ" },
  { id: '00005', rank: 1, type: "attack", power: 30, price: 15, name: "石の棍棒" },
  { id: '00006', rank: 1, type: "attack", power: 40, price: 20, name: "木の剣" },
  { id: '00007', rank: 5, type: "attack", power: 45, price: 250, name: "金の剣" },
  { id: '00008', rank: 1, type: "attack", power: 50, price: 25, name: "石の剣" },
  { id: '00009', rank: 2, type: "attack", power: 52, price: 30, name: "スズの剣" },
  { id: '00010', rank: 2, type: "attack", power: 53, price: 30, name: "亜鉛の剣" },
  { id: '00011', rank: 2, type: "attack", power: 55, price: 30, name: "銅の剣" },
  { id: '00012', rank: 2, type: "attack", power: 56, price: 30, name: "真鍮の剣" },
  { id: '00013', rank: 2, type: "attack", power: 58, price: 30, name: "青銅の剣" },
  { id: '00014', rank: 2, type: "attack", power: 60, price: 30, name: "白銅の剣" },
  { id: '00015', rank: 3, type: "attack", power: 64, price: 32, name: "クリスタルの剣" },
  { id: '00016', rank: 3, type: "attack", power: 70, price: 35, name: "ニッケルの剣" },
  { id: '00017', rank: 4, type: "attack", power: 75, price: 100, name: "銀の剣" },
  { id: '00018', rank: 3, type: "attack", power: 80, price: 40, name: "鉄の剣" },
  { id: '00019', rank: 4, type: "attack", power: 85, price: 60, name: "チタンの剣" },
  { id: '00020', rank: 4, type: "attack", power: 90, price: 60, name: "クロムの剣" },
  { id: '00021', rank: 4, type: "attack", power: 95, price: 60, name: "タングステンの剣" },
  { id: '00022', rank: 4, type: "attack", power: 100, price: 50, name: "鋼鉄の剣" },
  { id: '00023', rank: 5, type: "attack", power: 110, price: 150, name: "プラチナの剣" },
  { id: '00024', rank: 5, type: "attack", power: 120, price: 200, name: "ルビーの剣" },
  { id: '00025', rank: 5, type: "attack", power: 130, price: 200, name: "サファイアの剣" },
  { id: '00026', rank: 5, type: "attack", power: 140, price: 200, name: "ダイヤモンドの剣" },
  { id: '00027', rank: 5, type: "attack", power: 150, price: 220, name: "オリハルコンの剣" },
  { id: '00028', rank: 5, type: "attack", power: 200, price: 250, name: "ネザライトの剣" },
  { id: '00029', rank: 5, type: "attack", power: 240, price: 240, name: "ダイヤモンドの剣(鋭さⅤ)" },
  { id: '00030', rank: 6, type: "attack", power: 300, price: 300, name: "オリオンソード" },

  { id: '00201', rank: 5, type: "breaker", power: 30, breakthrough: 5, price: 300, name: "金の斧" },
  { id: '00202', rank: 1, type: "breaker", power: 50, breakthrough: 20, price: 28, name: "石の斧" },
  { id: '00203', rank: 2, type: "breaker", power: 64, breakthrough: 24, price: 36, name: "クリスタルの斧" },
  { id: '00204', rank: 3, type: "breaker", power: 75, breakthrough: 30, price: 45, name: "鉄の斧" },
  { id: '00205', rank: 4, type: "breaker", power: 100, breakthrough: 50, price: 55, name: "鋼鉄の斧" },
  { id: '00206', rank: 5, type: "breaker", power: 120, breakthrough: 40, price: 220, name: "ダイヤモンドの斧" },
  { id: '00207', rank: 5, type: "breaker", power: 150, breakthrough: 30, price: 250, name: "オリハルコンの斧" },
  { id: '00208', rank: 5, type: "breaker", power: 200, breakthrough: 50, price: 300, name: "ネザライトの斧" },
  { id: '00209', rank: 6, type: "breaker", power: 300, breakthrough: 80, price: 350, name: "オリオンアックス" },
  { id: '00210', rank: 7, type: "breaker", power: 200, breakthrough: 100, price: 300, name: "旧式戦車" },
  { id: '00211', rank: 9, type: "breaker", power: 300, breakthrough: 300, price: 500, name: "現代戦車" },

  { id: '00301', rank: 3, type: "picker", power: 20, price: 10, name: "石のつるはし" },
  { id: '00302', rank: 3, type: "picker", power: 30, price: 20, name: "銅のつるはし" },
  { id: '00303', rank: 3, type: "picker", power: 40, price: 25, name: "鉄のつるはし" },
  { id: '00304', rank: 4, type: "picker", power: 50, price: 30, name: "鋼鉄のつるはし" },
  { id: '00305', rank: 5, type: "picker", power: 60, price: 150, name: "ダイヤモンドのつるはし" },
  { id: '00306', rank: 5, type: "picker", power: 70, price: 160, name: "オリハルコンのつるはし" },
  { id: '00307', rank: 6, type: "picker", power: 80, price: 180, name: "ネザライトのつるはし" },


  { id: '01001', rank: 1, type: "armor", power: 5, price: 5, name: "ポケットに入ったコイン" },
  { id: '01002', rank: 1, type: "armor", power: 10, price: 10, name: "革のぼうし" },
  { id: '01003', rank: 1, type: "armor", power: 15, price: 15, name: "ボロボロのスニーカー" },
  { id: '01004', rank: 1, type: "armor", power: 40, price: 40, name: "鉄のブーツ" },
  { id: '01005', rank: 2, type: "armor", power: 45, price: 40, name: "鉄のヘルメット" },
  { id: '01006', rank: 2, type: "armor", power: 50, price: 50, name: "鉄のレギンス" },
  { id: '01007', rank: 2, type: "armor", power: 60, price: 50, name: "鉄のチェストプレート" },
  { id: '01008', rank: 3, type: "armor", power: 66, price: 30, name: "がれきの山" },
  { id: '01009', rank: 4, type: "armor", power: 70, price: 100, name: "ダイヤモンドのレギンス" },
  { id: '01010', rank: 4, type: "armor", power: 80, price: 120, name: "ダイヤモンドのチェストプレート" },
  { id: '01011', rank: 5, type: "armor", power: 120, price: 80, name: "鋼鉄の鎧" },
  { id: '01012', rank: 5, type: "armor", power: 130, price: 150, name: "オリハルコンの兜" },
  { id: '01013', rank: 5, type: "armor", power: 150, price: 150, name: "ダイヤモンドの鎧" },
  { id: '01014', rank: 5, type: "armor", power: 220, price: 180, name: "ネザライトの鎧" },
  { id: '01015', rank: 6, type: "armor", power: 300, price: 300, name: "オリオンアーマー" },

  { id: '01101', rank: 1, type: "defense", power: 20, price: 20, name: "木の盾" },
  { id: '01102', rank: 1, type: "defense", power: 25, price: 15, name: "ゴミ箱のフタ" },
  { id: '01103', rank: 1, type: "defense", power: 30, price: 30, name: "石の盾" },
  { id: '01104', rank: 1, type: "defense", power: 35, price: 20, name: "外れた扉" },
  { id: '01105', rank: 5, type: "defense", power: 40, price: 400, name: "金の盾" },
  { id: '01106', rank: 2, type: "defense", power: 55, price: 55, name: "銅の盾" },
  { id: '01107', rank: 2, type: "defense", power: 64, price: 64, name: "クリスタルの盾" },
  { id: '01108', rank: 4, type: "defense", power: 70, price: 200, name: "銀の盾" },
  { id: '01109', rank: 3, type: "defense", power: 80, price: 80, name: "鉄の盾" },
  { id: '01110', rank: 4, type: "defense", power: 85, price: 120, name: "チタンの盾" },
  { id: '01111', rank: 3, type: "defense", power: 90, price: 90, name: "青銅の盾" },
  { id: '01112', rank: 4, type: "defense", power: 100, price: 100, name: "鋼鉄の盾" },
  { id: '01113', rank: 5, type: "defense", power: 120, price: 300, name: "ルビーの盾" },
  { id: '01114', rank: 5, type: "defense", power: 130, price: 300, name: "サファイアの盾" },
  { id: '01115', rank: 5, type: "defense", power: 140, price: 320, name: "ダイヤモンドの盾" },
  { id: '01116', rank: 5, type: "defense", power: 150, price: 350, name: "オリハルコンの盾" },
  { id: '01017', rank: 5, type: "defense", power: 200, price: 380, name: "ネザライトの盾" },
  { id: '01118', rank: 6, type: "defense", power: 300, price: 500, name: "オリオンシールド" },


  { id: '02001', rank: 1, type: "heal", power: 10, price: 10, name: "何故かチップがつまみ食いされたチョコチップクッキー" },
  { id: '02002', rank: 1, type: "heal", power: 15, price: 150, name: "ONICHA" },
  { id: '02003', rank: 1, type: "heal", power: 20, price: 20, name: "一粒のイチゴ" },
  { id: '02004', rank: 1, type: "heal", power: 25, price: 20, name: "スライスチーズ" },
  { id: '02005', rank: 1, type: "heal", power: 30, price: 40, name: "牛肉のパティ" },
  { id: '02006', rank: 1, type: "heal", power: 35, price: 20, name: "チョコチップクッキー" },
  { id: '02007', rank: 2, type: "heal", power: 40, price: 30, name: "キウイ" },
  { id: '02008', rank: 2, type: "heal", power: 42, price: 30, name: "みかん" },
  { id: '02009', rank: 2, type: "heal", power: 45, price: 30, name: "ぶどう" },
  { id: '02010', rank: 2, type: "heal", power: 48, price: 30, name: "バナナ" },
  { id: '02011', rank: 2, type: "heal", power: 50, price: 30, name: "りんご" },
  { id: '02012', rank: 2, type: "heal", power: 52, price: 50, name: "マンゴー" },
  { id: '02013', rank: 2, type: "heal", power: 55, price: 40, name: "スイカの輪切り" },
  { id: '02014', rank: 2, type: "heal", power: 57, price: 50, name: "かぼちゃ" },
  { id: '02015', rank: 3, type: "heal", power: 60, price: 80, name: "イチゴ詰めパック" },
  { id: '02016', rank: 3, type: "heal", power: 70, price: 60, name: "白米" },
  { id: '02017', rank: 4, type: "heal", power: 85, price: 70, name: "フルグラ" },
  { id: '02018', rank: 4, type: "heal", power: 95, price: 100, name: "炊き立てのご飯" },
  { id: '02019', rank: 5, type: "heal", power: 112, price: 100, name: "焼き鳥" },
  { id: '02020', rank: 5, type: "heal", power: 115, price: 100, name: "唐揚げ" },
  { id: '02021', rank: 5, type: "heal", power: 120, price: 110, name: "焼き羊肉" },
  { id: '02022', rank: 5, type: "heal", power: 125, price: 120, name: "焼き豚" },
  { id: '02023', rank: 5, type: "heal", power: 128, price: 120, name: "とんかつ" },
  { id: '02024', rank: 5, type: "heal", power: 130, price: 150, name: "ステーキ" },
  { id: '02025', rank: 6, type: "heal", power: 145, price: 130, name: "炭火焼きの焼き鳥" },
  { id: '02026', rank: 6, type: "heal", power: 156, price: 180, name: "焼豚チャーハン" },
  { id: '02027', rank: 6, type: "heal", power: 164, price: 180, name: "ジンギスカン" },
  { id: '02028', rank: 6, type: "heal", power: 180, price: 200, name: "チーズバーガー" },
  { id: '02029', rank: 7, type: "heal", power: 240, price: 250, name: "ダブルチーズバーガー" },
  { id: '02030', rank: 8, type: "heal", power: 300, price: 300, name: "トリプルチーズバーガー" },

  { id: '03001', rank: 4, type: "blueprint", power: 0, price: 50, name: "石の剣の設計図" },
  { id: '03002', rank: 4, type: "blueprint", power: 0, price: 50, name: "銅の剣の設計図" },
  { id: '03003', rank: 4, type: "blueprint", power: 0, price: 50, name: "鉄の剣の設計図" },
  { id: '03004', rank: 4, type: "blueprint", power: 0, price: 50, name: "鋼鉄の剣の設計図" },
  { id: '03005', rank: 4, type: "blueprint", power: 0, price: 50, name: "ダイヤモンドの剣の設計図" },
  { id: '03006', rank: 4, type: "blueprint", power: 0, price: 50, name: "石の斧の設計図" },
  { id: '03007', rank: 4, type: "blueprint", power: 0, price: 50, name: "銅の斧の設計図" },
  { id: '03008', rank: 4, type: "blueprint", power: 0, price: 50, name: "鉄の斧の設計図" },
  { id: '03009', rank: 4, type: "blueprint", power: 0, price: 50, name: "鋼鉄の斧の設計図" },
  { id: '03010', rank: 4, type: "blueprint", power: 0, price: 50, name: "ダイヤモンドの斧の設計図" },
  { id: '03011', rank: 4, type: "blueprint", power: 0, price: 50, name: "石のつるはしの設計図" },
  { id: '03012', rank: 4, type: "blueprint", power: 0, price: 50, name: "銅のつるはしの設計図" },
  { id: '03013', rank: 4, type: "blueprint", power: 0, price: 50, name: "鉄のつるはしの設計図" },
  { id: '03014', rank: 4, type: "blueprint", power: 0, price: 50, name: "鋼鉄のつるはしの設計図" },
  { id: '03015', rank: 4, type: "blueprint", power: 0, price: 50, name: "ダイヤモンドのつるはしの設計図" },
  { id: '03016', rank: 4, type: "blueprint", power: 0, price: 50, name: "石の盾の設計図" },
  { id: '03017', rank: 4, type: "blueprint", power: 0, price: 50, name: "銅の盾の設計図" },
  { id: '03018', rank: 4, type: "blueprint", power: 0, price: 50, name: "鉄の盾の設計図" },
  { id: '03019', rank: 4, type: "blueprint", power: 0, price: 50, name: "青銅の盾の設計図" },
  { id: '03020', rank: 4, type: "blueprint", power: 0, price: 50, name: "鋼鉄の盾の設計図" },
  { id: '03021', rank: 4, type: "blueprint", power: 0, price: 50, name: "ダイヤモンドの盾の設計図" },
  { id: '03022', rank: 4, type: "blueprint", power: 0, price: 50, name: "鉄のヘルメットの設計図" },
  { id: '03023', rank: 4, type: "blueprint", power: 0, price: 50, name: "鉄のチェストプレートの設計図" },
  { id: '03024', rank: 4, type: "blueprint", power: 0, price: 50, name: "鉄のレギンスの設計図" },
  { id: '03025', rank: 4, type: "blueprint", power: 0, price: 50, name: "鉄のブーツの設計図" },



];

//効果音リスト
const starting_bell_sound = new Audio('sounds/bell.wav');
const defeat_sound = new Audio('sounds/defeat.wav');
const click_sound = new Audio('sounds/click.wav');
const attack_sound = new Audio('sounds/attack.wav');
const defense_sound = new Audio('sounds/defense.wav');
const wearing_sound = new Audio('sounds/wearing.wav');
const eating_sound = new Audio('sounds/eating.wav');
const paper_sound = new Audio('sounds/paper.wav');


// ゲーム状態
const state = {
  players: [
    { name: null, hp: 400, shield: 0, money: 300, hand: [], blueprints: []},
    { name: null, hp: 400, shield: 0, money: 300, hand: [], blueprints: []}
  ],
  turn: 0, // 0 = あなた, 1 = 相手
  log: []
};

const rankCardList = [[],[],[],[],[],[],[],[],[],[]];
const rankPropotion = [12,40,76,94,98,100,0,0,0,0];//sum = 100


// 初期化
function initGame() {

  // ランク別のカードを計測

  for (let i = 0; i < cards.length; i++) {
    rankCardList[cards[i].rank - 1].push(i);
  }

  // 手札を10枚ずつ配る
  for (let i = 0; i < 10; i++) {
    state.players[0].hand.push(randomCard());
    state.players[1].hand.push(randomCard());
  }
  alignById(state.players[0].hand);
  render();
}


//シャッフル関数
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


//IDに沿ってカードを整列
function alignById(array) {
  array.sort((a,b) => a.id - b.id);
}


//確率に応じてランダムなカードを生成
function randomCard() {

  const randomNum = Math.floor(Math.random() * 100);
  let chosenRank;

  if(randomNum < rankPropotion[0]){
    chosenRank = 0;
  }else if(randomNum < rankPropotion[1]){
    chosenRank = 1;
  }else if(randomNum < rankPropotion[2]){
    chosenRank = 2;
  }else if(randomNum < rankPropotion[3]){
    chosenRank = 3;
  }else if(randomNum < rankPropotion[4]){
    chosenRank = 4;
  }else{
    chosenRank = 5;
  }

  return structuredClone(cards[rankCardList[chosenRank][Math.floor(Math.random() * rankCardList[chosenRank].length)]]);
}//ランクに応じてランダムにカードを選択し、そのコピーを返す

// カード使用の実行（クリック時）
function playCard(cardIndex) {
  // 自分のターンじゃないなら操作不可
  if (state.turn !== myPlayerIndex) {
    addLog("相手のターンです！");
    return;
  }

  if (myPlayerIndex === 0) {
    // 【ホストの場合】自分で直接処理を計算して、結果を全員に配る
    executeCardLogic(0, cardIndex);
    broadcastState();
    render();
  } else {
    // 【ゲストの場合】ホストに「このカード使ったで」とお願いを送るだけ
    channel.send({
      type: 'broadcast',
      event: 'send-action',
      payload: { playerIndex: 1, cardIndex: cardIndex }
    });
  }
}

// カード実行処理
function executeCardLogic(playerIndex, cardIndex) {

  // if (!isRemote && state.turn !== myPlayerIndex) {
  //   addLog("相手のターンです！");
  //   return;
  // }//自身がこの関数を遠隔で操作しておらず、かつ自分のターンのときは操作できない

  const p = state.players[playerIndex];
  const enemy = state.players[1 - playerIndex];
  const card = p.hand[cardIndex];

  if (!card) return;

  if (card.type === "attack") {
    const dmg = Math.max(0, card.power - enemy.shield);
    enemy.hp -= dmg;
    enemy.shield = 0;
    addLog(`${card.name}を使用して攻撃！${dmg} ダメージ`);
    if(dmg == 0){
      defense_sound.play();
    }else{
      attack_sound.play();
    }
  }

  if (card.type === "breaker") {
    const dec_shield = Math.max(0, enemy.shield - card.breakthrough);
    const dmg = Math.max(0, card.power - dec_shield);
    enemy.hp -= dmg;
    addLog(`${card.name}を使用して攻撃！防御力の${enemy.shield - dec_shield}が突破され${dmg} ダメージ`);
    enemy.shield = 0;
    if(dmg == 0){
      defense_sound.play();
    }else{
      attack_sound.play();
    }
  }

  if (card.type === "picker") {
    const dmg = card.power
    enemy.hp -= dmg;
    addLog(`${card.name}を使用して攻撃！防御力は無視され${dmg} ダメージ`);
    click_sound.play();
  }

  if (card.type === "armor") {
    p.shield += card.power;
    addLog(`${card.name}を使用して防御力 +${card.power}`);
    wearing_sound.play();
  }

  if (card.type === "defense") {
    p.shield += card.power;
    addLog(`${card.name}を使用して防御力 +${card.power}`);
    wearing_sound.play();
  }

  if (card.type === "heal") {
    p.hp += card.power;
    if(p.hp > 1500 ){
      p.hp = 1500;
    }
    addLog(`${card.name}を食べて回復 +${card.power}`);
    eating_sound.currentTime = 0;
    eating_sound.play();
  }

  if (card.type === "blueprint") {
    if(p.blueprints.includes(card.id)){
      addLog("過剰な設計図は破棄された");
    }else{
      p.blueprints.push(card.id);
      addLog(`${card.name}を手に入れた`);
      paper_sound.currentTime = 0;
      paper_sound.play();
    }
  }

  // 手札から削除
  p.hand.splice(cardIndex, 1);
  //state.discard.push(card);

  // ターン交代
  state.turn = 1 - state.turn;

  // 新しいターンのプレイヤーがカードを引く
  drawCard(state.turn);

  // 相手のターンなら自動行動
  // if (enemy.hp > 0 && state.turn === 1) {
  //   setTimeout(enemyTurn, 800);
  // }else if(enemy.hp <= 0 && state.turn === 1){
  //   addLog("");
  //   addLog("/-------------------/");
  //   addLog("/------勝利！----/");
  //   addLog("/-------------------/");
  //   starting_bell_sound.play();
  // }else if(enemy.hp <= 0 && state.turn === 0){
  //   addLog("");
  //   addLog("/-------------------/");
  //   addLog("/------敗北...----/");
  //   addLog("/-------------------/");
  //   defeat_sound.play();
  // }
  if(enemy.hp <= 0 && state.turn === myPlayerIndex){
    addLog("");
    addLog("/-------------------/");
    addLog("/------勝利！----/");
    addLog("/-------------------/");
    starting_bell_sound.play();
  }else if(enemy.hp <= 0 && state.turn === myPlayerIndex){
    addLog("");
    addLog("/-------------------/");
    addLog("/------敗北...----/");
    addLog("/-------------------/");
    defeat_sound.play();
  }

  alignById(state.players[0].hand);
  alignById(state.players[1].hand);
  render();
}

//引数番目のプレイヤーがカードを引く
function drawCard(playerIndex) {
  const card = randomCard();
  // 設計図が被っている間はループして引き直す
  while (card.type === "blueprint" && state.players[playerIndex].blueprints.includes(card.id)) {
    card = randomCard();
  }
  state.players[playerIndex].hand.push(card);
}

// 相手の行動（超シンプルAI）
function enemyTurn() {
  const enemy = state.players[1];
  const card = enemy.hand[Math.floor(Math.random() * enemy.hand.length)];
  playCard(card);
}

// 描画
const chosenCardDiv = document.getElementById("chosenCard");
const cardInfoBoxDiv = document.getElementById("cardInfoBox");

function render() {
  document.getElementById("p1hp").textContent = state.players[0].hp;
  document.getElementById("p1shield").textContent = state.players[0].shield;
  document.getElementById("p1money").textContent = state.players[0].money;

  document.getElementById("p2hp").textContent = state.players[1].hp;
  document.getElementById("p2shield").textContent = state.players[1].shield;
  document.getElementById("p2money").textContent = state.players[1].money;

  const handDiv = document.getElementById("hand");
  handDiv.innerHTML = "";

  if (state.turn === myPlayerIndex) {
    state.players[myPlayerIndex].hand.forEach((card, index) => {
      const div = document.createElement("div");
      const img = document.createElement("img");
      div.classList.add("handCard")
      let textCon;
      img.height = "96";
      img.width = "96";
      if(card.type === 'attack'){
        textCon = `攻撃力${card.power}(¥${card.price})`;
        img.src = `images/id${card.id}.png`;
      }else if(card.type === 'breaker'){
        textCon = `攻撃力${card.power}+突破${card.breakthrough}(¥${card.price})`;
        img.src = `images/id${card.id}.png`;
      }else if(card.type === 'picker'){
        textCon = `攻撃力${card.power}+防御貫通(¥${card.price})`;
        img.src = `images/id${card.id}.png`;
      }else if(card.type === 'armor'){
        textCon = `防御力+${card.power}(¥${card.price})`;
        img.src = `images/id01000.png`;
      }else if(card.type === 'defense'){
        textCon = `防御力+${card.power}(¥${card.price})`;
        img.src = `images/id01000.png`;
      }else if(card.type === 'heal'){
        textCon = `HP+${card.power}(¥${card.price})`;
        img.src = `images/heal/id${card.id}.png`;
      }else {
        textCon = `¥${card.price}`;
        img.src = `images/id03000.png`;
      }
      div.appendChild(img);

      div.onclick = () => {
        playCard(index);
      }

      div.onmouseover = () => {
        cardInfoBoxDiv.style.visibility = "visible";
        document.getElementById("cardName").textContent = card.name;
        document.getElementById("cardPower").textContent = textCon;
        chosenCardDiv.removeChild(chosenCardDiv.firstElementChild);
        chosenCardDiv.appendChild(img.cloneNode(true));
      }

      handDiv.appendChild(div);
    });
  } else if(state.players[myPlayerIndex - 1].hp > 0){
    handDiv.innerHTML = "<i>相手のターン...</i>";
  }

  document.getElementById("log").innerHTML = state.log.join("<br>");
}

//ログを追加
function addLog(text) {
  state.log.unshift(text);
}

// //
// channel.on('broadcast', { event: 'play-card' }, (data) => {
//   const { cardId, playerIndex } = data.payload;

//   // 相手の手札から使われたカードを探す
//   const enemyHand = state.players[playerIndex].hand;
//   const usedCard = enemyHand.find(c => c.id === cardId);

//   if (usedCard) {
//     playCard(usedCard, true);
//   }
// }).subscribe();

// // ----------------------


