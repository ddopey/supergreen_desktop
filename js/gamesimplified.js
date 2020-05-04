'use strict';

const max_levels = 24;

var inputStates = {};

//insert from beholder
let Animation;
//end of insert from beholder

// the object to keep the game inside
let game = {}

//flag to switch music on and off
game.musicon = false;

//flag to switch sound on and off
game.sounds = true;

//flag to choose the mode of the game
if(localStorage.getItem('blind')) {
  game.blind = localStorage.getItem('blind');
}
else {
  game.blind = 'false';
  localStorage.setItem('blind', 'false');
}
//flag to see if the menu is switched on
game.menuclicked = false;

//the world dimensions and initial state

//window dimensions
let w = window.innerWidth;
let h = window.innerHeight;

//back canvas
let canvas = document.querySelector("#can");
let context = canvas.getContext("2d");

//front canvas
let newcanvas = document.querySelector("#newcanvas");
var newcontext = newcanvas.getContext("2d");

//variable to keep the dimension of one cell of the map
let cellSide = 0;

if (h < w) {
	cellSide = h/25;
	canvas.width = canvas.height = newcanvas.width = newcanvas.height = h;
	canvas.style.left = newcanvas.style.left = (w - h)/2+"px";
	canvas.style.top = newcanvas.style.top = 0;
}
else {
	cellSide = w/25;
	canvas.width = canvas.height = newcanvas.width = newcanvas.height = w;
	canvas.style.top = newcanvas.style.top = (h - w)/2+"px";
	canvas.style.left = newcanvas.style.left = 0;
}

//insert from beholder

const x = 20+(Math.random()*(canvas.width-40));
const y = 20+(Math.random()*(canvas.height-40));
const radius = Math.round(canvas.width/25);
const vX = 8;
const vY = 8;

let superball = new Asteroid (x, y, radius, vX, vY);

//end insert from beholder

let obstacles = [],
    lava = [],
    crates = [],
    monsters = [],
    portal = [],
    gates = [],
    doorkeys = [],
    player,
    door,
    level;

if(localStorage.getItem('level')) {
	level = Number(localStorage.getItem('level'));
} else {
  level = 1
}

//function to switch sound on and off
game.soundon = function() {
  if(game.sounds==false){document.getElementById('soundcontrol').style.opacity="1"; game.sounds=true;}
  else if (game.sounds) {document.getElementById('soundcontrol').style.opacity="0.5"; game.sounds=false;}
}

game.get_sounds = function() {
  return game.sounds;
}

game.music = function() {
  if(game.musicon==false){document.getElementById('music').style.opacity="1"; game.musicon=true; document.getElementById("sound").play();}
else if (game.musicon==true) {document.getElementById('music').style.opacity="0.5"; game.musicon=false; document.getElementById("sound").pause();}
}

game.clear_fog = function () {
   newcontext.globalCompositeOperation = "destination-out";
   newcontext.fillStyle = 'rgba(255,255,255,1)';
   newcontext.beginPath();
   newcontext.arc(player.x + player.width/2, player.y + player.height/2,
   player.width * 2.5, 0,
   Math.PI*2, false);
   newcontext.closePath();
   newcontext.fill();
   newcontext.globalCompositeOperation = "source-over";
}


game.coll_detection = function(x1, y1, width1, height1, x2, y2, width2, height2) {
  if ((x1 < (x2 + width2)) &&
   ((x1 + width1) > x2) &&
   (y1 < (y2 + height2)) &&
   ((height1 + y1) > y2)) {
  	return true;
  }
  return false;
}


game.draw_player = function() {
   //drawing the player on the front canvas
   newcontext.drawImage(dwarf1, 0, 0, 200, 185, player.x, player.y, player.width, player.height);
}

game.draw_arr = function(arr, image, image_x, image_y) {
   if(arr.length){
      arr.forEach(el =>  {
         context.drawImage(image, 0, 0, image_x, image_y, el.x, el.y, el.width, el.height);
      })
   }
}

game.arr_resize = function(arr, ratio) {
  if(arr.length) {
    arr.forEach(elem => {
      elem.x *= ratio;
      elem.y *= ratio;
      elem.width *= ratio;
      elem.height *= ratio;
    });
  }
}

