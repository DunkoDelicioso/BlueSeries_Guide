let alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
let classifier, img, pattern, pattern2, beat, slider, sizeSlider, notebeg;
let x = 200, y = 200, w = 0, z = 0
let holder = 0;
let timer = 1
let size = 100;
let f = 130
let speed = 1;
let arpeggiator = [220, 440]
let arpeggiator2 = [220, 440]
let launcher = 0;
let pushed = false
let strBoi = ''

const chorus = new Tone.Chorus(1, 2.5, 0.5).toDestination().start();
const vol = new Tone.Volume(-12).connect(chorus);
const feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).connect(vol)
const filter = new Tone.Filter(1500, "highpass").connect(vol)
const reverb = new Tone.Reverb(32).connect(vol);

const synth3 = new Tone.PolySynth().connect(reverb);
synth3.set({ detune: 0 });

synth3.volume.value = -2

function preload() {
  classifier = ml5.imageClassifier('MobileNet', modelLoaded);
  img = loadImage('images/9.jpg');
}

function modelLoaded(){
  console.log("Model is Loaded")  
}

function setup() {
  createCanvas(2200, 1500);
  pg = createGraphics(1100, 1500)
  img.resize(1100, 1500)
  image(img, 0, 0);

const synth = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0.1
	}
}).connect(feedbackDelay)

synth.volume.value = -4

const synth2 = new Tone.MonoSynth({
	oscillator: {
		type: "square"
	},
	envelope: {
		attack: 0.1
	}
}).connect(filter)

synth.volume.value = -8

  let pattern = new Tone.Pattern(function(time, note){
    //the order of the notes passed in depends on the pattern
    synth.triggerAttackRelease(note, notebeg);
  }, arpeggiator, "up");

  let pattern2 = new Tone.Pattern(function(time, note){
    //the order of the notes passed in depends on the pattern
    synth2.triggerAttackRelease(note, notebeg * 10);
  }, arpeggiator2, "up");

  Tone.Transport.timeSignature = [4, 4];

  pattern.start(0);
  pattern2.start(0);

 
  pattern.playbackRate = 2
  pattern2.playbackRate = 1

  
}

function playDrum(){
  beat = Tone.Transport.position.split(":")[1];

  if(beat == 0){
    timer++
    launcher ++
  }

  if(launcher == 16){
    // console.log(note1)
    synth3.triggerAttackRelease([arpeggiator[0] / 2, arpeggiator[0] / 2, arpeggiator[0] * 2], notebeg);
    launcher = 0

  }
}

function draw(){
  slider = document.getElementById("myRange").value
  sizeSlider = document.getElementById("myRange2").value
  if (timer > speed && x < width && pushed == true){
    timer = 0
    x = x + size
    runner(x, y)

  if(x >= width - size +1){
      x = -size
      y = y + size;
    }

  if( y > height - size + 1) {
      y = 0
      x = -size
      // saveCanvas(canvas, 'myCanvas', 'jpg');
      noStroke()
      fill(255)
      clear()
      pg.clear();
    }
  }
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  // let word = split(results[0].label, "")
  // Display error in the console
let prob = random(0, 10)
if(prob > 9){
  changer = f * 30.5
  console.log('chnaged')
}else{
  changer = 0
}


  if (error) {
    console.error(error);
  }
  let scroller = document.getElementById('scroller');
  scroller.scrollTop = scroller.scrollHeight;
  scroller.append('Label: ' + results[0].label + " ");
  scroller.appendChild(document.createElement("br"))
  scroller.append('Confidence: ' + nf(results[0].confidence, 0, 2) + " ");
  scroller.appendChild(document.createElement("br"))
  strokeWeight(0)
  textFont("Raleway");
  textSize(60)
  stroke(0)
  fill(0)
  let upper = results[0].label.toUpperCase();
  text(upper, 20,60, 1000, 500)
  if(x < 1000){
  Tone.Transport.bpm.value = int(results[0].confidence * slider);
  notebeg = map(results[0].confidence, 0, 1, 1, 12)
  note = f + (notebeg * f)
  reverb.Reverb =  (notebeg * 4) + changer
  feedbackDelay.delayTime = notebeg 
  feedbackDelay.feedback = notebeg / 12
  arpeggiator2.push(note * 2)
  arpeggiator.push(note)
  strBoi = results[0].label
  // strBoi = strBoi.replace(/\s/g, '');
  // eval(strBoi).resize(sizeSlider, sizeSlider)
  // pg.image(eval(strBoi), x, y)
  
}

  if(arpeggiator.length > 3){
    arpeggiator.shift()
  }

  holder = results[0].confidence

  if(arpeggiator2.length > 4){
    arpeggiator2.shift()
  }
  
  if(x > 1000){
    textSize(10)
    text(results[0].label, x + 10, y + 20, size, size)
  }
}

