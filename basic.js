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
    textSize(10);
    text
    text("The area of the triange is " + area, 100, 100);

    for (let i = 1; i <= 10; i++) {
        console.log("Counting..." + i)
    }
  
}

// function draw(){
//     background(220)
// }