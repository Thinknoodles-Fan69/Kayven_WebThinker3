// ====================================================
// Canvas and layout variables
// ====================================================

// Width of the webcam/game area.
let cameraWidth = 800;

// Height of the webcam/game area.
let cameraHeight = 450;

// Width of each side panel.
let sidePanelWidth = 220;

// Total canvas width = left panel + webcam area + right panel.
let totalCanvasWidth = cameraWidth + sidePanelWidth * 2;

// x-position where the webcam area starts.
let cameraX = sidePanelWidth;

// x-position of the left panel.
let leftPanelX = 0;

// x-position of the right panel.
let rightPanelX = sidePanelWidth + cameraWidth;

// ====================================================
// Variables
// ====================================================

let video; // Variable to hold the webcam video feed.

let bodyPose; // Variable to hold the body pose model.

let detectedPeople = []; // Array to hold detected people.

let player1Color;
let player2Color;

let player1Person = null;
let player2Person = null;

// ====================================================
// Preload
// ====================================================

function preload(){
    bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

// ====================================================
// Setup
// ====================================================

// setup() runs once at the start.
function setup() {

    // Set up text.
    textAlign(CENTER, CENTER);

    let canvas = createCanvas(totalCanvasWidth, cameraHeight);

    let constraints = {
        video: {
            width: cameraWidth,
            height: cameraHeight,
            aspectRatio: cameraWidth / cameraHeight
        },
        audio: false,
        flipped: true // Flip the webcam feed horizontally for a mirror effect.
    };

    video = createCapture(constraints);
    video.hide();

    bodyPose.detectStart(video, gotPoses);

    player1Color = color(80, 180, 255);
    player2Color = color(255, 120, 120);
}


// ====================================================
// Main draw loop
// ====================================================

// draw() runs again and again.
function draw() {
    // Clear the canvas with a dark background.
    background(30);
    // Display the webcam video feed.
    image(video, cameraX, 0, cameraWidth, cameraHeight);  
    
    findPlayers();
    drawPlayersSkeletons();

    // Draw the side panels.
    drawUIPanel();
    // Draw the middle line that separates Player 1 and Player 2 areas.
    drawMiddleLine();
    // Draw detection status.
    drawDetectionStatus();
}

// ====================================================
// Draw side UI panels
// ====================================================

// Draws the left and right UI panels.
function drawUIPanel() {
    // Remove outlines.
    noStroke();
    // Set panel colour.
    fill(20);
    // Draw left panel.
    rect(leftPanelX, 0, sidePanelWidth, cameraHeight);
    // Draw right panel.
    rect(rightPanelX, 0, sidePanelWidth, cameraHeight);
    // Set divider line colour.
    stroke(255, 180);
    // Set divider line thickness.
    strokeWeight(2);
    // Draw line between left panel and webcam.
    line(sidePanelWidth, 0, sidePanelWidth, cameraHeight);
    // Draw line between webcam and right panel.
    line(rightPanelX, 0, rightPanelX, cameraHeight);
}


// ====================================================
// Draw middle divider line
// ====================================================

// Draws the vertical line that separates Player 1 and Player 2.
function drawMiddleLine() {
    // Set line colour to white with transparency.
    stroke(255, 180);
    // Set line thickness.
    strokeWeight(2);
    // Draw the middle line inside the webcam area.
    line(width / 2, 0, width / 2, cameraHeight);
}

function gotPoses(results) {
    detectedPeople = results;
}

function drawDetectionStatus() {
    // Set text colour to white.
    fill(0);
    textSize(24);
    text("Detected People: " + detectedPeople.length, width / 2, 55);
}

function drawAllSkeletons() {
    for (let i = 0; i < detectedPeople.length; i++) {
        let person = detectedPeople[i];

        drawSkeleton(person, player1Color);
    }
}

function drawSkeleton(person, skeletonColor) {
    // Set skeleton line colour.
    stroke(skeletonColor);

    // Set skeleton line thickness.
    strokeWeight(3);

    // Draw shoulder line.
    drawBodyLine(person.left_shoulder, person.right_shoulder);

    // Draw left upper arm.
    drawBodyLine(person.left_shoulder, person.left_elbow);

    // Draw left lower arm.
    drawBodyLine(person.left_elbow, person.left_wrist);

    // Draw right upper arm.
    drawBodyLine(person.right_shoulder, person.right_elbow);

    // Draw right lower arm.
    drawBodyLine(person.right_elbow, person.right_wrist);

    // Draw left body side.
    drawBodyLine(person.left_shoulder, person.left_hip);

    // Draw right body side.
    drawBodyLine(person.right_shoulder, person.right_hip);

    // Draw hip line.
    drawBodyLine(person.left_hip, person.right_hip);

    // Remove outlines for the body point circles.
    noStroke();

    // Set circle colour.
    fill(skeletonColor);

    // Draw important body points.
    drawBodyPoint(person.nose);
    drawBodyPoint(person.left_shoulder);
    drawBodyPoint(person.right_shoulder);
    drawBodyPoint(person.left_elbow);
    drawBodyPoint(person.right_elbow);
    drawBodyPoint(person.left_wrist);
    drawBodyPoint(person.right_wrist);
    drawBodyPoint(person.left_hip);
    drawBodyPoint(person.right_hip);
}

function drawBodyLine(point1, point2) {
    if (pointIsReady(point1) && pointIsReady(point2)) {
        line(point1.x + cameraX, point1.y, point2.x + cameraX, point2.y)
    }
}

function drawBodyPoint(point) {
    if (pointIsReady(point)) {
        circle(point.x + cameraX, point.y, 8);
    }
}

function pointIsReady(point) {
    if (point === null || point === undefined) {
        return false;
    }

    if (point.confidence > 0.25) {
        return true;
    } else {
        return false;
    }
}

function findPlayers() {
    player1Person = null;
    player2Person = null;

    let bestPlayer1Distance = 99999;
    let bestPlayer2Distance = 99999;

    let player1CenterX = cameraX + cameraWidth / 4;
    let player2CenterX = cameraX + cameraWidth * 3 / 4;

    let cameraMiddleX = cameraX + cameraWidth / 2;

    for (let i = 0; i < detectedPeople.length; i++) {
        let person = detectedPeople[i];
        let nose = person.nose;

        if (pointIsReady(nose)) {
            let noseX = cameraX + nose.x;

            if (noseX < cameraMiddleX) {
                let distanceFromPlayer1Area = abs(noseX - player1CenterX);

                if (distanceFromPlayer1Area < bestPlayer1Distance) {
                    player1Person = person;
                    bestPlayer1Distance = distanceFromPlayer1Area;
                }
            } else {
                let distanceFromPlayer2Area = abs(noseX - player2CenterX);

                if (distanceFromPlayer2Area < bestPlayer2Distance) {
                    player2Person = person;
                    bestPlayer2Distance = distanceFromPlayer2Area;
                }
            }
        }
    }
}

function drawPlayersSkeletons() {
    if (player1Person !== null) {
        drawSkeleton(player1Person, player1Color);
    }

    if (player2Person !== null) {
        drawSkeleton(player2Person, player2Color);
    }
}