// デバッグのフラグ
const DEBUG = false;

let drawCount = 0;
let fps = 0;
let lastTime = Date.now();

// スムージング
const SMOOTHING = true;

// setIntervalを管理
let gameId;

// ゲームオーバーフラグ
let gameOver = false;

// タイトルフラグ
let title = true;

//ゲームスピード(ms)
const GAME_SPEED = 1000/60;

//画面サイズ
const SCREEN_W = 320;
const SCREEN_H = 320;

//キャンバスサイズ
const CANVAS_W = 598;
const CANVAS_H = SCREEN_H * (598/320);

//フィールドサイズ
const FIELD_W = SCREEN_W +120;
const FIELD_H = SCREEN_H +40;

// スコア
let score = 0;
// ハイスコア
let highScore = 0;

// ボスのHP
let bossHP = 0;
let bossMHP = 0;

//星の数
const STAR_MAX =300;

//キャンバス
let can = document.getElementById("can");
let con = can.getContext("2d");
can.width  = CANVAS_W;
can.height = CANVAS_H;

con.mozimageSmoothingEnagble    = SMOOTHING;
con.webkitimageSmoothingEnabled = SMOOTHING;
con.msimageSmoothingEnabled     = SMOOTHING;
con.imageSmoothingEnabled       = SMOOTHING;
con.font="20px 'Impact'";

//フィールド（仮想画面）
let vcan = document.createElement("canvas");
let vcon = vcan.getContext("2d");
vcan.width  = FIELD_W;
vcan.height = FIELD_H;
vcon.font="12px 'Impact'";

//カメラの座標
let camera_x = 0;
let camera_y = 0;

//星の実体
let star=[];

// キーボードの状態
let key = [];

// オブジェクトたち
// 敵を格納する配列
let teki = [];
// 弾を格納する配列
let tama = [];
let teta = [];
// 爆発配列
let expl = [];
// 自機を生成
let jiki = new Jiki();

// スプライト画像の読み込み
let spriteImage = new Image();
spriteImage.src = "image/sprite2.png"

// seを読み込む(連想配列)
let sound_list = {
	"explode": new Audio("audio/explode.mp3"),
	"damage": new Audio("audio/damage.mp3"),
    "explode_boss": new Audio("audio/explode_boss.mp3")
};

// タイトル画面
function titleScreen() {
    // 描画の前に画面を消去
    con.clearRect(0,0,CANVAS_W,CANVAS_H);
    con.fillStyle = "rgba(25, 25, 25, 1.0)"; // 文字色の設定
	con.font = "bold 48px sans-serif"; // 文字フォントの設定
	con.fillText("シューティング", CANVAS_W / 4, CANVAS_H / 3); // 文字の描画
	con.font = "bold 32px sans-serif"; // 文字フォントの設定
    con.fillText("ゲームスタート：Enter", CANVAS_W / 4, CANVAS_H / 3 + 100); // 文字の描画
    con.font = "bold 16px sans-serif"; // 文字フォントの設定
    con.fillText("※このゲームでは音声が再生されます。", CANVAS_W / 4, CANVAS_H / 3 + 130);
    con.font = "bold 32px sans-serif"; // 文字フォントの設定
	con.fillText("HIGHSCORE：" + highScore, CANVAS_W / 4, CANVAS_H / 3 + 200);
	
    // タイトルフラグ
	title = true;
	// ゲームオーバー、ゲームクリアフラグ解除
	gameOver = false;
	gameClear = false;
	// ゲーム終了
	clearInterval(gameId);
	
}

//ゲーム初期化
function gameInit()
{
	// タイトルフラグを解除
	title = false;

	// 初期化
	delete jiki;
	// オブジェクトたちの初期化
	// 敵を格納する配列
	teki = [];
	// 弾を格納する配列
	tama = [];
	teta = [];
	// 爆発配列
	expl = [];
	jiki = new Jiki();
	
	score = 0;
	gameCount = 0;
	gameWave = 0;
	starSpeed = 100;
	starSpeedReq = 100;

	for(let i=0;i<STAR_MAX;i++)star[i]= new Star();
	// BGM の再生
	document.getElementById('BGM').volume = 0.5;
	document.getElementById('BGM').currentTime = 0;
	document.getElementById('BGM').play();

	// ゲーム開始
	gameId = setInterval( gameLoop , GAME_SPEED );
}

