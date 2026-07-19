const { startTransition } = require("react");

let box;
let cube;
let bg;
let tileMap1;
let spike;
let ground;
let orbs;
let sharp;
let finishLine;


function preload() {
    cube = loadImage("02_geometrydash/assets/cube.png")
    bg = loadImage("02_geometrydash/assets/geobg.png")
    tileMap1 = loadStrings("02_geometrydash/stages/tiles1.txt")
    spike = loadImage("02_geometrydash/assets/spike.png")
}

function setup() {
    new Canvas(700, 600);
    world.gravity.y = 32;

    box = new Sprite(50, height, 50, 50);
    box.img = cube
    box.function = 0;
    box.bounciness = 0;
    box.collider = "none";

    startCoordinates = [50, height - box.height/2]
    box.x = startCoordinates[0];
    box.y = startCoordinates[1]

    group = new Group();
    ground.tile = "g";

    ground.w = 50;
    ground.h = 50;
    ground.collider = "static";
    ground.color = "black";
    ground.stroke = "rgba(0, 0, 0, 0)";

    new Tiles(timeMap1, 0, 0, 50, 50);

    orb = new Group();
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
    finishLine.tile = 
    finishLine
    finishLine
    finishLine
    finishLine
    finishLine
    finishLine


}

function draw() {
    clear();
    Image(bg, 0, 0, 800, 600);
}











