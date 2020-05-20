// teki.js 敵関連

// 敵弾クラス
class Teta extends CharaBase
{
	constructor(sn, x, y, vx, vy, t)
	{
		super(sn,x,y,vx,vy);
		this.r = 3;
		if( t == undefined )this.timer = 0;
		else this.timer = t;
	}
	
	// 弾の移動
	update()
	{
		if( this.timer )
		{
			this.timer--;
			return;
		}
		super.update();
		
		// 弾それぞれで自機に当たっているかチェック
		if( !gameOver && !jiki.muteki && checkHit(this.x, this.y, this.r,
				jiki.x, jiki.y, jiki.r) )
		{
			this.kill = true;
			jikiDamage(10);
		}
		this.sn = 14 + ((this.count>>3)&1);
	}
	
	// 弾の描画
	draw()
	{
		super.draw();
	}
}

// 敵のクラス
class Teki extends CharaBase
{
	constructor(t, x, y, vx, vy)
	{
		super(0,x,y,vx,vy);
		// 敵マスタークラスを指定
		this.tnum = tekiMaster[t].tnum;
		this.r = tekiMaster[t].r;
		this.mhp = tekiMaster[t].hp;
		this.hp = this.mhp;
		this.score = tekiMaster[t].score;
		this.flag = false;
		// 弾を発射する方向
		this.dr = 90;
		// リロード時間
		this.relo = 0;
	}
	
	// 敵の移動
	update()
	{ 
		// 共通のアップデート
		if(this.relo)this.relo--;
		super.update();
		
		// 共通のアップデート
		tekiFunc[this.tnum](this);
		
		// 当たり判定
		if( !gameOver && !jiki.muteki && checkHit(this.x, this.y, this.r,
				jiki.x, jiki.y, jiki.r) )
		{
			if( (this.hp -= 100) <= 0 )
			{
				// 敵のHPが0になったら撃破
				this.kill = true;
			}
			jikiDamage(10);
		}
	}
	
	// 敵の描画
	draw()
	{
		super.draw();
	}
}

// 敵ショット
function tekiShot(obj, speed)
{
	// ゲームオーバー時は終了
	if(gameOver)return;
	// スプライトの位置が画面外であれば、弾を撃たない
	let px = (obj.x>>8);
	let py = (obj.y>>8);
	
	if( px-40 < camera_x || px+40 >= camera_x+SCREEN_W 
			|| py-40 < camera_y || py+40 >= camera_y+SCREEN_H )return;
	// 角度を計算
	let an, dx, dy;
	an = Math.atan2( jiki.y - obj.y, jiki.x - obj.x );
	 // 乱数を足して角度を調整
	an += rand( -10, 10 ) * Math.PI / 180;
	// ベクトルを計算
	dx = Math.cos(an) * speed;
	dy = Math.sin(an) * speed;
	// ベクトルをもとに、弾を発射
	teta.push(new Teta(15, obj.x, obj.y, dx, dy));
}

// ピンクのヒヨコの移動パターン
function tekiMove01(obj)
{
	// 自機の位置と敵の位置を比較し、X方向の速度を更新 
	if( !obj.flag )
	{
		if(jiki.x > obj.x && obj.vx < 120) obj.vx += 4;
		if(jiki.x < obj.x && obj.vx > -120) obj.vx -= 4;
	}
	else
	{
		if(jiki.x > obj.x && obj.vx < 400) obj.vx += 30;
		if(jiki.x < obj.x && obj.vx > -400) obj.vx -= 30;
	}
	// 自機とのY方向の距離を比較し、一定以下ならフラグを立てる
	if( Math.abs(jiki.y - obj.y) < (100<<8) && !obj.flag ) {
		obj.flag = true;
		tekiShot(obj,600);
	}
	// フラグ後は上昇
	if( obj.flag && obj.vy > -800 ) obj.vy -= 30;
	// スプライトの変更
	const ptn = [39,40,39,41];
	obj.sn = ptn[ (obj.count>>3)&3 ];
}