function runner(x, y){
  var brightest = 0; 
  sizeSlider.step = 50;
  let c = img.get(x, y, sizeSlider, sizeSlider)

  c.resize(300, 300)
  image(img, 0, 0);
  noFill()
  stroke(0)
  strokeWeight(8)
  rect(x, y, sizeSlider, sizeSlider)
  if(x < 1100){

    c.loadPixels();
    if (c.pixels.length > 0) { // don't forget this!
        var brightest = findBrightest(c, sizeSlider);
        var darkest = findBrightest(c, sizeSlider);
    }
    // console.log(brightest)

  image(pg, 1100, 0)
  

  classifier.classify(c, gotResult);
  }
  if(x > 1000){
  let d = img.get(x - width/2 - 50, y, sizeSlider, sizeSlider)
  let b = img.get(x - width/2, y)

  let whiteLvl = b[0] + b[1] + b[2]
  let alphaMap = int(map(whiteLvl, 0, 765, 0, 25));
  stroke(255)
  fill(b)
  rect(x, y, sizeSlider, sizeSlider)
  fill(0)
  textSize(10)
  text(alphabet[alphaMap], x + 6, y + 13)
  classifier.classify(d, gotResult);
  }
  }


  function findBrightest(video, size) {
    // The reason this value is zero is because were looking to compare this to black, the rgb value of black is 0 and if we can go through the array of pixels and see which one is farthest from 0 then well be able to see which is the brightest
      var brightestValue = 0;


    //So we can do the inverse to find the darkest area of a space. Lets do it.
      var darkestSpot = 255;
    
    //This is just a placeholder space for the vector where the brightest spot will be.
      var brightestPosition = createVector(0, 0);
      var darkestPosition = createVector(0, 0);
    
    //This is just giving us a variable for the pixel array, if you console.log it you'll see its an array of all of the different pixel values.
      var pixels = video.pixels;
    
    //Setting the index in the for loop to start at 0
      var i = 0;
    
    //a nested for loop - go through every y position and every x position
      for (var y = 0; y < size; y++) {
          for (var x = 0; x < size; x++) {
            
            //in each one of those positions get the r value, the g value, and the b value.
              var r = pixels[i++];
              var g = pixels[i++];
              var b = pixels[i++];
              i++; // ignore a
            
            //the brightness is the add values of all three of these
              var brightness = r + g + b;
              var red = r;
              var blue = b;
              var green = g;
            
            //if this brightness value is larger than 0 (black) then create a new low threshold, keep checking to see which one is eventually brightest
              if (brightness > brightestValue) {
                  brightestValue = brightness;
              //set the position for the greatest brightness.
                  brightestPosition.set(x, y);
              }

              if (brightness < darkestSpot) {
                darkestSpot = brightness;
            //set the position for the greatest brightness.
                darkestPosition.set(x, y);

            }
          }
      }
    //give me back the brightest position
      return  [brightestPosition, darkestPosition];
  }


