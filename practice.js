let box;

function preload() {

}

function setup() {
    new Canvas(700, 600);
    world.gravity.y = 32;

    box = new Sprite(50, height, 50, 50);
    box.collider = "dynamic";
    box.bounciness = 1;
    box.color = "black";

}

function draw() {
    clear();

    drawBackground();
}