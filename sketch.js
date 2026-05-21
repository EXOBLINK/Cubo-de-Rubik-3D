let video;
let manos;
let rawHandsData = [];
let tamañoCubito = 90;
let Separacion = 1.0;

let rotacionX = 0;
let rotacionY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  manos = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  manos.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  manos.onResults((results) => {
    rawHandsData = results.multiHandLandmarks;
  });

  const camera = new Camera(video.elt, {
    onFrame: async () => {
      await manos.send({ image: video.elt });
    },
    width: 640,
    height: 480
  });
  camera.start();
}

function draw() {
  background(0, 0, 0);

  orbitControl();

  // ILUMINACIÓN

ambientLight(200, 200, 200);
pointLight(255, 255, 255, 350, -400, 500);
pointLight(255, 255, 255, -400, 400, -300);

  analizarManos();

  rotateX(rotacionX);
  rotateY(rotacionY);

  // DIBUJAMOS LOS 27 CUBITOS
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        push();

        let posX = x * tamañoCubito * Separacion;
        let posY = y * tamañoCubito * Separacion;
        let posZ = z * tamañoCubito * Separacion;

        translate(posX, posY, posZ);

        Material(x, y, z);

        stroke(10, 10, 14);
        strokeWeight(1.5);
        box(tamañoCubito - 4);

        pop();
      }
    }
  }
}

// DETECTOR DE MANOS E INTERACTIVIDAD CON EL CUBO
function analizarManos() {
  // DETECTA DOS MANOS: SEPARAR el cubo
  if (rawHandsData && rawHandsData.length === 2) {
    let mano1 = rawHandsData[0][0];
    let mano2 = rawHandsData[1][0];
    let d = dist(mano1.x, mano1.y, mano2.x, mano2.y);

    Separacion = map(d, 0.2, 0.7, 1.0, 3.5, true);
  }
  // DETECTA UNA SOLA MANO: ROTAR el cubo
  else if (rawHandsData && rawHandsData.length === 1) {
    Separacion = lerp(Separacion, 1.0, 0.1);

    let indice = rawHandsData[0][8];

    rotacionY = map(indice.x, 0, 1, -TWO_PI, TWO_PI);
    rotacionX = map(indice.y, 0, 1, TWO_PI, -TWO_PI);
  }
  // NO DETECTA MANOS: Rota automáticamente
  else {
    Separacion = lerp(Separacion, 1.0, 0.1);
    rotacionX += 0.005;
    rotacionY += 0.005;
  }
}

function Material(x, y, z) {
  shininess(50);

  if      (x ===  1) { ambientMaterial(220, 30,  20);  specularMaterial(220, 30,  20);  }
  else if (x === -1) { ambientMaterial(255, 100, 0);   specularMaterial(255, 100, 0);   }
  else if (y ===  1) { ambientMaterial(30,  60,  200); specularMaterial(30,  60,  200); }
  else if (y === -1) { ambientMaterial(0,   180, 30);  specularMaterial(0,   180, 30);  }
  else if (z ===  1) { ambientMaterial(245, 245, 250); specularMaterial(245, 245, 250); }
  else               { ambientMaterial(255, 210, 0);   specularMaterial(255, 210, 0);   }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}