game.draw_initial = function () {
  
  //drawing the fog of war on the front canvas
   newcontext.fillStyle = "black";
   newcontext.fillRect(0, 0, canvas.width, canvas.height);
   
   //drawing the portals
   game.draw_arr(portal, portalimage, 512, 512);

   //drawing the crates
   game.draw_arr(crates, crate, 512, 512);

   //drawing the monsters
   game.draw_arr(monsters, monster, 300, 300);
   monsters.forEach(elem => elem.move(player, game.get_sounds));

   //drawing gates
   game.draw_arr(gates, gate, 512, 512);

   //drawing doorkeys
   game.draw_arr(doorkeys, doorkey, 512, 512);

   //drawing the door
   context.drawImage(door_image, 0, 0, 512, 512, door.x, door.y, door.width, door.height);

   //drawing the obstacles
   obstacles.forEach(elem => elem.border ? context.drawImage(border, 0, 0, 191, 191, elem.x, elem.y, elem.width, elem.height) : context.drawImage(square_obstacle_image, 0, 0, 384, 384, elem.x, elem.y, elem.width, elem.height));
   //drawing lava squares
   if(lava.length) {
    lava.forEach(elem => context.drawImage(lava_tile, 0, 0, 200, 200, elem.x, elem.y, elem.width, elem.height));
   }
   //clearing the white circle around the player at the front canvas
   game.clear_fog();
   //drawing the player
   game.draw_player();
}

game.init = function () {
   let portals_number = 0;
	map[level-1].forEach((elem, index, arr) => {
		elem.forEach((el, ind, ar) => {
			if(el === 1) {
				obstacles.push(new Obstacle(ind * cellSide, index * cellSide, cellSide, cellSide));
			}
			else if(el === 2) {
				door = new Rectangle(ind * cellSide, index * cellSide, cellSide, cellSide);
			}
			else if (el === 3) {
				lava.push(new Rectangle(ind * cellSide, index * cellSide, cellSide, cellSide));
			}
			else if (el === 4) {
            portal.push(new Portal(ind * cellSide, index * cellSide, cellSide, cellSide, portals[level-1][portals_number][0] * cellSide, portals[level-1][portals_number][1] * cellSide));
            portals_number += 1;
			}
			else if (el === 5) {
				obstacles.push(new Obstacle(ind * cellSide, index * cellSide, cellSide, cellSide));
				obstacles[obstacles.length-1].border = true;
			}
         else if (el === 6) {
            crates.push(new Box(ind * cellSide, index * cellSide, cellSide * 0.8, cellSide * 0.8));
         }
         else if (el === 7.1) {
            monsters.push(new Enemy(ind * cellSide, index * cellSide, cellSide, cellSide, "horizontal"));
         }
         else if (el === 7.2) {
            monsters.push(new Enemy(ind * cellSide, index * cellSide, cellSide, cellSide, "vertical"));
         }
         else if (el === 8) {
            gates.push(new Rectangle(ind * cellSide, index * cellSide, cellSide, cellSide));
         }
         else if (el === 9) {
            doorkeys.push(new Rectangle(ind * cellSide, index * cellSide, cellSide, cellSide));
         }
         else if(el === 69) {
            crates.push(new Box(ind * cellSide, index * cellSide, cellSide * 0.8, cellSide * 0.8));
            crates[crates.length-1].cont = "clue";
         }
         else if (el === 10) {
          player = new Player(ind * cellSide, index * cellSide, cellSide-cellSide/4, cellSide-cellSide/4);
         }
		})
	});
   game.draw_initial();

   //showing the sounds control
   document.getElementById('soundcontrol').style.display = "block";
   //showing the music control
   document.getElementById('music').style.display = "block";
   //showing the reload
   document.getElementById('rel').style.display = "block";
   //showing the health of the player
   document.getElementById('life').style.display = "block";
}

function startlevel() {
		document.getElementById('startscreen').style.display = "none";
		document.getElementById('winscreen').style.display = "none";
		canvas.style.display = "block";
		newcanvas.style.display = "block";
    game.music();
		//drawing the initial details
		game.init();
    if(game.blind === 'true') {
    game.animate();
    } 
    else {
      clearTimeout(Animation);
    }
}

function reload() {
	window.location.reload();
}

