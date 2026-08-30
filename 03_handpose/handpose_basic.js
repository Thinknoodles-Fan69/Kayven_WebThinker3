let handPose;
let videoW = 640;
let videoH = 480;
let hands = [];
let fingerTip;
let balloon;
let bottomWall, topWall, rightWall, leftWall, boundaryGroup;
let gameStarted = false;
let gameOver = false;

function preload() {
    let options = {
        flipped: true,
        runtime: "tfjs",
        modelType: "lite",
        detectorModelUrl: undefined,
        landmarkModelUrl: undefined,

    }
    handPose = ml5.handPose(options)
}


function setup() {
    world.gravity.y = 6;
    createCanvas(videoW, videoH);
    let constraints = {
        video: {
            mandatory: {
                minWidth: videoW,
                minHeight: videoH,
            },
            optional:[{minFrameRate: 60}]
        },
        audio: false,
        flipped: true,
    };

    video = createCapture(constraints);
    video.size(640, 480);
    video.hide();

    handPose.detectStart(video, gotHands)

    fingerTip = new Sprite();
    fingerTip.diameter = 60;
    fingerTip.colliderr = "kinetic";
    fingerTip.color = "rgba(218, 41, 28, 0.50)"

    balloon = new Sprite();
    balloon.diameter = 60;
    balloon.collider = "dynamic";
    balloon.color = "black";
    balloon.x = width/2;
    balloon.y = 100;
    balloon.bounciness = 1;
    balloon.mass = 1;
    balloon.drag = 0.01;

    topWall = new Sprite(width/2, 0, width, 10, "static")
    bottomWall = new Sprite(width/2, height, width, 10, "static")
    leftWall = new Sprite(0, height/2, 10, height, "static")
    rightWall = new Sprite(width, height/2, 10, height, "static")

    boundaryGroup = new Group();
    boundaryGroup.add(topWall);
    boundaryGroup.add(bottomWall);
    boundaryGroup.add(leftWall);
    boundaryGroup.add(rightWall);
    boundaryGroup.visible = false;
}

function draw() {
    image(video, 0, 0, videoW, videoH);

    // for (let i = 0; i < hands.length; i++) {
    //     let hand = hands[i];
    
    //     for (let j = 0; j < hand.keypoints.length; j++) {
    //         let keypoint = hand.keypoints[j];

    //         circle(keypoint.x, keypoint.y, 10);
    //     }
    // }
    if (gameOver === false) {
        if (hands.length > 0){
            let hand = hands[0];
            let keypoint = hand.keypoints[8];

            fingerTip.x = keypoint.x;
            fingerTip.y = keypoint.y;
            fingerTip.visible = true;
        }else{
            fingerTip.visible = false;
        }
    }

    if (gameStarted === false) {
        textSize(28);
        textAlign(CENTER, CENTER);
        fill('limegreen');
        textSize(20);
        text("Finger Index B")

    }

 

}



function gotHands(results) {
    hands = results;
}