import {INCEPTION_CLASSES} from './labels.js';

function startup() {
    
    var video = document.getElementById('video');
    var buttonPhoto = document.getElementById('button-photo');
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        
        navigator.mediaDevices.getUserMedia({
            video: {
                width: 224,
                height: 224,
                facingMode: 'environment'
            }
        })
        .then( (stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch( (error) => {
            console.log(`An error occurred: ${error}`);
        }) 
    } else {
        console.log('No compatible browser with mediaDevices or getUserMedia'); 
    }

    buttonPhoto.addEventListener('click', (event) =>{
        photoToIcon();
        event.preventDefault()
    });

};

async function predict(tensorflowArray) {
    const modelUrl = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
    const model = await tf.loadGraphModel(modelUrl, {fromTFHub:true});
    const prediction = model.predict(tensorflowArray);
    const {indices, values} = tf.topk(prediction, 3);
    
    const topIcons = indices.dataSync();
    console.log(`${INCEPTION_CLASSES[topIcons[0]]}`);
    console.log(`${INCEPTION_CLASSES[topIcons[1]]}`);
    console.log(`${INCEPTION_CLASSES[topIcons[2]]}`);
    //clear tensors
    tensorflowArray.dispose();
    prediction.dispose();
    indices.dispose();
    values.dispose();
};

function photoToIcon() {
    const currentFrame = video;
    const tensorCurrent = tf.browser.fromPixels(currentFrame);
    const tensorRectified = tf.image.resizeBilinear(tensorCurrent, [224, 224], true).div(255).reshape([1, 224, 224,3]);
    predict(tensorRectified);
};

startup();
