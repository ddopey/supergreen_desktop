'use strict';

//initial class to inherit every square object from it

class Rectangle {
   constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
   }
}

//insert from beholder

class Asteroid {
   constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.vX = vX;
      this.vY = vY;
   }
}

// end insert from beholder

class Obstacle extends Rectangle { 
   constructor(x, y, width, height) {
   super(x, y, width, height);
   this.border = false;
   }
}

class Box extends Rectangle {
   constructor(x, y, width, height) {
   super(x, y, width, height);
   this.initialX = x;
   this.initialY = y;
   this.cont = false;
   }
}

class Player extends Rectangle {
      constructor(x, y, width, height, to_x,  to_y) {
      super(x, y, width, height);
      this.alive = true;
      this.health = 100;
      this.doorkeys = 0;
   }
}

class Portal extends Rectangle {
	constructor(x, y, width, height, to_x,  to_y) {
		super(x, y, width, height);
		this.to_x = to_x;
		this.to_y = to_y;
	}
}

class Enemy extends Rectangle {
   constructor(x, y, width, height, axle) {
   super(x, y, width, height);
   this.initialX = x;
   this.initialY = y;
   this.axle = axle;
   this.step = 0;
   this.direction = "right";
   this.alive = "true";
   this.func = '';
   this.enemy_not_moving = true;
   
   }

   move(player, sounds) { 
      context.clearRect(this.x, this.y, this.width, this.height);
      let currentX = this.x;
      let currentY = this.y;
      let dir_value = 0;
      this.axle === "horizontal" ? dir_value = this.x : dir_value = this.y;
      if((this.step < 15)&&(this.directrion === "left")) {
         //this.x -= this.width/3;
         dir_value -= this.width/3; 
         this.step += 1;
     } 
     else if ((this.step >= 15)&&(this.directrion === "left")) {
         this.step = 0;
         this.directrion = "right";
     }
      else if((this.step < 15)&&(this.direction === "right")) {
       //this.x += this.width/3;
       dir_value += this.width/3;
       this.step += 1;  
     } else if((this.step >= 15)&&(this.direction === "right")) {
         this.step = 0;
         this.directrion = "left";
     }
     this.axle === "horizontal" ? this.x = dir_value : this.y = dir_value;

      //obstacles collision detection
      if(obstacles.length){
         obstacles.forEach(elem => {
            if(game.coll_detection(elem.x, elem.y, elem.width, elem.height, this.x, this.y, this.width, this.height)) {
              this.x = currentX;
              this.y = currentY;
              //this.step = 0;
              if(this.direction === "right") {
               this.directrion = "left";
               }
              else if(this.direction === "left") {
               this.direction = "right";
               }

            }
         });
      }
      //crates collision detection
      if(crates.length) {
         crates.forEach(elem => {
            if(game.coll_detection(elem.x, elem.y, elem.width, elem.height, this.x, this.y, this.width, this.height)) {
              this.x = currentX;
              this.y = currentY;
              //this.step = 0;
              if(this.direction === "right") {
               this.directrion = "left";
               }
              else if(this.direction === "left") {
               this.direction = "right";
               }

            }
         });
      }
     context.drawImage(monster, 0, 0, 300, 300, this.x, this.y, this.width, this.height);
      //lava collision detection
      lava.forEach(lava => {
         if(game.coll_detection(this.x, this.y, this.width, this.height, lava.x, lava.y, lava.width, lava.height)){
            if(sounds()) {
              document.getElementById('explmonster').play();
            }
            context.clearRect(this.x, this.y, this.width, this.height);
            newcontext.drawImage(explosion, 0, 0, 142, 200, lava.x, lava.y, lava.width, lava.height);
            context.drawImage(lava_tile, 0, 0, 2000, 2000, lava.x, lava.y, lava.width, lava.height);
            if(monsters.length) {
               clearInterval(this.func);
               let index = borders.indexOf(this);
               monsters.splice(index, 1);
            }
            
         } 
      });
      //player collision detection
   
      if(game.coll_detection(player.x, player.y, player.width, player.height, this.x, this.y, this.width, this.height)){
            if(sounds()) {
              document.getElementById('pain').play();
            }
            player.health -= 10;
            if(player.health < 0) { player.health = 0; }
            document.getElementById('life').innerText = `LIFE: ${player.health}%`;
            if(player.health <= 0) {
              if(sounds()) {
               document.getElementById('gameover').play();
               document.getElementById('gameover').onended = function(){
               const num = (Number(localStorage.getItem('level')));
               //localStorage.clear();
               localStorage.setItem('level', num);
               reload();
               }
              }
              else 
              {
               const num = (Number(localStorage.getItem('level')));
               localStorage.clear();
               localStorage.setItem('level', num);
               reload();
              }
            }
         }
      if(this.enemy_not_moving){
         this.func = setInterval(this.move.bind(this, player, sounds), 500);
      }
      this.enemy_not_moving = false;  
   }

}