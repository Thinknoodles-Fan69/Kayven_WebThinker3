const MAX_JUMP = 1;
let jumpChance = MAX_JUMP;
let box;
let cube;
let bg;
let tileMap1;
let spike;
let ground;
let orbs;
let sharp;
let finishLine;
let startCoordinates;
let startSprite;
let endSprite;
let startGameImg;
let endGameImg;

let startGame = false;
let gameOver = false;

let level = 1;
let lastLevel = 2;

let particles;
let mapused;

let backgroundTrack;
let failSound;
let passSound;

let lost = false;

function preload() {
    cube = loadImage("assets/cube.png");
    bg = loadImage("assets/geobg.png");
    tileMap1 = loadStrings("stages/tiles1.txt");
    spike = loadImage("assets/spike.png");
    startGameImg = loadImage("assets/startgame.png");
    endGameImg = loadImage("assets/clear.png");
    tileMap2 = loadStrings("stages/tiles2.txt");
    backgroundTrack = createAudio()
}

function setup() {
    new Canvas(700, 600);
    world.gravity.y = 32;

    box = new Sprite(50, height, 50, 50);
    box.img = cube;
    box.bounciness = 0;
    box.collider = "none";

    startCoordinates = [50, height - box.height / 2];
    box.x = startCoordinates[0];
    box.y = startCoordinates[1];

    ground = new Group();
    ground.tile = "g";
    ground.w = 50;
    ground.h = 50;
    ground.collider = "static";
    ground.color = "black";
    ground.stroke = "rgba(0, 0, 0, 0)";

   

    orbs = new Group();
    orbs.tile = "o";
    orbs.d = 24;
    orbs.collider = "static";
    orbs.color = "white";
    orbs.strokeWeight = 0;

    sharp = new Group();
    sharp.tile = "s";
    sharp.h = 25;
    sharp.w = 25;
    sharp.img = spike;
    sharp.collider = "static";

    finishLine = new Group();
    finishLine.tile = "f";
    finishLine.w = 50;
    finishLine.h = 1200;
    finishLine.visible = false;
    finishLine.collider = "static"; 
    
    new Tiles(tileMap1, 0, 0, 50, 50);

    mapUsed = tileMap1;
    

    startSprite = new Sprite(width / 2, height / 2, 190, 90);
    startSprite.img = startGameImg;
    startSprite.collider = "none";


    particles = new Group();

}
 
function draw() {
    clear();
    image(bg, 0, 0, 800, 600);

    if (!startGame && (mouse.presses() || kb.presses('space'))) {
            startGame = true;
            startSprite.visible = false;
        } else if (!startGame) {
            if (frameCount % 60 < 30) {
                startSprite.visible = true;
            } else {
                startSprite.visible = false;
            }
        }
    
    if (startGame) {
        box.collider = "dynamic";
        box.vel.x = 8;

        if (box.x >= width/2) {
            camera.x = box.x;
        } else {
            camera.x = width / 2;
        }

        if ((kb.presses('space') || mouse.presses()) && jumpChance > 0){
            box.vel.y = -10;
            box.rotateTo(box.rotation + 179, 15);
            jumpChance -=   1;
        }

        if (box.collides(ground) && jumpChance < MAX_JUMP) {
            jumpChance = MAX_JUMP;
        }

            if (box.collides(sharp)) {
            resetGame()
        }

        for (let tile of ground) {

            if(box.colliding(tile)){
                let leftEdge = tile.x - tile.w / 2;
                let leftEdgeHeight = tile.y - tile.h / 2;

                if (box.x <leftEdge && box.y > leftEdgeHeight) {
                    resetGame();
                    break;
                }
            }

            
        }

        for (let orb of orbs) {
            if (box.colliding(orb)) {
                orb.visible = false;
                orb.collider = "none";
                box.vel.y = -10;
                jumpChance = MAX_JUMP
            }
        }

        if (box.collides(finishLine)) {
                triggerGameOver();
            }

        if (gameOver) {
            if (frameCount - endTimer > 120) {
                if (endSprite) {
                    endSprite.remove();
                }
                staertGame = false;
                gameOver = false;
                resetGame();

                level += 1;
                loadLevel();        
            }
        }

        if (frameCount % 3 === 0 && box.colliding(ground) && box.vel.x >= 0.5) {
            let particle = new Sprite(box.x, box.y + box.h / 2, 8, 8, "none");
            particle.color = "white";
            particle.strokeWeight = 0;
            particle.vel.x = -5
            particle.vel.y = random(-2, 0);
            particle.life = 30;


            particles.add(particle);
        }
    }

    drawBackground();

}









function resetGame() {
    box.rotation = 0;
    
    box.x = startCoordinates[0];
    box.y = startCoordinates[1];

    jumpChance = MAX_JUMP;
    camera.x = width / 2

    for (let orb of orbs) {
        orb.visible = true;
        orb.collider = "static";
    }

    particles.removeAll();
  
}

function triggerGameOver() {
    if(!gameOver) {
        gameOver = true;

        box.vel.x = 0;
        jumpChance = 0;
        endTimer = frameCount;

        if (endSprite) {
            endSprite.remove();

        }
        endSprite = new Sprite(box.x, height / 2, 126, 24);
        endSprite.collider = "none";
        endSprite.img = endGameImg;
    }

}


function loadLevel() {
    ground.removeAll();
    orbs.removeAll();
    sharp.removeAll();
    finishLine.removeAll();
    
    if (lastLevel < level) {
        level = 1;
    }
    if (level === 1) {
        new Tiles(tileMap1, 0, 0, 50, 50);
    } else if (level === 2) {
        new Tiles(tileMap2, 0, 0, 50, 50);
    }
}



function drawBackground() {

  let lastRow = mapUsed[mapUsed.length - 1]; //Get the final row of the current tile map.
  let numCols = lastRow.length; //Count how many tiles are in the row.
  let totalJourney = numCols * 50; //each tile is around 50px. this gives the total length

  let progress = map(box.x, 0, totalJourney, -100, 0);

  let c1 = color("#a200ff"); //colours for lerping
  let c2 = color("#006aff");

  let amt = (sin(frameCount * 0.5) + 1) / 2; //Create a value that repeatedly changes between 0 and 1.
  let blend = lerpColor(c1, c2, amt); //lerp between two colours

  tint(blend); //turn on the tint
  image(bg, progress, 0, 800, 600); //draw and move background 
  noTint(); //remove tint on all other objects
}