function resize_window () {
  
  const oldcell = cellSide;
  let ratio;

  w = window.innerWidth;
  h = window.innerHeight;

  if (h < w) {
  cellSide = h/25;
  canvas.width = canvas.height = newcanvas.width = newcanvas.height = h;
  canvas.style.left = newcanvas.style.left = (w - h)/2+"px";
canvas.style.top = newcanvas.style.top = 0;
  }
  else {
    cellSide = w/25;
    canvas.width = canvas.height = newcanvas.width = newcanvas.height = w;
    canvas.style.top = newcanvas.style.top = (h - w)/2+"px";
canvas.style.left = newcanvas.style.left = 0;
  }
  ratio = cellSide/oldcell;

  Array.from(document.querySelectorAll('.text')).forEach(el => el.style.fontSize = cellSide + "px");
  game.arr_resize(obstacles, ratio);
  game.arr_resize(lava, ratio);
  game.arr_resize(portal, ratio);
  game.arr_resize(crates, ratio);
  game.arr_resize(monsters, ratio);
  game.arr_resize(gates, ratio);
  game.arr_resize(doorkeys, ratio);

  door.x *= ratio;
  door.y *= ratio;
  door.width *= ratio;
  door.height *= ratio;

  player.x *= ratio;
  player.y *= ratio;
  player.width *= ratio;
  player.height *= ratio;

  game.draw_initial();
}

window.addEventListener('resize', resize_window);
window.addEventListener('orientationchange', resize_window);

window.onload = function () {
Array.from(document.querySelectorAll('.text')).forEach(el => el.style.fontSize = cellSide + "px");
  if(Number(localStorage.getItem('level')) > 1) {
     document.getElementById('startscreen').style.display = "block";
     document.getElementById("startscreen").innerText = `CLICK TO START LEVEL ${localStorage.getItem('level')}!`;
     document.getElementById('start').style.display = "none";
  } else {
      localStorage.setItem('level', 1);
      //we show the gamename screen
      document.getElementById('gamename').style.display = "block";
      //we attach showing the menu and concealing the gamename
      document.getElementById('gamename').addEventListener('click', function(){
        document.getElementById('menu').style.display = "block";
        this.style.display = "none";
      });
  }
  // we attach the function to control the play button of the menu
  document.getElementById('start').addEventListener('click', function() {
    document.getElementById('menu').style.display = "none";
    document.getElementById('startscreen').style.display = "block";
    document.getElementById("startscreen").innerText = `CLICK TO START LEVEL 1!`;
    this.style.display = "none";
  });

  document.getElementById('easy').addEventListener('click', function() {
    localStorage.setItem('blind', 'false');
    game.blind = 'false';
    this.style.display = "none";
    clearTimeout(Animation);
    document.getElementById('hard').style.display = "block";
    document.getElementById('easy').style.display = "none";
  });
  
  document.getElementById('hard').addEventListener('click', function() {
    localStorage.setItem('blind', 'true');
    game.blind = 'true';
    //this.style.display = "none";
    document.getElementById('easy').style.display = "block";
    document.getElementById('hard').style.display = "none";
    game.animate();
  });

document.getElementById('startscreen').addEventListener('click', startlevel);

//starting the game after clicking on the winscreen
document.getElementById('winscreen').addEventListener('click', reload);

//starting the game after clicking on the winscreen
document.getElementById('winner').addEventListener('click', reload);

//handler to switch the sounds on and off 
document.getElementById('soundcontrol').addEventListener('click' , game.soundon);

//handler to switch the music on and off
document.getElementById('music').addEventListener('click' , game.music);

//handler to the menu button
document.getElementById('rel').addEventListener('click', function() {
  if(game.menuclicked) {
    document.getElementById('menu').style.display = 'none';
    canvas.style.display = "block";
    newcanvas.style.display = "block";
    game.menuclicked = false;
  } else {
    game.menuclicked = true;
    canvas.style.display = "none";
    newcanvas.style.display = "none";
    document.getElementById('menu').style.display = 'block';
    document.getElementById('hard').style.display = 'none';
    document.getElementById('easy').style.display = 'none';
  }
});

//handler to reload the level
document.getElementById('reld').addEventListener('click', reload);

//handler to reset the progress
document.getElementById('reset').addEventListener('click', function() {
  localStorage.clear();
  reload();
});

//keyboard input events 
window.addEventListener('keydown', function(event){
if (event.keyCode === 37) {
inputStates.left = true;
          } 
else if (event.keyCode === 38) {
inputStates.up = true;} 
else if (event.keyCode === 39) {
             inputStates.right = true;
          } else if (event.keyCode === 40) {
             inputStates.down = true;
          }  else if (event.keyCode === 32) {
             inputStates.space = true;
          }
     game.updateposition();}, false);

   //if the key will be released, change the states object 
window.addEventListener('keyup', function(event){
//event.preventDefault();
      if (event.keyCode === 37) {
         inputStates.left = false;
      } else if (event.keyCode === 38) {
         inputStates.up = false;
      } else if (event.keyCode === 39) {
         inputStates.right = false;
      } else if (event.keyCode === 40) {
         inputStates.down = false;
      } else if (event.keyCode === 32) {
         inputStates.space = false;
      }
}, false);

}

