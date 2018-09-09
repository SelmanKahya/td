const TILE_SIZE = 128;

var scenes = { preload: preload, create: create, update: update};
var game = new Phaser.Game(1920 + 128, 1280, Phaser.AUTO, 'tower-defense', scenes);

let map;
let groundLayer;
let roadlayer;
let envLayer;
let marker;

let hp = 10;
let towers;
let bullets;

let circle;
let graphics;
let showCircle = false;

var path = [
  {x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}, {x: 2, y: 5},
  {x: 2, y: 6}, {x: 2, y: 7}, {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8}, {x: 5, y: 8},
  {x: 6, y: 8}, {x: 6, y: 7}, {x: 6, y: 6}, {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3},
  {x: 7, y: 3}, {x: 8, y: 3}, {x: 9, y: 3}, {x: 10, y: 3}, {x: 11, y: 3}, {x: 12, y: 3},
  {x: 13, y: 3}, {x: 14, y: 3},
];

function preload () {
  game.load.tilemap('td-map-1', './assets/td-map-1.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tiles', './assets/tilesheet.png');
  game.load.image('tower', './assets/tower.png');
  game.load.image('enemy', './assets/enemy.png');
  game.load.image('bullet', './assets/bullet.png');
}

function create () {
  game.physics.startSystem(Phaser.Physics.ARCADE)

  map = game.add.tilemap('td-map-1');
  map.addTilesetImage('tilesheet', 'tiles');

  // currentTile = map.getTile(2, 3);
  groundLayer = map.createLayer('ground');
  groundLayer.resizeWorld();

  roadlayer = map.createLayer('road');
  roadlayer.resizeWorld();

  envLayer = map.createLayer('env');
  envLayer.resizeWorld();

  marker = game.add.graphics();
  marker.lineStyle(2, 0xffffff, 1);
  marker.drawRect(0, 0, TILE_SIZE, TILE_SIZE);

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(30, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 0.5);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);

  towers = game.add.group();
  game.physics.enable(towers, Phaser.Physics.ARCADE);

  enemys = game.add.group();
  enemys.enableBody = true;
  enemys.physicsBodyType = Phaser.Physics.ARCADE;

  var i = 0;
  var enemysBcl = setInterval(function() {
    if (i < 30) {
      new Enemy(path[0].x * TILE_SIZE, path[0].y * TILE_SIZE);
    } else {
      clearTimeout(enemysBcl);
    }
    i++;
  }, 2000);





        var text = "live: " + hp;
            var style = {font: "55px Arial", fill: "#ff0044", align: "center"};
            var t = game.add.text(700, 20, text, style);
            t.tint = "#000";
            t.inputEnabled = true;
  // t.events.onInputDown.add(generateEnemy, this);
  //
            var text = "+ Tower (bullet: " + bullets.length;
            var style = {font: "55px Arial", fill: "#ff0044", align: "center"};
            var t = game.add.text(700, 80, text, style);
            t.tint = "#000";
            t.inputEnabled = true;


  t.events.onInputDown.add(() => {
    showCircle = true
    game.input.onDown.add((game, pointer) => {
      var tileworldX = pointer.x - (pointer.x % TILE_SIZE);
      var tileworldY = pointer.y - (pointer.y % TILE_SIZE);
      var tileX = Math.floor(pointer.x / TILE_SIZE);
      var tileY = Math.floor(pointer.y / TILE_SIZE);

      let tileExists = map.getTile(tileX, tileY, 'road') || map.getTile(tileX, tileY, 'env');
      console.log(towers);
      let towerExists = false;
      for (let i = 0; i < towers.children.length; i++) {
        const tower = towers.children[i];
        if (tower.tileX === tileX && tower.tileY === tileY) {
          towerExists = true;
          break;
        }
      }
      if (!tileExists && !towerExists) {
        showCircle = false;
        graphics.destroy();
        new Tower(tileworldX, tileworldY, tileX, tileY, 'tower')
      }
    }, this);
  }, this);


    bmd = game.add.bitmapData(game.width, game.height);
    bmd.addToWorld();

}

function update() {
  game.debug.text('hp: ' + hp, 128, 128, '#ffffff', '50px Arial');

  const cursorX = game.input.activePointer.worldX;
  const cursorY = game.input.activePointer.worldY;

  marker.x = groundLayer && groundLayer.getTileX(cursorX) * TILE_SIZE;
  marker.y = groundLayer && groundLayer.getTileY(cursorY) * TILE_SIZE;

  if (showCircle) {
    var tileX = Math.floor(cursorX / TILE_SIZE) * 128 + 64;
    var tileY = Math.floor(cursorY / TILE_SIZE) * 128 + 64;

    circle = new Phaser.Circle(tileX, tileY, 500);
    graphics && graphics.destroy();
    graphics = game.add.graphics(0, 0);
    graphics.beginFill(0xff0000);
    graphics.drawCircle(circle.x, circle.y, circle.diameter);
    graphics.alpha= 0.2;
    graphics.endFill();
  }

  enemys.forEach(function(enemy) {
    Enemy.prototype.moveElmt(enemy);
  });

  towers.forEach(function(tower) {
    Tower.prototype.fire(tower);
  });

  game.physics.arcade.overlap(bullets, enemys, collisionHandler, null, this);
}

