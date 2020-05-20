// jiki.js 自機関連

// 弾のクラス
class Tama extends CharaBase
{
	constructor(x, y, vx, vy)
	{
		super(5,x,y,vx,vy);
		this.r = 4;
	}
	
	// 弾の移動
	update()
	{
		super.update();
		
		// 弾それぞれで敵に当たっているかチェック
		for(let i = 0; i < teki.length; i++)
		{
			if( !teki[i].kill )
			{
				if( checkHit(this.x, this.y, this.r,
				teki[i].x, teki[i].y, teki[i].r) )
				{
					this.kill = true;
					if( (teki[i].hp -= 10) <= 0 )
					{
						teki[i].kill = true;
						// 撃破した敵を爆破
						explosion(teki[i].x, teki[i].y, teki[i].vx>>3, teki[i].vy>>3);
						// 敵撃破時se再生
						sound_list["explode"].play();
						// 次呼ばれた時用に新たに生成
						sound_list["explode"] = new Audio( sound_list["explode"].src );
						score += teki[i].score;
					}
					else
					{
						expl.push( new Expl( 0, this.x, this.y, 0, 0 ) );
					}
					// 弾がボスに当たったら、HPを表示
					if( teki[i].mhp >= 1000 )
					{
						bossHP = teki[i].hp;
						bossMHP = teki[i].mhp;
					}
					break;
				}
			}
		}
	}
	
	// 弾の描画
	draw()
	{
		super.draw();
	}
}

// 自機のクラス
class Jiki
{
	constructor()
	{
		this.x = (FIELD_W/2)<<8;
		this.y = (FIELD_H/2)<<8;
		this.r = 3;
		this.speed = 512;
		this.anime = 0;
		this.reload = 0;
		this.relo2 = 0;
		this.damage = 0;
		this.muteki = 0;
		this.count = 0;
		this.mhp = 100;
		this.hp = this.mhp;
	}
	
	// 自機の移動
	update()
	{
		this.count++;
		//ダメージを自然回復
		if(this.damage) this.damage--;
		if(this.muteki) this.muteki--;
		// ショット
		if( key[32] && this.reload === 0) {
			tama.push(new Tama(this.x+(6<<8), this.y-(10<<8),    0, -2000));
			tama.push(new Tama(this.x-(6<<8), this.y-(10<<8),    0, -2000));
			tama.push(new Tama(this.x+(8<<8), this.y-(5<<8),  200, -2000));
			tama.push(new Tama(this.x-(8<<8), this.y-(5<<8), -200, -2000));
			this.reload = 4;
			if(++this.relo2==4){
				this.reload = 20;
				this.relo2 = 0;
			}
		}
		// リロード処理
		if(!key[32]) this.reload = this.relo2 = 0;
		if(this.reload > 0) this.reload--;
		// 左
		if( key[37]) {
			this.x-=this.speed;
			if(this.anime > -8) this.anime--;
		}
		// 右
		else if( key[39]) {
			this.x+=this.speed;
			if(this.anime < 8) this.anime++;
		}
		else {
			// 左も右も入力されていないとき、animeを0に戻す
			if(this.anime>0) this.anime--;
			if(this.anime<0) this.anime++;
		}
		// 上
		if( key[38])this.y-=this.speed;
		// 下
		if( key[40])this.y+=this.speed;
		
		// ここで範囲チェックをする
		if(this.x<0)this.x=0;
		if(this.x>=(FIELD_W<<8))this.x=(FIELD_W<<8)-1;
		if(this.y<0)this.y=0;
		if(this.y>=(FIELD_H<<8))this.y=(FIELD_H<<8)-1;
	}
	
	// 自機の描画
	draw()
	{	
		// もし無敵かつcountが2で割り切れるなら、終了
		if(this.muteki && (this.count&1))return;
		drawSprite(2 + (this.anime>>2), this.x, this.y);
		// もしcountが2で割り切れないなら、自機後ろの炎を描画
		if(this.muteki && (this.count&1))return;
		drawSprite(9 + (this.anime>>2), this.x, this.y+(24<<8));
	}
}

// 自機被弾時
function jikiDamage(damage) {
	if( (jiki.hp -= damage) <= 0 )
	{
		// 自機のHPが0になったらゲームオーバー
		gameOverScene();
	}
	else
	{
		// 被弾時se再生
		sound_list["damage"].play();
		// 次呼ばれた時用に新たに生成
		sound_list["damage"] = new Audio( sound_list["damage"].src );
		jiki.damage = 10;
		jiki.muteki = 60;
	}
}