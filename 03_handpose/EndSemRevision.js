let handPose;
let hands = [];
let video;
let ball; 

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

    ball = new Sprite();
    ball.collider = 
    ball.h = 100

        


}

function gotHands(results){
    
    hands = results;

}

function draw () {
    background("black")  
    image(video, 0, 0, width, height);


    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];
    
        for (let j = 0; j < hand.keypoints.length; j++) {
            let keypoint = hand.keypoints[j];

            circle(keypoint.x, keypoint.y, 10);
        }
    }
    
}
