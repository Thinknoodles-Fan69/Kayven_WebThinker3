let handPose;
let hands = [];
let video;
let ball; 
let fingerTip;

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
    ball.diameter = 60;
    ball.collider = "dynamic";
    ball.color = "black";
    ball.x = width/2;
    ball.y = 100;

    fingerTip = new Sprite();
    fingerTip.width = 300
    fingerTip.height = 20
    fingerTip.collider = "kinematic";
    fingerTip.color = "rgba(12, 233, 0, 0.5)"





        


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

    if(hands.length > 0) {
        let hand = hands[0];
        let pointer = hand.keypoints[8];
        
        fingerTip.x = pointer.x;
        fingerTip.y = pointer.y;
    }


    // fingerTip.x = hands[0].keypoints[8].x
    // fingerTip.y = hands[0].keypoints[8].y

    
}
