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

    handpose.detectStart(vudei, gotHands)
}

function draw() {}

//=========================================
// Function Created
//=========================================
