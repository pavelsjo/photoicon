import {INCEPTION_CLASSES} from './labels.js';

var cameraOn = document.getElementById('camera-on');
var toggleCamera = document.getElementById('togle-camera');
var formSearch = document.getElementById('form');
var iconSearch = document.getElementById('search-on');

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

iconSearch.addEventListener('click', (event) => {
    var textInput = document.getElementById('input-text');
    getIcon(textInput.value);
});

formSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    var textInput = document.getElementById('input-text');
    getIcon(textInput.value);
});

async function startup() {
    var model = loadModel();
    var video = document.getElementById('video');
    var buttonPhoto = document.getElementById('button-photo');
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        
        navigator.mediaDevices.getUserMedia({
            video: {
                width: 480,
                height: 480,
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
        predict(model);
        event.preventDefault();
    });
};

async function loadModel() {
    const modelUrl = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
    return await tf.loadGraphModel(modelUrl, {fromTFHub:true});
};

async function predict(model) {

    model.then((res) => {
        const currentFrame = video;
        const tensorCurrent = tf.browser.fromPixels(currentFrame);
        const tensorRectified = tf.image.resizeBilinear(tensorCurrent, [224, 224], true).div(255).reshape([1, 224, 224,3]);
        const prediction = res.predict(tensorRectified);
        const {indices, values} = tf.topk(prediction, 1);
        const topIcon = indices.dataSync();
        const topValue = values.dataSync();

        getIcon(INCEPTION_CLASSES[topIcon]);
        console.log(INCEPTION_CLASSES[topIcon], topValue );
    });

};

async function getIcon(iconName) {
    var resultsDiv = document.getElementById("results");
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
        resultsDiv.removeChild(resultsDiv.lastElementChild);
      }
    });

  } catch (error) {
    console.error(error);
  };
};
