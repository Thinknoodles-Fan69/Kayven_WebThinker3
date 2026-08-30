let box;
let line;

function preload() {

}

function setup() {
    new Canvas(700, 600);
    world.gravity.y = 32;

    box = new Sprite(50, height, 50, 50);
    box.collider = "dynamic";
    box.color = "red";
            
    startCoordinates = [350, 300];
    box.x = startCoordinates[0];
    box.y = startCoordinates[1];

    line = new Sprite(420, 420, 1000, 420)
    line.collider = "static";
    line.color = "black";

}

function draw() {
    clear();
    
    if (kb.presses('space') || mouse.presses()) {
        box.vel.y = -10;
    }

    box.vel.x = 1;

    camera.x = box.x
    camera.y = box
            





    background("yellow");
}