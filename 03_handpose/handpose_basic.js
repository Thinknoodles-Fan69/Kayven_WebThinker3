let handPose;
let videoW = 640;
let videoH = 480;
let hands = [];
let fingerTip;
let balloon;
let bottomWall, topWall, rightWall, leftWall, boundaryGroup;

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
    balloon.mass = 2;
    balloon.drag = 0.01;

    topWall = new Sprite(width/2, 0, width, 10, "static")
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



function gotHands(results) {
    hands = results;
}