let base = 10;
let height = 5;
let area;

function preload(){
    
}

function setup(){
    new Canvas(800, 600);
    console.log("hello");

    area = 0.5 * base * height;
    console.log(area)

    fill(0, 255, 255);
  // textSize(14);
}

function draw(){
    background(220)
}