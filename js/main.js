//ゲームスピード(ms)
GAME_SPEED = 1000/60;

//画面サイズ
SCREEN_W = 180;
SCREEN_H = 320;

//キャンバスサイズ
CANVAS_W = SCREEN_W *2;
CANVAS_H = SCREEN_H *2;

//フィールドサイズ
FIELD_W = SCREEN_W *2;
FIELD_H = SCREEN_H *2;

//星の数
STAR_MAX =300;

//キャンバス
var can = document.getElementById("can");
con = can.getContext('2d');
can.width  = CANVAS_W;
can.height = CANVAS_H;

//フィールド（仮想画面）
var vcan = document.createElement("canvas");
vcon = vcan.getContext('2d');
vcan.width  = FIELD_W;
vcan.height = FIELD_H;

//カメラの座標
var camera_x = 0;
var camera_y = 0;

//星の実体
var star=[];

//整数のランダムを作る
function rand(min,max)
{
	return Math.floor( Math.random()*(max-min+1) )+min;
}

//星クラス
class Star
{
	constructor()
	{
		this.x  = rand(0,FIELD_W)<<8;
		this.y  = rand(0,FIELD_H)<<8;
		this.vx = 0;
		this.vy = rand(30,200);
		this.sz = rand(1,2);
	}
	
	draw()
	{
		var x=this.x>>8;
		var y=this.y>>8;
		
		if( x<camera_x || x>=camera_x+SCREEN_W 
			|| y<camera_y || y>=camera_y+SCREEN_H )return;
		
		vcon.fillStyle=rand(0,2)!=0?"66f":"#8af";
		vcon.fillRect(x,y,this.sz,this.sz);
		
	}
	
	update()
	{
		this.x += this.vx;
		this.y += this.vy;
		if( this.y>FIELD_H<<8 )
		{
			this.y=0;
			this.x=rand(0,FIELD_W)<<8;
		}
	}
	
}

//ゲーム初期化
function gameInit()
{
	for(var i=0;i<STAR_MAX;i++)star[i]= new Star();
	setInterval( gameLoop , GAME_SPEED );
}
//ゲームループ
function gameLoop()
{
	//移動の処理
	
	for(var i=0;i<STAR_MAX;i++)star[i].update();
	
	//描画の処理
	
	vcon.fillStyle="black";
	vcon.fillRect(0,0,SCREEN_W,SCREEN_H);
	
	for(var i=0;i<STAR_MAX;i++)star[i].draw();
	
	//仮想画面から実際のキャンバスにコピー
	
	con.drawImage( vcan ,camera_x,camera_y,SCREEN_W,SCREEN_H,
		0,0,CANVAS_W,CANVAS_H);
}

//オンロードでゲーム開始
window.onload=function()
{
	gameInit();
}