// オブジェクトのアップデート
function updateObj(obj)
{
	for(let i=obj.length-1;i>=0;i--) {
		obj[i].update();
		// 消去フラグが立っているときは消去
		if(obj[i].kill) obj.splice( i, 1);
	}
}

// オブジェクトの描画
function drawObj(obj)
{
	for(let i=obj.length-1;i>=0;i--) {
		obj[i].draw();
	}
}

// 移動の処理
function updateAll()
{
	updateObj(star);
	updateObj(tama);
	updateObj(teta);
	if(!gameClear)updateObj(teki);
	updateObj(expl);
	if(!gameOver)jiki.update();
}

// 描画の処理
function drawAll()
{
	// タイトル時
    if(title){
        titleScreen();
        return;
    }
	vcon.fillStyle=(jiki.damage)?"red":"black";
	vcon.fillRect(camera_x,camera_y,SCREEN_W,SCREEN_H);
	
	drawObj(star);
	drawObj(tama);
	if(!gameOver)jiki.draw();
	if(!gameClear)drawObj(teki);
	drawObj(expl);
	drawObj(teta);
	
	// 自機の範囲 0 ～ FIELD_W
	// カメラの範囲 0 ～ (FIELD_W - SCREEN_W)
	camera_x = Math.floor((jiki.x>>8) / FIELD_W * (FIELD_W - SCREEN_W));
	camera_y = Math.floor((jiki.y>>8) / FIELD_H * (FIELD_H - SCREEN_H));
	
	// ボスのHPを表示する
	if( bossHP > 0 )
	{
		let sz = (SCREEN_W - 20) * bossHP / bossMHP;
		let sz2 = (SCREEN_W - 20);
		vcon.fillStyle = "rgba(255, 0, 0, 0.5)";
		vcon.fillRect(camera_x+10, camera_y+10, sz, 10);
		vcon.strokeStyle = "rgba(255, 0, 0, 0.9)";
		vcon.strokeRect(camera_x+10, camera_y+10, sz2, 10);
	}
	
	// 自機のHPを表示する
	if( jiki.hp > 0 )
	{
		let sz = (SCREEN_W - 20) * jiki.hp / jiki.mhp;
		let sz2 = (SCREEN_W - 20);
		vcon.fillStyle = "rgba(0, 0, 255, 0.5)";
		vcon.fillRect(camera_x+10, camera_y+SCREEN_H-14, sz, 10);
		vcon.strokeStyle = "rgba(0, 0, 255, 0.9)";
		vcon.strokeRect(camera_x+10, camera_y+SCREEN_H-14, sz2, 10);
	}
	
	// スコア表示
	vcon.fillStyle="white";
	vcon.fillText("SCORE:"+score,camera_x+10,camera_y+14);
	
	//仮想画面から実際のキャンバスにコピー
	con.drawImage( vcan ,camera_x,camera_y,SCREEN_W,SCREEN_H,
		0,0,CANVAS_W,CANVAS_H);
}

