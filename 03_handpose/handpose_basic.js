let handPose;
let videoW = 640;
let videoH = 480;

function preload() {
    let options = {
        flipped: true,
        runtime: "tfjs",
        modelType: "full",
        detectorModelUrl: undefined,
        landmarkModelUrl: undefined,

    }
    handPose = m15.handPose(options)
}

function setup() {
    createCanvas(videoW. videoH);
    let constraints = {
        video:
    }
}

function draw() {}

//=========================================
// Function Created
//=========================================
