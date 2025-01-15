/////////////////////////////////////////// Walls
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(255, 100); // Color de las paredes (líneas)
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

// Definiciones globales
let walls = [];
let ray;
let particle;
let sounds = [];
let filters = [];
let wallCount = 100; // Número de paredes
let rayCount = 1; // Entre 0-1 es lo ideal, pero puede ser 0-X
let centerSound; // Para reproducir el archivo videoplayback.mp4
let displayText = "PLAY"; // Texto inicial
let clickCount = 0; // Contador de clics
let showMenu = false; // Estado para mostrar el menú

function preload() {
  // Cargar el archivo de sonido
  centerSound = loadSound('videoplayback.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let centerX = width / 2;
  let centerY = height / 2;

  // Generar paredes en posiciones fijas desde el centro
  for (let i = 0; i < wallCount; i++) {
    let angle1 = (TWO_PI / wallCount) * i; // Ángulos equidistantes
    let angle2 = (TWO_PI / wallCount) * ((i + 1) % wallCount);

    // Puntos inicial y final de cada línea
    let x1 = centerX + sin(angle1) * 3000; // Distancia fija desde el centro
    let y1 = centerY + cos(angle1) * 1000;
    let x2 = centerX + sin(angle2) * 200;
    let y2 = centerY + cos(angle2) * 80;

    walls[i] = new Boundary(x1, y1, x2, y2); // Pared

    createSoundForWall(i); // Crear sonido para esta pared
  }

  // Límites exteriores
  addBoundaryWithSound(-1, -1, width, -1); // Límite superior
  addBoundaryWithSound(width, -1, width, height); // Límite derecho
  addBoundaryWithSound(width, height, -1, height); // Límite inferior
  addBoundaryWithSound(-1, height, -1, -1); // Límite izquierdo

  particle = new Particle();
  noCursor();
}

function draw() {
  background(0); // Fondo negro

  if (showMenu) {
    // Mostrar el menú
    textAlign(CENTER, CENTER);
    textSize(35);
    fill(255,100); // Texto blanco
    text("HOME", width / 2, height / 2 - 50); // Mover "HOME" hacia arriba
    fill(255,100); // Texto blanco
    text("WORKS", width / 2, height / 2 + 50); // Mover "WORKS" hacia abajo
    if (centerSound.isPlaying()) {
      centerSound.stop(); // Detener la música cuando aparece el menú
    }
  } else {
    // Dibujar las paredes cuando no estamos en el menú
    for (let wall of walls) {
      wall.show();
    }

    // Dibujar el texto en el centro del canvas
    let centerX = width / 2;
    let centerY = height / 2;
    textAlign(CENTER, CENTER);
    textSize(32); // Tamaño del texto
    fill(255, 255, 255, 80); // Color del texto (blanco)
    noStroke();
    if (displayText) {
      text(displayText, centerX, centerY);
    }
  }

  // Mantener la animación del ratón y la iluminación rosa
  particle.update(mouseX, mouseY); // Actualizar la posición del ratón
  particle.show(); // Dibujar la fuente de luz rosa
  particle.look(walls); // Ver las paredes mientras el ratón se mueve

}

// Añadir una pared con sonido asociado
function addBoundaryWithSound(x1, y1, x2, y2) {
  let index = walls.length;
  walls.push(new Boundary(x1, y1, x2, y2));
  createSoundForWall(index);
}

// Crear sonido y filtro para una pared
function createSoundForWall(index) {
  let osc = new p5.Oscillator();
  osc.setType('sine'); // Onda sinusoidal
  osc.freq(220 + index * 10); // Frecuencia única para cada pared
  osc.amp(0); // Volumen inicial en 0
  osc.start();

  // Crear filtro para modificar el sonido
  let filter = new p5.Filter();
  filter.setType('lowpass'); // Filtro pasa bajos
  filter.freq(500 + index * 20); // Frecuencia de corte
  filter.res(15); // Resonancia del filtro

  osc.disconnect(); // Desconectar del destino directo
  osc.connect(filter); // Conectar el oscilador al filtro

  sounds.push(osc);
  filters.push(filter);
}

// Detectar clic del ratón para activar sonidos
function mousePressed() {
  let centerX = width / 2;
  let centerY = height / 2;
  let centerRadius = 50; // Radio de detección para el centro

  // Detectar clic en el centro del canvas
  if (dist(mouseX, mouseY, centerX, centerY) < centerRadius) {
    clickCount++;
    if (clickCount === 2) {
      showMenu = true;
      return;
    }

    if (centerSound.isPlaying()) {
      centerSound.stop(); // Detener el sonido si ya está reproduciéndose
      displayText = "PLAY"; // Cambiar el texto a "STOP"
    } else {
      centerSound.play(); // Reproducir el sonido
      displayText = "STOP"; // Cambiar el texto a "PLAY"
    }
    return;
  }

  // Detectar clic en las opciones del menú
  if (showMenu) {
    // Detectar clic en "HOME"
    if (mouseY > height / 2 - 50 && mouseY < height / 2 - 20) {
      // Acción para "HOME" (volver a la pantalla de inicio)
      showMenu = false; // Volver a la pantalla principal
      clickCount = 0; // Resetear el contador de clics
      displayText = "PLAY"; // Restablecer texto
      return;
    }

    // Detectar clic en "WORKS"
    if (mouseY > height / 2 + 20 && mouseY < height / 2 + 50) {
      // Redirigir a la página de "WORKS"
      window.open('https://www.lumos-marketing.com/', '_blank');
      return;
    }

    // Detectar clic en el centro de "HOME"
    if (dist(mouseX, mouseY, width / 2, height / 2 - 50) < 50) {
      showMenu = false; // Volver a la pantalla principal
      clickCount = 0; // Resetear el contador de clics
      displayText = "PLAY"; // Restablecer texto
      return;
    }

    // Detectar clic en el centro de "WORKS"
    if (dist(mouseX, mouseY, width / 2, height / 2 + 50) < 50) {
      window.open('https://www.lumos-marketing.com/', '_blank');
      return;
    }
  }

  // Detectar clic en las paredes
  for (let i = 0; i < walls.length; i++) {
    let wall = walls[i];
    if (isMouseOnWall(wall)) {
      let osc = sounds[i];
      let filter = filters[i];
      osc.amp(0.5, 0.1); // Subir volumen
      filter.freq(map(mouseY, 0, height, 200, 1200)); // Modificar frecuencia según la posición Y
      setTimeout(() => osc.amp(0, 0.5), 200); // Bajar volumen después de 200ms
    }
  }
}

// Comprobar si el ratón está sobre una pared
function isMouseOnWall(wall) {
  let d1 = dist(mouseX, mouseY, wall.a.x, wall.a.y);
  let d2 = dist(mouseX, mouseY, wall.b.x, wall.b.y);
  let lineLen = dist(wall.a.x, wall.a.y, wall.b.x, wall.b.y);
  let buffer = 5; // Tolerancia de proximidad
  return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
}

/////////////////////////////////////////// Rays
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show() {
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

//////////////////////////////////////////////////// Particles
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        stroke(255, 100, 200); // Color rosa para el rayo
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4); // Fuente de luz rosa
    for (let ray of this.rays) {
      ray.show();
    }
  }
}
