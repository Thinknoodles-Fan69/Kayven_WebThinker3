/*
Lesson 3: Assign Player 1 and Player 2

Goal:
- Continue from Lesson 2
- Draw body points and skeletons
- Assign one detected person to Player 1
- Assign one detected person to Player 2
- Use the nose position to decide who is on the left and right

Important:
- No getPoint()
- No getScreenX()
- No getScreenY()
- No game states yet
- No pose checking yet
- No hand raise start yet
*/

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

// Center x-position of the left panel.
let leftPanelCenterX = sidePanelWidth / 2;

// x-position of the right panel.
let rightPanelX = sidePanelWidth + cameraWidth;

// Center x-position of the right panel.
let rightPanelCenterX = rightPanelX + sidePanelWidth / 2;

// Player 1 colour.
let player1Color;

// Player 2 colour.
let player2Color;


// ====================================================
// ML5 body tracking variables
// ====================================================

// Stores the webcam video.
let video;

// Stores the ML5 BodyPose model.
let bodyPose;

// Stores all detected people from ML5.
let detectedPeople = [];


// ====================================================
// Player body variables
// ====================================================

// Stores the detected body assigned to Player 1.
let player1Person = null;

// Stores the detected body assigned to Player 2.
let player2Person = null;




let poseList = [];

let currentPose = null;

let bothHandsUpImg;
let leftHandUpImg;;
let rightHandUpImg;
let tPoseImg;
let handsOnHeadImg;


// ====================================================
// Load ML5 model
// ====================================================

// preload() runs before setup().
function preload() {
    // Load the ML5 BodyPose model.
    bodyPose = ml5.bodyPose("MoveNet", { flipped: true });

    bothHandsUpImg = loadImage("assets/poseBattle_bothHandsUp.png");
    leftHandUpImg = loadImage("assets/poseBattle_leftHandUp.png");
    rightHandUpImg = loadImage("assets/poseBattle_rightHandUp.png");
    tPoseImg = loadImage("assets/poseBattle_tpose.png");
    handsOnHeadImg = loadImage("assets/poseBattle_handsOnHead.png");
}


// ====================================================
// Setup
// ====================================================

// setup() runs once at the start.
function setup() {
    setupPoseList();
    currentPose = poseList[0];

    // Create the full canvas.
    createCanvas(totalCanvasWidth, cameraHeight);

    // Set Player 1 colour.
    player1Color = color(80, 180, 255);

    // Set Player 2 colour.
    player2Color = color(255, 120, 120);

    // Set up webcam constraints.
    let constraints = {
        video: {
            width: cameraWidth,
            height: cameraHeight,
            aspectRatio: cameraWidth / cameraHeight
        },

        // Turn off audio because we only need video.
        audio: false,

        // Makes the video mirrored.
        flipped: true
    };

    // Create webcam capture.
    video = createCapture(constraints);

    // Hide the default webcam HTML element.
    // We draw the webcam on the canvas ourselves.
    video.hide();

    // Start ML5 body detection.
    // Whenever ML5 detects people, it calls gotPoses().
    bodyPose.detectStart(video, gotPoses);

    // Set up text.
    textAlign(CENTER, CENTER);
}


// ====================================================
// Main draw loop
// ====================================================

// draw() runs again and again.
function draw() {
    // Clear the canvas with a dark background.
    background(30);

    // Draw the webcam.
    drawCamera();

    // Decide which detected body belongs to Player 1 and Player 2.
    findPlayers();

    // Draw skeletons for Player 1 and Player 2.
    drawPlayerSkeletons();

    // Draw the side panels.
    drawUIPanel();

    // Draw the middle line that separates Player 1 and Player 2 areas.
    drawMiddleLine();

    // Draw Player 1 and Player 2 status.
    drawPlayerStatus();

    // Draw detection status.
    drawDetectionStatus();

    drawSharedGameUI();
}


// ====================================================
// Receive ML5 results
// ====================================================

// gotPoses() runs whenever ML5 sends new detection results.
function gotPoses(results) {
    // Store the latest detected people.
    detectedPeople = results;
}


// ====================================================
// Draw camera
// ====================================================

// Draws the webcam on the canvas.
function drawCamera() {
    // Draw the webcam.
    image(video, cameraX, 0, cameraWidth, cameraHeight);
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
    line(cameraX + cameraWidth / 2, 0, cameraX + cameraWidth / 2, cameraHeight);
}


// ====================================================
// Draw detection status
// ====================================================

// Shows how many people ML5 can detect.
function drawDetectionStatus() {
    // Draw dark transparent status box.
    noStroke();
    fill(0, 150);
    rect(width / 2 - 180, 20, 360, 70, 12);

    // Draw status text.
    fill(255);
    textSize(24);
    text("People detected: " + detectedPeople.length, width / 2, 55);
}


// ====================================================
// Draw player status
// ====================================================

// Shows whether Player 1 and Player 2 are detected.
function drawPlayerStatus() {
    
    noStroke();
    textSize(28);
    fill(255);

    // // Draw Player 1 title.
    // text("Player 1", leftPanelCenterX, 80);

    // Draw Player 1 status.
    if (player1Person !== null) {
        text("Detected", leftPanelCenterX, 125);
    } else {
        text("Not detected", leftPanelCenterX, 125);
    }

    // // Draw Player 2 title.
    // text("Player 2", rightPanelCenterX, 80);

    // Draw Player 2 status.
    if (player2Person !== null) {
        text("Detected", rightPanelCenterX, 125);
    } else {
        text("Not detected", rightPanelCenterX, 125);
    }

}


