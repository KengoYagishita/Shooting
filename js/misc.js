// misc.js　その他、共通関数

//星クラス
class Star
{
	constructor()
	{
		this.x  = rand(0,FIELD_W)<<8;
		this.y  = rand(0,FIELD_H)<<8;
		this.vx = 0;
		this.vy = rand(100,300);
		this.sz = rand(1,2);
	}
	
	draw()
	{
		let x=this.x>>8;
		let y=this.y>>8;
		
		if( x<camera_x || x>=camera_x+SCREEN_W 
			|| y<camera_y || y>=camera_y+SCREEN_H )return;
		
		vcon.fillStyle=rand(0,2)!=0?"#66f":"#aef";
		vcon.fillRect(x,y,this.sz,this.sz);
		
	}
	
	update()
	{
		this.x += this.vx * starSpeed/100;
		this.y += this.vy * starSpeed/100;
		if( this.y>FIELD_H<<8 )
		{
			this.y=0;
			this.x=rand(0,FIELD_W)<<8;
		}
	}
	
}

// キャラクターのベースクラス
class CharaBase
{
	constructor(snum, x, y, vx, vy)
	{
		this.sn = snum;
		this.x  = x;
		this.y  = y;
		this.vx = vx;
		this.vy = vy;
		this.kill = false;
		this.count = 0;
	}
	
	// 移動
	update()
	{
		this.count++;
		this.x += this.vx;
		this.y += this.vy;
		// 画面外に出たときに消去フラグをtrueにする
		if( this.x < 0 || this.x > FIELD_W<<8 || this.y < 0 || this.y > FIELD_H<<8 ) 
		{
			this.kill = true;
		}
	}
	
	// 描画
	draw()
	{
		drawSprite(this.sn, this.x, this.y);
	}
}

// 爆発のクラス
class Expl extends CharaBase
{
	constructor(c,x,y,vx,vy)
	{
		super(0,x,y,vx,vy);
		this.timer = c;
	}
	update()
	{
		// もしtimerが1以上なら、timerを1減らして終了
		if(this.timer)
		{
			this.timer--;
			return;
		}
		super.update();
	}
	draw()
	{ 
		// もしtimerが1以上なら、終了
		if(this.timer)return;
		this.sn = 16 + (this.count>>2);
		if(this.sn==27)
		{
			this.kill = true;
			return;
		}
		super.draw();
	}
}

// もっと派手な爆発
function explosion(x, y, vx, vy)
{
	expl.push(new Expl(0, x, y, vx, vy));
	for(let i = 0; i < 10; i++)
	{
		let evx = vx + (rand(-10,10)<<6);
		let evy = vy + (rand(-10,10)<<6);
		expl.push(new Expl(i, x, y, evx, evy));
	}
}

// キーボードが押されたとき
document.onkeydown = function(e)
{
	key[ e.keyCode ] = true;
	// "Enter"キーを押すとゲーム開始
	if( title && e.keyCode == 13){
		gameInit();
	} else if( gameOver && e.keyCode == 13 || gameClear && e.keyCode == 13) {
		// "Enter"キーを押すとタイトル画面
		titleScreen();
	}
}

// キーボードが離されたとき
document.onkeyup = function(e)
{
	key[ e.keyCode ] = false;
}

// スプライトを描画する
function drawSprite(snum, x, y)
{
	let sx = sprite[snum].x;
	let sy = sprite[snum].y;
	let sw = sprite[snum].w;
	let sh = sprite[snum].h;
	
	// スプライトの位置が画面外であれば、描画スキップ
	let px = (x>>8) - sw / 2;
	let py = (y>>8) - sh / 2;
	
	if( px+sw < camera_x || px >= camera_x+SCREEN_W 
			|| py+sh < camera_y || py >= camera_y+SCREEN_H )return;
	
	vcon.drawImage( spriteImage, sx, sy, sw, sh, 
					px, py, sw, sh);
}

//整数のランダムを作る
function rand(min,max)
{
	return Math.floor( Math.random()*(max-min+1) )+min;
}

// 当たり判定
function checkHit(x1, y1, r1, x2, y2, r2)
{
	// 円同士の当たり判定
	let a = (x2-x1)>>8;
	let b = (y2-y1)>>8;
	let r = r1 + r2;
	
	return r*r >= a*a + b*b ;
}