function collisionHandler(bullet, enemy) {
  const bulletX = bullet.world.x;
  const bulletY = bullet.world.y;
  const enemyX = enemy.world.x;
  const enemyY = enemy.world.y;

  const distance = Math.sqrt( Math.pow((bulletX - enemyX), 2) + Math.pow((bulletY - enemyY), 2));

  if (distance < 40) {
    bullet.kill();
    enemy.destroy();
  }
}








var Tower = function(worldX, worldY, tileX, tileY, tile) {
    var index = String(eval(tileX + "" + tileY));

  this.tower = game.add.sprite(worldX + TILE_SIZE / 2, worldY + TILE_SIZE / 2, tile);
    this.tower.worldX = worldX;
    this.tower.worldY = worldY;
    this.tower.tileX = tileX;
    this.tower.tileY = tileY;
    this.tower.tile = tile;
    this.tower.fireTime = 2000;
    this.tower.fireLastTime = game.time.now + this.tower.fireTime;
    this.tower.anchor.setTo(0.5, 0.5);
    towers.add(this.tower);
  // tileForbiden.push(index);
}

Tower.prototype.fire = function(tower) {
    if (game.time.now > tower.fireLastTime) {
        var bullet = bullets.getFirstExists(false);

        const enemyX = enemys.children[0].world.x;
        const enemyY = enemys.children[0].world.y;
        const towerX = tower.world.x;
        const towerY = tower.world.y;
        const distance = Math.sqrt( Math.pow((towerX - enemyX), 2) + Math.pow((towerY - enemyY), 2));

        if (distance < 500) {
          if (bullet && typeof enemys.children[0] != "undefined") {
              bullet.reset(towerX, towerY);
              bullet.anchor.setTo(0.5, 0.5);
              bullet.rotation = parseFloat(
                game.physics.arcade.angleToXY(bullet, enemys.children[0].x, enemys.children[0].y)
              ) * 180 / Math.PI;
              game.physics.arcade.moveToObject(bullet, enemys.children[0], 800);
              const angle = (Math.atan2(towerY - enemyY, towerX - enemyX) * 180 / Math.PI) + 360 - 90;
              tower.angle = angle;
            console.log(towerX, enemyX, towerY, enemyY);
          }
          tower.fireLastTime = game.time.now + tower.fireTime;
        }
    }
}







var Enemy = function(x, y) {
  this.enemy = game.add.sprite(path[0].x * TILE_SIZE + (TILE_SIZE / 2), path[0].y * TILE_SIZE + (TILE_SIZE / 2), 'enemy');
    this.enemy.anchor.setTo(0.5, 0.5);
    this.enemy.speed = 3;
    this.enemy.speedX = 0;
    this.enemy.speedY = 0;
    this.enemy.curTile = 0
    enemys.add(this.enemy);
    Enemy.prototype.nextTile(this.enemy);
    Enemy.prototype.moveElmt(this.enemy);
}

Enemy.prototype.moveElmt = function(enemy) {

    enemy.x += enemy.speedX;
    enemy.y += enemy.speedY;

    if (enemy.speedX > 0 && enemy.x >= enemy.next_positX) {
        enemy.x = enemy.next_positX;
        Enemy.prototype.nextTile(enemy);
    }
    else if (enemy.speedX < 0 && enemy.x <= enemy.next_positX) {
        enemy.x = enemy.next_positX;
        Enemy.prototype.nextTile(enemy);
    }
    else if (enemy.speedY > 0 && enemy.y >= enemy.next_positY) {
        enemy.y = enemy.next_positY;
        Enemy.prototype.nextTile(enemy);
    }
    else if (enemy.speedY < 0 && enemy.y <= enemy.next_positY) {
        enemy.y = enemy.next_positY;
        Enemy.prototype.nextTile(enemy);
    }

}

Enemy.prototype.nextTile = function(enemy) {
  enemy.curTile++;

  if (path[enemy.curTile]) {
    enemy.next_positX = parseInt(path[enemy.curTile].x * TILE_SIZE + (TILE_SIZE / 2));
    enemy.next_positY = parseInt(path[enemy.curTile].y * TILE_SIZE + (TILE_SIZE /  2));
      // on check le sens gauche/droite
      if (enemy.next_positX > enemy.x) {
          enemy.speedX = enemy.speed;
          enemy.angle = 0;
      } else if (enemy.next_positX < enemy.x) {
          enemy.speedX = -enemy.speed;
          enemy.angle = 180;
      } else {
          enemy.speedX = 0;
      }
      // on check le sens haut/bas
      if (enemy.next_positY > enemy.y) {
          enemy.speedY = enemy.speed;
          enemy.angle = 90;
      } else if (enemy.next_positY < enemy.y) {
          enemy.speedY = -enemy.speed;
          enemy.angle = -90;
      } else {
          enemy.speedY = 0;
      }
  } else {
    hp--;
    enemy.destroy();
  }
}
