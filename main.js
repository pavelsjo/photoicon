import {INCEPTION_CLASSES} from './labels.js';

var cameraOn = document.getElementById('camera-on');
var toggleCamera = document.getElementById('togle-camera');
var formSearch = document.getElementById('form');

cameraOn.addEventListener('click', (event) => {
    const inputDiv = document.getElementById('input-div');
    inputDiv.style.display = 'block';
    startup();
});

toggleCamera.addEventListener('click', (event) => {
    if (toggleCamera.className === "fas fa-toggle-on fa-rotate-180") {
        toggleCamera.className = "fas fa-toggle-on";
    } else {
        toggleCamera.className = "fas fa-toggle-on fa-rotate-180";
    };
});

formSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    var textInput = document.getElementById('input-text');
    getIcon(textInput.value);
});

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

    buttonPhoto.addEventListener('click', (event) => {
        photoToIcon();
        event.preventDefault();
    });
};

async function predict(tensorflowArray) {
    const modelUrl = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
    const model = await tf.loadGraphModel(modelUrl, {fromTFHub:true});
    const prediction = model.predict(tensorflowArray);
    const {indices, values} = tf.topk(prediction, 3);
    
    const topIcons = indices.dataSync();
    topIcons.forEach( (icon) => {

        getIcon(INCEPTION_CLASSES[icon]);
        console.log(INCEPTION_CLASSES[icon]);

    });

    // clear tensors
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

var resultsDiv = document.getElementById("results");

async function getIcon(iconName) {
  try {
    var queryValue = iconName.replace(' ', '+');
    var response = await axios.get(`https://iconfinder-api-auth.herokuapp.com/v4/icons/search?query=${queryValue}&count=4`);
    var iconsArray = response.data.icons;

    iconsArray.forEach(element => {

      // create a new element
      var newImage = document.createElement('img');
      newImage.src = element.raster_sizes[5].formats[0].preview_url;
      newImage.width = "64";
      resultsDiv.prepend(newImage);
      
      // limit icons
      const maxIcons = 16;
      if (resultsDiv.childElementCount > maxIcons) {
        resultsDiv.removeChild(resultsDiv.lastElementChild)
      }
    });

  } catch (error) {
    console.error(error);
  };
};
