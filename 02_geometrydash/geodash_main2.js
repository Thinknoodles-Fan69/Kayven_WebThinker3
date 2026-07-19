let box;
let cube;
let bg;


function preload() {
    cube = loadImage("02_geometrydash/assets/cube.png")
    bg = loadImage("02_geometrydash/assets/geobg.png")
}

function setup() {
    new Canvas(700, 600);
    world.gravity.y = 32;

    box = new Sprite(50, height, 50, 50);
    box.img = cube
    box.function = 0;
    box.bounciness = 0;
    box.collider = "none";

    startCoordinates = [50, height]
}

function draw() {
  
}