// 黄色のヒヨコの移動パターン
function tekiMove02(obj)
{
	// 自機の位置と敵の位置を比較し、X方向の速度を更新 
	if( !obj.flag )
	{
		if(jiki.x > obj.x && obj.vx < 120) obj.vx += 4;
		if(jiki.x < obj.x && obj.vx > -120) obj.vx -= 4;
	}
	else
	{
		if(jiki.x > obj.x && obj.vx < 400) obj.vx += 30;
		if(jiki.x < obj.x && obj.vx > -400) obj.vx -= 30;
	}
	// 自機とのY方向の距離を比較し、一定以下ならフラグを立てる
	if( Math.abs(jiki.y - obj.y) < (100<<8) && !obj.flag ) {
		obj.flag = true;
		tekiShot(obj,600);
	}
	// フラグ後は上昇
	if( obj.flag && obj.vy > -800 ) obj.vy -= 30;
	// スプライトの変更
	const ptn = [33,34,33,35];
	obj.sn = ptn[ (obj.count>>3)&3 ];
}

// ボスひよこ(黄色)の移動パターン
function tekiMove03(obj)
{
	// 自機とのY方向の距離を比較し、一定以下ならフラグを立てる
	if( !obj.flag && (obj.y>>8) >= 60)obj.flag=1;
	if(obj.flag==1)
	{
		if((obj.vy-=2) <= 0)
		{
			obj.flag = 2;
			obj.vy = 0;
		}
	}
	// X方向の移動、flag=2なら右に、flag=3なら左に移動
	else if(obj.flag==2)
	{
		if( obj.vx<300 )obj.vx+=10;
		if( (obj.x>>8) > (FIELD_W-100) )obj.flag=3;
	}
	else if(obj.flag==3)
	{
		if( obj.vx>-300 )obj.vx-=10;
		if( (obj.x>>8) < 100 )obj.flag=2;
	}
	// 弾の発射
	if( obj.flag > 1 && !obj.relo)
	{
		// 角度を計算
		let an, dx, dy;
		an = obj.dr * Math.PI / 180;
		// ベクトルを計算
		dx = Math.cos(an) * 300;
		dy = Math.sin(an) * 300;
		let x2 = (Math.cos( an ) * 70)<<8;
		let y2 = (Math.sin( an ) * 70)<<8;
		// ベクトルをもとに、弾を発射
		teta.push(new Teta(15, obj.x+x2, obj.y+y2, dx, dy, 60));
		// 角度を増やし、360以上になったら0に戻す
		if( (obj.dr += 16) >= 360 ) obj.dr = 0;
		// リロード時間
		obj.relo+=4;
	}
	
	// HP50%未満で追加攻撃
	if( obj.hp < obj.mhp/2 )
	{
		let c = obj.count%(60*5);
		if( c/10<4 && c%10==0 )
		{
			// 角度を計算
			let an, dx, dy;
			an = (90+45-(c/10)*30) * Math.PI / 180;
			// ベクトルを計算
			dx = Math.cos(an) * 300;
			dy = Math.sin(an) * 300;
			let x2 = (Math.cos( an ) * 70)<<8;
			let y2 = (Math.sin( an ) * 70)<<8;
			// ベクトルをもとに、新たな敵を生成
			teki.push(new Teki(3, obj.x+x2, obj.y+y2, dx, dy));
			// 角度を増やし、360以上になったら0に戻す
			if( (obj.dr += 16) >= 360 ) obj.dr = 0;
		}
	}
	// スプライトの変更
	obj.sn = 75;
}

// 黄色のヒヨコ(ボスのお供)の移動パターン
function tekiMove04(obj)
{
	if( obj.count == 10 )
	{
		obj.vx = obj.vy = 0;
	}
	if( obj.count == 60 )
	{
		obj.vy = 200;
		if( obj.x > jiki.x ) obj.vx = -70;
		else obj.vx = 70;
	}
	// スプライトの変更
	const ptn = [33,34,33,35];
	obj.sn = ptn[ (obj.count>>3)&3 ];
}

// 敵の移動パターンを格納した配列
let tekiFunc = [
	tekiMove01,
	tekiMove02,
	tekiMove03,
	tekiMove04,
];

// ゲームオーバー時
function gameOverScene() {
	gameOver = true;
	// BGMの停止
	document.getElementById('BGM').pause();
	document.getElementById('BGM_boss').pause();
	// ハイスコア更新
	if(highScore < score) {
		highScore = score;
	}
}