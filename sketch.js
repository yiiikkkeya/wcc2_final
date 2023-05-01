// Create a collection for all water
pattern = [];

// Create a collection for all particles
const particles = [];
let scale, theme, graphics, themeWidth;

let bgm;
let songs = [];
let song, ra, pa;
let i = 0;
let s;

// the position coordinates of each frame on every fingertip
let prevPointer = [
  // left hand
  [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
  // right hand
  [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
];

let fingertips = [8, 12, 16, 20];

// create tree variables
let tree = [];
let count = 0;
let growthSpeed = 10000; // growing speed
let currentFrame = 0; 
let maxFrames = 10000; 

let patternSpeed = 0;
let lastPatternLength = 0;

function preload() {
  songs[0] = loadSound("a3.mp3");
  songs[1] = loadSound("b3.mp3");
  songs[2] = loadSound("c3.mp3");
  songs[3] = loadSound("d3.mp3");
  songs[4] = loadSound("f3.mp3");
  bgm = loadSound("bgmmm.mp3");
}

function setup() {
  sketch = createCanvas(windowWidth, 600);

  bgm.loop();
  bgm.amp(0.5);

  handsfree = new Handsfree({
    showDebug: true,
    hands: true,
    hands: {
      enabled: true,
      // numbers of hands
      maxNumHands: 2,
      // the identification parameters
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.5,
    },
  });

  handsfree.enablePlugins("browser");
  handsfree.plugin.pinchScroll.disable();

  buttonStart = createButton("Start Webcam");
  buttonStart.class("handsfree-show-when-stopped");
  buttonStart.class("handsfree-hide-when-loading");
  buttonStart.mousePressed(() => handsfree.start());

  // "loading..."
  buttonLoading = createButton("Loading...");
  buttonLoading.class("handsfree-show-when-loading");

  // "stop"
  buttonStop = createButton("Stop Webcam");
  buttonStop.class("handsfree-show-when-started");
  buttonStop.mousePressed(() => handsfree.stop());

  let a = createVector(width / 2, height);
  let b = createVector(width / 2, height - 60);
  let root = new Branch(a, b);
  tree[0] = root;
}

function draw() {
  background(0);

  // translate(0, 100);

  i++;
  i = i % 50;

  if (frameCount % 30 == 0) {
    patternSpeed = pattern.length - lastPatternLength;
    lastPatternLength = pattern.length;
  }
  if (500 - 100 * patternSpeed > 1) {
    growthSpeed = 500 - 100 * patternSpeed;
  } else {
    growthSpeed = 1;
  }
  animateTree();
  console.log(growthSpeed);

  waterPaint();
}


function waterPaint() {
  // check the state of the fingertips
  const hands = handsfree.data?.hands;

  if (hands?.pinchState) {
    // each hand
    hands.pinchState.forEach((hand, handIndex) => {
      // each finger
      hand.forEach((state, finger) => {
        if (hands.landmarks?.[handIndex]?.[fingertips[finger]]) {
          // location
          let x =
            sketch.width -
            hands.landmarks[handIndex][fingertips[finger]].x * sketch.width;
          let y =
            hands.landmarks[handIndex][fingertips[finger]].y * sketch.height;

          // add the coordinate data to the front of the array
          if (state === "start") {
            prevPointer[handIndex][finger] = { x, y };
            pattern.push([
              prevPointer[handIndex][finger].x,
              prevPointer[handIndex][finger].y,
              i,
            ]);

            // output a sound, rate and the abscissa are matched in reverse
            ra = map(prevPointer[handIndex][finger].x, 0.1, height, 0.5, 1.3);
            pa = map(prevPointer[handIndex][finger].x, 0.1, width, -1, 1);
            let randomIndex = Math.floor(Math.random() * songs.length);
            song = songs[randomIndex];
            song.rate(ra);
            song.pan(pa);
            song.amp(1);
            song.play();
          }

          prevPointer[handIndex][finger] = { x, y };
        }
      });
    });
  }

  // paint pattern
  pattern.forEach((p) => {
    const r = random(255);
    const g = 255;
    const b = random(255);

    noFill();

    strokeWeight(0.8);
    stroke(r, g, b, 255 - p[2] * 2);
    circle(p[0], p[1], p[2] * 1.25, p[2] * 1.25);

    strokeWeight(1.5);
    stroke(r, g, b, 255 - p[2] * 2);
    circle(p[0], p[1], p[2] * 0.8, p[2] * 0.8);

    strokeWeight(2);
    stroke(r, g, b, 255 - p[2] * 2);
    circle(p[0], p[1], p[2] * 0.6, p[2] * 0.6);

    p[2]++;
  });
}

function growTree() {
  if (count < 7 && currentFrame < maxFrames) { // maximum 7 times
    for (let i = tree.length - 1; i >= 0; i--) {
      if (!tree[i].finished) {
        let branches = tree[i].branchRight();
        tree[i].finished = true;
        tree.push(branches[0]);
        tree.push(branches[1]);

        branches = tree[i].branchLeft();
        tree[i].finished = true;
        tree.push(branches[0]);
        tree.push(branches[1]);
      }
    }
    count++;
  }
}

function animateTree() {
  // background(0);
  for (let i = 0; i < tree.length; i++) {
    tree[i].show();
  }

  // grow speed
  if (currentFrame % growthSpeed == 0) {
    growTree();
  }

  currentFrame++;
  if (currentFrame < maxFrames) {
    // requestAnimationFrame(animateTree);
  }
}

class Branch {
  constructor(begin, end) {
    this.begin = begin;
    this.end = end;
    this.finished = false;
    this.weight = 20; // the original weight of tree
  }

  branchRight() {
    let dir = p5.Vector.sub(this.end, this.begin);
    dir.rotate(random(0, PI / 4));
    dir.mult(random(0.8, 3.0)); // random add or reduce the length of tree
    let newEnd = p5.Vector.add(this.end, dir);
    let right = new Branch(this.end, newEnd);
    right.weight = this.weight * random(0.3, 0.6); // randomly reduce the weight

    // another branch
    dir.rotate(-PI / 8);
    dir.mult(0.7); // controle the length of branch
    let newEnd2 = p5.Vector.add(this.end, dir);
    let right2 = new Branch(this.end, newEnd2);
    right2.weight = this.weight * random(0.3, 0.6);

    return [right, right2];
  }

  branchLeft() {
    let dir = p5.Vector.sub(this.end, this.begin);
    dir.rotate(random(-PI / 4, 0));
    dir.mult(random(0.6, 0.9)); 
    let newEnd = p5.Vector.add(this.end, dir);
    let left = new Branch(this.end, newEnd);
    left.weight = this.weight * random(0.5, 0.8); 

    // another branch
    dir.rotate(PI / 8);
    dir.mult(0.7); 
    let newEnd2 = p5.Vector.add(this.end, dir);
    let left2 = new Branch(this.end, newEnd2);
    left2.weight = this.weight * random(0.5, 0.8);

    return [left, left2];
  }

  show() {
    strokeWeight(this.weight);
    stroke(92, 63, 22);
    line(this.begin.x, this.begin.y, this.end.x, this.end.y);
  }
}
