let handPose;
let hands = [];
let video;

function preload(){

    let options = {
        flipped: true,
        runtime: "tfjs",
        modelType: "lite",
        detectorModelUrl: undefined,
        landmarkModeUrl: undefined,
    }

    handPose = ml5.handPose(options);
}   

function setup () {
    world.gravity.y = 5


    new Canvas(640, 480);

    let constraints = {
        video:{
            mandatory:{
                midWidth: width,
                minHeight: height
            },
            optional: [{minFrameRate: 60}]
        },
        audio: false,
        flipped: true,
        };  

    video = createCapture(constraints);
    video.size(width, height);
    video.hide();

    handPose.detectStart(video, gotHands);

}

function gotHands(results){
    
    hands = results;

}

function draw () {
    image(video, 0, 0, width, height);
    
    background("black")  

    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i]; 
    }
    
}
