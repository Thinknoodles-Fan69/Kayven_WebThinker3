let box;
let line;

function preload() {

}

function setup() {
    new Canvas(700, 600);
    world.gravity.y = 32;

    box = new Sprite(100, 300, 50, 50);
    box.collider = "dynamic";
    box.color = "red";
            
    startCoordinates = [, ];
    box.x = startCoordinates[0];
    box.y = startCoordinates[1];

    line = new Sprite(420, 420, 67676767676767676767676767, 420)
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
    // camera.y = box.y
            





    background("yellow");
}