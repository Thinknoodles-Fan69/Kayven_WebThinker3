let box;
let safetyNetToCatchTheBoxSoItDoesNotFallOffTheC

function preload() {

}

function setup() {
    new Canvas(700, 600);
    world.gravity.y = 32;

    box = new Sprite(50, height, 50, 50);
    box.collider = "dynamic";
    box.bounciness = 1;
    box.color = "red";

    startCoordinates = [350, 300];
    box.x = startCoordinates[0];
    box.y = startCoordinates[1];

}

function draw() {
    clear();

    background("yellow");
}