// ====================================================
// Find Player 1 and Player 2 from detected people
// ====================================================

// Assigns detected people to Player 1 and Player 2.
function findPlayers() {
    // Reset Player 1 every frame before checking again.
    player1Person = null;

    // Reset Player 2 every frame before checking again.
    player2Person = null;

    // Start with a very large number for Player 1 distance.
    let bestPlayer1Distance = 99999;

    // Start with a very large number for Player 2 distance.
    let bestPlayer2Distance = 99999;

    // Player 1 target area is around the left quarter of the webcam.
    let player1CenterX = cameraX + cameraWidth / 4;

    // Player 2 target area is around the right quarter of the webcam.
    let player2CenterX = cameraX + cameraWidth * 3 / 4;

    // The middle x-position of the webcam.
    let cameraMiddleX = cameraX + cameraWidth / 2;

    // Loop through every detected person.
    for (let i = 0; i < detectedPeople.length; i++) {
        // Get one detected person.
        let person = detectedPeople[i];

        // Get the nose point directly using dot notation.
        let nose = person.nose;

        // Continue only if the nose is detected clearly.
        if (pointIsReady(nose)) {
            // Convert the nose x-position to canvas position.
            let noseX = cameraX + nose.x;

            // If the nose is on the left side, this person may be Player 1.
            if (noseX < cameraMiddleX) {
                // Measure distance from Player 1's ideal area.
                let distanceFromPlayer1Area = abs(noseX - player1CenterX);

                // Keep this person if they are closer than the previous Player 1 candidate.
                if (distanceFromPlayer1Area < bestPlayer1Distance) {
                    // Assign this person as Player 1.
                    player1Person = person;

                    // Update best Player 1 distance.
                    bestPlayer1Distance = distanceFromPlayer1Area;
                }

            // Otherwise, this person may be Player 2.
            } else {
                // Measure distance from Player 2's ideal area.
                let distanceFromPlayer2Area = abs(noseX - player2CenterX);

                // Keep this person if they are closer than the previous Player 2 candidate.
                if (distanceFromPlayer2Area < bestPlayer2Distance) {
                    // Assign this person as Player 2.
                    player2Person = person;

                    // Update best Player 2 distance.
                    bestPlayer2Distance = distanceFromPlayer2Area;
                }
            }
        }
    }
}


// ====================================================
// Draw player skeletons
// ====================================================

// Draws skeletons for Player 1 and Player 2.
function drawPlayerSkeletons() {
    // Draw Player 1 skeleton only if Player 1 is detected.
    if (player1Person !== null) {
        drawSkeleton(player1Person, player1Color);
    }

    // Draw Player 2 skeleton only if Player 2 is detected.
    if (player2Person !== null) {
        drawSkeleton(player2Person, player2Color);
    }
}


// ====================================================
// Draw one person's skeleton
// ====================================================

// Draws one person's skeleton.
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


// ====================================================
// Draw body line
// ====================================================

// Draws a line between two body points.
function drawBodyLine(point1, point2) {
    // Only draw the line if both points are detected clearly.
    if (pointIsReady(point1) && pointIsReady(point2)) {
        // Draw the line using screen positions.
        line(
            cameraX + point1.x,
            point1.y,
            cameraX + point2.x,
            point2.y
        );
    }
}


// ====================================================
// Draw body point
// ====================================================

// Draws one body point as a circle.
function drawBodyPoint(point) {
    // Only draw the circle if the point is detected clearly.
    if (pointIsReady(point)) {
        // Draw a small circle at the body point position.
        circle(cameraX + point.x, point.y, 8);
    }
}


// ====================================================
// Check if ML5 found a body point clearly
// ====================================================

// Checks whether a body point is reliable enough to use.
function pointIsReady(point) {
    // If the point does not exist, it is not ready.
    if (point === null || point === undefined) {
        return false;
    }

    // Use the point only if confidence is high enough.
    if (point.confidence > 0.25) {
        return true;
    } else {
        return false;
    }
}



function setupPoseList() {

    poseList = [
        {
            name: "Both Hands Up",
            id: "bothHandsUp",
            image: bothHandsUpImg
        },
        {
            name: "Left Hand Up",
            id: "leftHandUp",
            image: leftHandUpImg
        },  
        {
            name: "Right Hand Up",
            id: "rightHandUp",
            image: rightHandUpImg
        },
        {
            name: "T Pose",
            id: "tPose",
            image: tPoseImg
        },
        {
            name: "Hands On Head",
            id: "handsOnHead",
            image: handsOnHeadImg
        }
    ]
}


function drawSharedGameUI() {
    if (currentPose === null || currentPose === undefined) {
        return;
    }
    noStroke();
    
    fill(0, 135);
    rect(cameraX + 190, 8, 420, 90, 12);

    fill(255);
    textSize(24);
    text("Match this pose!", width / 2, 30);

    fill(255, 220, 80);
    textSize(28);
    text(currentPose.name, width / 2, 65);

    drawTargetPose(currentPose.image, width / 2, height / 2 + 55, 238);

    fill(255);
    textSize(18);
    text("Poses 5 to test to press 1", width / 2, height - 30);
}

function drawTargetPose(poseImage, x, y, size) {

    imageMode(CENTER);

    image(poseImage, x, y, size, size);

    imageMode(CORNER);
}
