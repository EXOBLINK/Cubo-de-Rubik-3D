let video;
let manos;
let rawHandsData = []; // Aquí guarda lo que detecta Google
let tamañoCubito = 90; 
let Separacion = 1.0;  
let rotacionX = 0;
let rotacionY = 0;
let Fuente;

function preload(){
  Fuente = loadFont('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/Roboto-Regular.ttf');
}

function setup() {
  createCanvas(800, 600, WEBGL);

  // FUNCIONES PARA LA CAMARA
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // FUNCIONES PARA EL TRACKER DE LAS MANOS
  manos = new Hands({ 
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  manos.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  // Cada vez que Google detecta manos, nos pasa los resultados
  manos.onResults((results) => {
    rawHandsData = results.multiHandLandmarks; 
  });

  // Uso de la cámara web con   Google MediaPipe
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
  background(15, 15, 20);
// --- 1. INSTRUCCIONES FIJAS EN LA ESQUINA (2D sobre 3D) ---
  push();
  translate(-width / 2, -height / 2); 
  
  // Solucionamos que el texto se esconda dándole una pequeñísima traslación al frente en el eje Z
  translate(0, 0, 1); 

  fill(0, 0, 0, 220); 
  noStroke();
  rect(15, 15, 255, 90, 8); 
  
  // Configuramos el texto con la fuente cargada
  textFont(Fuente); // <--- REVISA QUE TENGA ESTA LÍNEA
  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  text("🎮 CONTROL DE LAS MANOS:", 25, 25);
  
  textSize(12);
  fill(230);
  text("• Usa 1 Mano (Índice) para Girar el cubo", 25, 50);
  text("• Usa 2 Manos para Separar / Unir cubitos", 25, 70);
  pop(); 
  // --- FIN DE INSTRUCCIONES FIJAS --- 

  orbitControl();
  
  //ILUMINACIÓN
  ambientLight(120, 120, 120);
  pointLight(255, 255, 255, 350, -400, 500);   
  pointLight(160, 160, 160, -400, 400, -300);

  // Ejecutamos el análisis de las señas de las manos
  analizarManos();

  // ROTACIONES
  rotateX(rotacionX);
  rotateY(rotacionY);

  //DIBUJANMOS LOS 27 CUBITOS ---
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
      push();
      
        // POSICIONES
        let posX = x * tamañoCubito * Separacion;
        let posY = y* tamañoCubito * Separacion;
        let posZ = z * tamañoCubito *Separacion;
        
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
  
  // DETECTA DOS MANOS PUES SEPARAR el cubo
  if (rawHandsData && rawHandsData.length === 2) {
    let mano1 = rawHandsData[0][0]; 
    let mano2 = rawHandsData[1][0]; 
    let d = dist(mano1.x, mano1.y, mano2.x, mano2.y);
    
    // Mapeamos los valores de la distancia de la pantalla al factor de separación
    Separacion = map(d, 0.2, 0.7, 1.0, 3.5, true);
  } 
  // DETECTA UNA SOLA MANO, ROTAR el cubo 
  else if (rawHandsData && rawHandsData.length === 1) {
     Separacion = lerp(Separacion, 1.0, 0.1);
    
    let indice = rawHandsData[0][8];
  
    rotacionY = map(indice.x, 0, 1, -TWO_PI, TWO_PI);
    rotacionX = map(indice.y, 0, 1, TWO_PI, -TWO_PI);
  } 
  // NO DETECTA MANOS Rota automáticamente
    else {
    Separacion = lerp(Separacion, 1.0, 0.1);
    rotacionX += 0.005;
    rotacionY += 0.005;
  }
}

function Material(x, y, z) {
  if      (x ===  1) ambientMaterial(255, 20,  20);  
  else if (x === -1) ambientMaterial(255, 120, 0);  
  else if (y ===  1) ambientMaterial(10,  60,  255); 
  else if (y === -1) ambientMaterial(0,   210, 40); 
  else if (z ===  1) ambientMaterial(245, 245, 245);
   else               ambientMaterial(255, 230, 0);  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}