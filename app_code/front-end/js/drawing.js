var color = window.getComputedStyle(document.querySelector(".selected")).backgroundColor;
var canvas =  document.querySelector("canvas");
var context = canvas.getContext("2d");
var ul = document.querySelector("ul");
var redRange = document.getElementById("red");
var greenRange = document.getElementById("green");
var blueRange = document.getElementById("blue");
var newColorPreview = document.getElementById("newColor");
var addNewColorButton = document.getElementById("addNewColor");
var saveImageButton = document.getElementById("saveImage");
var revealColorSelectButton = document.getElementById("revealColorSelect");

var lastEvent;
var isMouseDown = false;
let scaleFactor = 1; // Initialize scale factor to 1

var brushWidth = 10;

function handleColorClick() {
	ul.querySelectorAll("li").forEach(function(el) {
		el.classList.remove("selected");
	});
	this.classList.add("selected");
	color = window.getComputedStyle(this).backgroundColor;
}

function bindColorClickHandler(el) {
	el.addEventListener("click", handleColorClick);
}

function changeColor(){
	var r = redRange.value;
	var g = greenRange.value;
	var b = blueRange.value;
	newColorPreview.style.background = "rgb(" + r + "," + g + "," + b + ")";
}

function bindChangeHandler(el) {
	el.addEventListener("input", changeColor);
}

function changeSliderValue(){
	ul.querySelectorAll("input").forEach(function(el) {
		brushWidth = 	el.value;
	});
}

function bindBrushSizeHandler(el) {
	el.addEventListener("input", changeSliderValue)
}

const slider = document.getElementById('customSlider');
slider.addEventListener('input', (event) => {
	brushWidth = 	el.value;
});

function toggleFlexibility(elementId) {
	var el = document.getElementById(elementId);
	var visability = window.getComputedStyle(el).display;
	if(visability == "none") {
		el.style.display = "block";
	} else {
		el.style.display = "none";
	}
}

ul.querySelectorAll("li").forEach(bindColorClickHandler);

canvas.addEventListener("mousedown", function(e){
	lastEvent = e;
	isMouseDown = true;
});

canvas.addEventListener("mousemove", function(e){
	if(isMouseDown) {
		let rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;
        
        let offsetX = e.clientX - rect.left;
        let offsetY = e.clientY - rect.top;

        context.beginPath();
        context.moveTo(lastEvent.offsetX * scaleX, lastEvent.offsetY * scaleY);    
        context.lineTo(offsetX * scaleX, offsetY * scaleY);
        context.strokeStyle = color;
        context.lineWidth = brushWidth * scaleFactor; // Adjust brush width based on scale factor
        context.lineCap = "round";
        context.stroke();
        
        lastEvent = e; 	
	}
});

canvas.addEventListener("mouseup", function(){
	isMouseDown = false;
});

document.querySelectorAll("input[type=range]").forEach(bindBrushSizeHandler);

saveImageButton.addEventListener("click", function(){
	var downloadLink = document.createElement("a");
	downloadLink.href = canvas.toDataURL();
	downloadLink.download = "image.png";
	downloadLink.target = "_blank";
	downloadLink.click();
});

document.getElementById('fileInput').addEventListener('change', function(event) {
	const file = event.target.files[0];
	if (file && file.type.startsWith('image/')) {
	  const reader = new FileReader();
	  reader.onload = function(event) {
		const img = new Image();
		img.onload = function() {
		  const canvas = document.getElementById('canvas');
		  const ctx = canvas.getContext('2d');
		  ctx.clearRect(0, 0, canvas.width, canvas.height);
		  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		};
		img.src = event.target.result;
	  };
	  reader.readAsDataURL(file);
	}
  });