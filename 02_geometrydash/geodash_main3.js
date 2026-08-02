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


function preload() {
    cube = loadImage("assets/cube.png");
    bg = loadImage("assets/geobg.png");
    tileMap1 = loadStrings("stages/tiles1.txt");
    spike = loadImage("assets/spike.png");
    startGameImg = loadImage("assets/startgame.png");
    endGameImg = loadImage("assets/clear.png");
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

    startSprite = new Sprite(width / 2, height / 2, 190, 90);
    startSprite.img = startGameImg;
    startSprite.collider = "none";
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
    }
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

  
}