game.animate = function () {
   newcontext.globalCompositeOperation = "source-over";
   newcontext.fillStyle = "rgb(0, 0, 0)";
   newcontext.fillRect(0, 0, canvas.width, canvas.height);
   superball.x += superball.vX;
   superball.y += superball.vY;
   if (superball.x-superball.radius < 0) {
   superball.x = superball.radius;
   superball.vX *= -1;
   } else if (superball.x+superball.radius > canvas.width) {
   superball.x = canvas.width-superball.radius;
   superball.vX *= -1;
   };
   if (superball.y-superball.radius < 0) {
   superball.y = superball.radius;
   superball.vY *= -1;
   } else if (superball.y+superball.radius > canvas.height) {
   superball.y = canvas.height-superball.radius;
   superball.vY *= -1;
   };

   newcontext.globalCompositeOperation = "destination-out";

   newcontext.fillStyle = 'rgba(255,255,255,1)';
   newcontext.beginPath();
   newcontext.arc(superball.x, superball.y,
   superball.radius, 0,
   Math.PI*2, false);
   newcontext.closePath();
   newcontext.fill();

   game.clear_fog();
   game.draw_player();
   Animation = setTimeout(game.animate, 33);
}

//function describing updating the position of the player
   game.updateposition = function () {
      game.clear_fog();

      let pw2 = player.width/4,
          ph2 = player.height/4;

      //check inputStates and update the position of the player
      if ((inputStates.left)&&(!inputStates.up)&&(!inputStates.down)&&(!inputStates.right)) {
            player.x = player.x - pw2;      
      }
      if ((inputStates.up)&&(!inputStates.left)&&(!inputStates.down)&&(!inputStates.right)) {
         player.y = player.y - ph2;
      }
      if ((inputStates.right)&&(!inputStates.up)&&(!inputStates.down)&&(!inputStates.left)) {
            player.x = player.x + pw2;
      }
      if ((inputStates.down)&&(!inputStates.up)&&(!inputStates.left)&&(!inputStates.right)) {
         player.y = player.y+ph2;
      } 

      //crates collision detection

      //a flag to see if the box collides with a border or an obstacle
      let obstacles_detection = false;

      crates.forEach((elem, index, arr) => {
         //we check if the player touches the box
         if(game.coll_detection(player.x, player.y, player.width, player.height, elem.x, elem.y, elem.width, elem.height))
            {//document.getElementById("hitthebrick").play();

            //here we keep old coordinates of the box
            let oldX = elem.x;
            let oldY = elem.y;
            let oldWidth = elem.width;
            let oldHeight = elem.height;
            //we check where the player moves and change the box coordinates accordingly i.e. we move the box
            if(inputStates.right) {
                  elem.x = player.x + player.width;
               }
               else if(inputStates.left) {
                  elem.x = player.x - elem.width;
               }
               else if(inputStates.up) {
                  elem.y = player.y - elem.height;
               }
               else if(inputStates.down) {
                  elem.y = player.y + player.height;
               }
               //we check if the box collides with an obstacle
               obstacles.forEach(el => {
                  if(game.coll_detection(el.x, el.y, el.width, el.height, elem.x, elem.y, elem.width, elem.height)) {
                     obstacles_detection = true;
                  }
               });
               //we check if the box collides with an enemy
               monsters.forEach(el => {
                  if(game.coll_detection(el.x, el.y, el.width, el.height, elem.x, elem.y, elem.width, elem.height)) {
                     obstacles_detection = true;
                  }
               });

               //we check if the box collides with a closed door
               gates.forEach(el => {
                  if(game.coll_detection(el.x, el.y, el.width, el.height, elem.x, elem.y, elem.width, elem.height)) {
                     obstacles_detection = true;
                  }
               });
               
               //we check if box collides with another box

               //copy the crates array
               let copy_array = [...crates];
               //delete this elem from the copied array of boxes
               copy_array.splice(index, 1);
               //we check if this elem collides with another box
               copy_array.forEach(box => {
                  if(game.coll_detection(box.x, box.y, box.width, box.height, elem.x, elem.y, elem.width, elem.height)) {
                     obstacles_detection = true;
                  }
               });
               
               if(obstacles_detection) {
               //if it does we change the box coordinates to the old ones
                  elem.x = oldX;
                  elem.y = oldY;
                  elem.width = oldWidth;
                  elem.height = oldHeight;
               //we check where the player and the box collide and move the player back to his old coordinates
                  if(game.coll_detection(player.x, player.y, player.width, player.height, elem.x, elem.y, elem.width, elem.height))
                  {
                  if(inputStates.right) {
                        player.x = elem.x - player.width;
                     }
                     else if(inputStates.left) {
                        player.x = elem.x + elem.width;
                     }
                     else if(inputStates.up) {
                        player.y = elem.y + elem.height;
                     }
                     else if(inputStates.down) {
                        player.y = elem.y - player.height;
                     }
                  }
               //otherwise we draw the box at the new location
               } else {
                  context.clearRect(oldX, oldY, oldWidth, oldHeight);
                  context.drawImage(crate, 0, 0, 512, 512, elem.x, elem.y, elem.width, elem.height);
               }
            //check if the box collides with lava
            lava.forEach((lav,i,arr) => {
               if(game.coll_detection(elem.x, elem.y, elem.width, elem.height, lav.x, lav.y, lav.width, lav.height)){
                  if(game.sounds) {document.getElementById('boxexplosion').play();}
                  context.clearRect(elem.x, elem.y, elem.width, elem.height);
                  newcontext.drawImage(explosion, 0, 0, 142, 200, lav.x, lav.y, lav.width, lav.height);
                  context.drawImage(lava_tile, 0, 0, 2000, 2000, lav.x, lav.y, lav.width, lav.height);
                  if(elem.cont === "clue") {
                     doorkeys.push(new Rectangle(elem.x, elem.y - cellSide, elem.width, elem.height));
                     context.clearRect(lav.x, lav.y, lav.width, lav.height);
                     newcontext.clearRect(lav.x, lav.y, lav.width, lav.height);
                     lava.splice(i,1)
                     context.drawImage(doorkey, 0, 0, 512, 512, elem.x, elem.y - cellSide, elem.width, elem.height);

                  }
                  crates.splice(index, 1);
               } 
            });
            
            //check if the box collides with a portal
            if(portal.length) {
               portal.forEach(port => {
                  if(game.coll_detection(elem.x, elem.y, elem.width, elem.height, port.x, port.y, port.width, port.height)) {
                     if(game.sounds) {document.getElementById('portalsound').play();}
                        context.clearRect(elem.x, elem.y, elem.width, elem.height);
                        context.drawImage(portalimage, 0, 0, 512, 512, port.x, port.y, port.width, port.height);
                        elem.x = elem.initialX;
                        elem.y = elem.initialY;
                        context.drawImage(crate, 0, 0, 512, 512, elem.x, elem.y, elem.width, elem.height);
                  }
               });
            }  
         }
      })

      //player keys collision detection
      if(doorkeys.length) {
         doorkeys.forEach((elem, index, arr) => {
            if (game.coll_detection(player.x, player.y, player.width, player.height, elem.x, elem.y, elem.width, elem.height)) {
               if(game.sounds) {document.getElementById('keycollected').play();}
               player.doorkeys += 1;
               context.clearRect(elem.x, elem.y, elem.width, elem.height);
               doorkeys.splice(index, 1);
            }
         });
      }

      //player gates collision detection
      if(gates.length) {
         gates.forEach((elem, index, arr) => {
            if(game.coll_detection(player.x, player.y, player.width, player.height, elem.x, elem.y, elem.width, elem.height)) {
               if(player.doorkeys) {
                  if(game.sounds) {document.getElementById('keycollected').play();}
                  player.doorkeys -= 1;
                  context.clearRect(elem.x, elem.y, elem.width, elem.height);
                  gates.splice(index, 1);
               } else {
                 if(game.sounds) {document.getElementById('failopendoor').play();}
                  if(inputStates.right) {
                     player.x = elem.x - player.width;
                  }
                  else if(inputStates.left) {
                     player.x = elem.x + elem.width;
                  }
                  else if(inputStates.up) {
                     player.y = elem.y + elem.height;
                  }
                  else if(inputStates.down) {
                     player.y = elem.y - player.height;
                  }

               }
            }
         });
      }
      

      //player obstacles collision detection
      obstacles.forEach(elem => {
         		if(game.coll_detection(player.x, player.y, player.width, player.height, elem.x, elem.y, elem.width, elem.height))
            {//document.getElementById("hitthebrick").play();
            if(inputStates.right) {
                  player.x = elem.x - player.width;
               }
               else if(inputStates.left) {
                  player.x = elem.x + elem.width;
               }
               else if(inputStates.up) {
                  player.y = elem.y + elem.height;
               }
               else if(inputStates.down) {
                  player.y = elem.y - player.height;
               }
            }
      });
      
      //player lava collision detection
      lava.forEach(elem => {
      	if(game.coll_detection(player.x, player.y, player.width, player.height, elem.x, elem.y, elem.width, elem.height)){
      		newcontext.drawImage(explosion, 0, 0, 142, 200, elem.x, elem.y, elem.width, elem.height);
      		if(game.sounds) {
            document.getElementById('pain').play();
            document.getElementById('pain').loop = true;
          }

            player.health -= 1;
            if(player.health < 0) { player.health = 0; }
            document.getElementById('life').innerText = `LIFE: ${player.health}%`;
            if(player.health <= 0) {
              if(game.sounds) {
                document.getElementById('gameover').play();
                document.getElementById('gameover').onended = function(){
                const num = (Number(localStorage.getItem('level')));
                localStorage.setItem('level', num);
                reload();
               }
              } else {
                  const num = (Number(localStorage.getItem('level')));
                  localStorage.setItem('level', num);
                  reload();
              }

            }
      	} 
      });

      let test = 0;

      lava.forEach(elem => {
      	if(game.coll_detection(player.x, player.y, player.width, player.height, elem.x, elem.y, elem.width, elem.height)) {
      		return;
      	} else {
      		test += 1;
      	}
      });

      if (test === lava.length) {
      	document.getElementById('pain').loop = false;
      }
      
      //redraw the player
      game.draw_player();
      //player door collision detection
      	if(game.coll_detection(player.x, player.y, player.width, player.height, door.x, door.y, door.width, door.height))
      {	  if(game.sounds) { document.getElementById('door').play(); }
					canvas.style.display = "none";
					newcanvas.style.display = "none";
          if(level <= max_levels) {
					document.getElementById('winscreen').style.display = "block";
					localStorage.setItem('level', (level + 1));
          }
					else {
            document.getElementById('winner').style.display = "block";
						localStorage.clear();
					}
      }
      //player portal collision detection      
      if(portal.length) {
         portal.forEach(elem => {
            if(game.coll_detection(player.x, player.y, player.width, player.height, elem.x, elem.y, elem.width, elem.height)) {
              if(game.sounds) {
                  document.getElementById('portalsound').play();
                  document.getElementById('portalsound').onended = function () {
                  newcontext.clearRect(player.x-player.width, player.y-player.height, player.width*3, player.height*3);
                  player.x = elem.to_x;
                  player.y = elem.to_y;
                  game.clear_fog();
                  game.draw_player();
               }
              } 
              else {
                newcontext.clearRect(player.x-player.width, player.y-player.height, player.width*3, player.height*3);
                player.x = elem.to_x;
                player.y = elem.to_y;
                game.clear_fog();
                game.draw_player();
              }


            }
         });
      }
   }
