// create a new scene
let gameScene = new Phaser.Scene("Game");

// initiate scene parameters
gameScene.init = function() {
  // player speed
  this.playerSpeed = 3;
  
  // enemy speeds
  this.enemyMinSpeed = 2;
  this.enemyMaxSpeed = 4.5;

  // boundaries
  this.enemyMinY = 80;
  this.enemyMaxY = 280;

  this.isTerminating = false;

}

// load assets
gameScene.preload = function() {
  // load images
  this.load.image("background", "assets/background.png");
  this.load.image("player", "assets/player.png");
  this.load.image('enemy', 'assets/dragon.png');
  this.load.image('treasure', 'assets/treasure.png');
};

// called once after preload ends
gameScene.create = function() {
  // create bg sprite
  let bg = this.add.sprite(0, 0, "background");

  // change origin to top-left corner
  // bg.setOrigin(0, 0)

  // set posiiton to center of image
  bg.setPosition(640 / 2, 360 / 2);

  this.player = this.add.sprite(30, this.sys.game.config.height / 2, 'player');
  
  // reducing width and height by half 
  this.player.setScale(0.5)
  
  // goal
  this.goal = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height/2, 'treasure');

  this.goal.setScale(0.5);

  // enemy group
  this.enemies = this.add.group({
    key: 'enemy',
    repeat: 5,
    setXY: {
      x: 90,
      y: 100,
      stepX: 90,
      stepY: 20
    }
  });
  
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4)
  
  // set flipX, and speed
  Phaser.Actions.Call(this.enemies.getChildren(),function(enemy) {
    // flip enemy
    enemy.flipX = true;

    // set speed
    let dir = Math.random() < 0.5 ? 1 : -1;
    let speed = Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed) + this.enemyMinSpeed;
    enemy.speed = dir * speed;
  }, this)

  this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
  this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
  this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
  this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

};

// this is called up to 60 times per second
gameScene.update = function() {

  // dont execute if terminating is true
  if (this.isTerminating) return;
  
  
  // check for active input
  if (this.keyRight.isDown) {
    // player walks
    this.player.flipX = false;
    this.player.x += this.playerSpeed;
  } else if (this.keyLeft.isDown) {
    this.player.flipX = true;
    this.player.x -= this.playerSpeed;
  }
  // } else if (this.keyUp.isDown && this.player.y <= this.enemyMaxY) {
  //   this.player.y -= this.playerSpeed;
  // } else if (this.keyDown.isDown && this.player.y >= this.enemyMinY) {
  //   this.player.y += this.playerSpeed;
  // }

  // treasure overlap check
  let playerRect = this.player.getBounds();
  let treasureRect = this.goal.getBounds();

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
    
    // restart scene
    return this.gameWin();
  }
  
  // get enemies
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {

    //enemy movement
    enemies[i].y += enemies[i].speed;
  
    // check we haven't passed min Y
    let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
    // check we haven't passed max Y
    let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;
    
    // if we pass upper or lower limit, reverse
    if (conditionUp || conditionDown) {
      enemies[i].speed *= -1
    }

    let enemyRect = enemies[i].getBounds();
    // check enemy overlap
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      // restart scene
      return this.gameOver();
    }
  }
}

gameScene.gameWin = function() {
  this.isTerminating = true;
  alert('You win!!! All of the treasure is yours!!!')
  this.cameras.main.fade(300);

  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect) {
    this.scene.restart();
  }, this)
}

gameScene.gameOver = function() {

  // initiate game over sequence
  this.isTerminating = true;

  // shake camera
  this.cameras.main.shake(500, 0.01);

  // listen for event completion
  this.cameras.main.on('camerashakecomplete', function(camera, effect) {
    this.cameras.main.fade(300);
  }, this)
  
  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect) {
    this.scene.restart();
  }, this)
}

// set configuration of the game
let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene
};

// create a new game, pass configuration
let game = new Phaser.Game(config);