// 情報の表示
function putInfo()
{
	con.fillStyle="white";
	
	// ゲームオーバー時の画面表示
	if( gameOver)
	{
		let s = "GAME OVER";
		let w = con.measureText(s).width;
		let x = CANVAS_W/2 - w/2;
		let y = CANVAS_H/2 - 20;
		con.fillText(s,x,y);
		s = "Push 'Enter' key to restart !";
		w = con.measureText(s).width;
		x = CANVAS_W/2 - w/2;
		y = CANVAS_H/2 + 20;
		con.fillText(s,x,y);
	}
	// ゲームクリア時の画面表示
	if( gameClear)
	{
		let s = "GAME CLEAR !";
		let w = con.measureText(s).width;
		let x = CANVAS_W/2 - w/2;
		let y = CANVAS_H/2 - 20;
		con.fillText(s,x,y);
		s = "Push 'Enter' key to restart !";
		w = con.measureText(s).width;
		x = CANVAS_W/2 - w/2;
		y = CANVAS_H/2 + 20;
		con.fillText(s,x,y);
	}
	if(DEBUG)
	{
		drawCount++;
		if( lastTime + 1000 <= Date.now()) {
			fps = drawCount;
			drawCount=0;
			lastTime=Date.now;
		}
		con.font="20px 'Impact'";
		con.fillStyle="white";
		con.fillText("FPS:"+fps,20,20);
		con.fillText("Tama:"+tama.length,20,40);
		con.fillText("Teki:"+teki.length,20,60);
		con.fillText("HP:"+jiki.hp,20,80);
		con.fillText("SCORE:"+score,20,100);
		con.fillText("COUNT:"+gameCount,20,120);
		con.fillText("WAVE:"+gameWave,20,140);
	}
}

// ステージ構成に使う変数
let gameCount = 0;
let gameWave = 0;
let gameClear = false

// 星の速度
let starSpeed = 100;
let starSpeedReq = 100;

//ゲームループ
function gameLoop()
{
	gameCount++;
	// 星の速度
	if( starSpeedReq > starSpeed ) starSpeed++;
	if( starSpeedReq < starSpeed ) starSpeed--;
	
	if( gameWave == 0 )
	{
		if( rand(0, 15) == 1 )
		{
			teki.push( new Teki(0, rand(0, FIELD_W)<<8, 0, 0, rand(300, 1200)));
		}
		// 一定時間経過後に、waveを進める
		if( gameCount > 60*20 )
		{
			gameWave++;
			gameCount=0;
			starSpeedReq = 200;
		}
	}
	if( gameWave == 1 )
	{
		if( rand(0, 15) == 1 )
		{
			teki.push( new Teki(1, rand(0, FIELD_W)<<8, 0, 0, rand(300, 1200)));
		}
		// 一定時間経過後に、waveを進める
		if( gameCount > 60*20 )
		{
			gameWave++;
			gameCount=0;
			starSpeedReq = 300;
		}
	}
	if( gameWave == 2 )
	{
		if( rand(0, 10) == 1 )
		{
			let r = rand(0, 1);
			teki.push( new Teki(r, rand(0, FIELD_W)<<8, 0, 0, rand(300, 1200)));
		}
		// 一定時間経過後に、waveを進め、ボスを降臨させる
		if( gameCount > 60*20 )
		{
			gameWave++;
			gameCount=0;
			teki.push( new Teki(2,(FIELD_W/2)<<8 ,0, 0,200 ) );
			starSpeedReq = 600;
			// BGM の再生
			document.getElementById('BGM_boss').volume = 0.5;
			document.getElementById('BGM').pause();
			document.getElementById('BGM_boss').currentTime = 0;
			document.getElementById('BGM_boss').play();
		}
	}
	if( gameWave == 3 )
	{
		// 敵を全滅させたら、ゲームクリア
		if( teki.length == 0 )
		{
			// BGMの停止
			document.getElementById('BGM').pause();
			document.getElementById('BGM_boss').pause();
			gameWave=0;
			gameCount=0;
			gameClear=true;
			starSpeedReq = 0;
			// ハイスコア更新
			if(highScore < score) {
				highScore = score;
			}
		}
	}
	// テスト的に敵を出す
	/*
	if(rand(0,10) === 1) {
		let r = rand(0,1);
		teki.push( new Teki(r, rand(0, FIELD_W)<<8, 0, 0, rand(300, 1200)));
	}
	*/
	//移動の処理
	updateAll();
	
	//描画の処理
	drawAll();
		
	// デバッグ情報
	putInfo();
}

//オンロードでタイトル画面
window.onload=function()
{
	titleScreen();
	//gameInit();
	// ボス降臨
	// teki.push( new Teki(2,(FIELD_W/2)<<8, 0, 0, 200 ) );
}