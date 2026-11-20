const TIEMPO_POR_PREGUNTA = 60;

let indice = 0, puntos = 0, resultados = [], tiempo = 0, reloj = null, espera = null;

const $ = id => document.getElementById(id);
const pantallas = { inicio: $("inicio"), quiz: $("quiz"), final: $("final") };

function mostrar(nombre) {
  Object.keys(pantallas).forEach(n => { pantallas[n].hidden = n !== nombre; });
}

function empezar() {
  indice = 0; puntos = 0; resultados = [];
  mostrar("quiz");
  cargarPregunta();
}

function cargarPregunta() {
  const p = PREGUNTAS[indice];
  $("progreso").textContent = "Pregunta " + (indice + 1) + " de " + PREGUNTAS.length;
  $("puntos").textContent = "Puntos: " + puntos;
  $("pregunta").textContent = p.pregunta;
  $("mensaje").textContent = "";
  $("btn-siguiente").hidden = true;

  const cont = $("opciones");
  cont.innerHTML = "";
  p.opciones.forEach((texto, i) => {
    const b = document.createElement("button");
    b.className = "opcion";
    b.innerHTML = "<span></span><span class=\"marca\" aria-hidden=\"true\"></span>";
    b.firstChild.textContent = texto;
    b.addEventListener("click", () => elegir(i));
    cont.appendChild(b);
  });
  $("pregunta").focus();

  tiempo = TIEMPO_POR_PREGUNTA;
  pintarReloj();
  clearInterval(reloj);
  reloj = setInterval(() => {
    tiempo--;
    pintarReloj();
    if (tiempo <= 0) agotarTiempo();
  }, 1000);
}

function pintarReloj() {
  $("reloj").textContent = tiempo + " s";
  $("reloj").classList.toggle("urgente", tiempo <= 10);
}

// Marca en verde la correcta y en rojo la elegida si falló
function revelar(elegida) {
  const p = PREGUNTAS[indice];
  const botones = $("opciones").children;
  Array.from(botones).forEach((b, i) => {
    b.disabled = true;
    if (i === p.correcta) { b.classList.add("correcta"); b.lastChild.textContent = "✓"; }
    else if (i === elegida) { b.classList.add("incorrecta"); b.lastChild.textContent = "✗"; }
  });
  $("puntos").textContent = "Puntos: " + puntos;
}

function elegir(i) {
  clearInterval(reloj);
  const p = PREGUNTAS[indice];
  const acierto = i === p.correcta;
  if (acierto) puntos++;
  resultados.push({ pregunta: p.pregunta, elegida: i, correcta: p.correcta, acierto, agotado: false });
  revelar(i);
  $("mensaje").textContent = acierto
    ? "¡Correcto!"
    : "Incorrecto. La respuesta correcta es: " + p.opciones[p.correcta];
  $("btn-siguiente").hidden = false;
  $("btn-siguiente").textContent = indice === PREGUNTAS.length - 1 ? "Ver resultados" : "Siguiente";
  $("btn-siguiente").focus();
}

function agotarTiempo() {
  clearInterval(reloj);
  const p = PREGUNTAS[indice];
  puntos--;
  resultados.push({ pregunta: p.pregunta, elegida: null, correcta: p.correcta, acierto: false, agotado: true });
  revelar(null);
  $("mensaje").textContent = "Se acabó el tiempo (−1 punto). La respuesta era: " + p.opciones[p.correcta];
  // Pasa sola a la siguiente pregunta
  espera = setTimeout(siguiente, 3000);
}

function siguiente() {
  clearTimeout(espera);
  indice++;
  if (indice >= PREGUNTAS.length) return terminar();
  cargarPregunta();
}

function terminar() {
  clearInterval(reloj);
  mostrar("final");
  $("nota-final").textContent = "Puntuación final: " + puntos + " de " + PREGUNTAS.length;
  const lista = $("resultados");
  lista.innerHTML = "";
  resultados.forEach((r, n) => {
    const p = PREGUNTAS[n];
    const li = document.createElement("li");
    li.className = r.acierto ? "bien" : "mal";
    const estado = r.acierto ? "Acertada" : (r.agotado ? "Sin responder (−1)" : "Fallada");
    const tuya = r.elegida === null ? "—" : p.opciones[r.elegida];
    li.innerHTML = "<span class=\"estado\"></span><br><span class=\"q\"></span><br><span class=\"t\"></span>";
    li.querySelector(".estado").textContent = estado;
    li.querySelector(".q").textContent = (n + 1) + ". " + p.pregunta;
    li.querySelector(".t").textContent = r.acierto
      ? "Tu respuesta: " + tuya
      : "Tu respuesta: " + tuya + ". Correcta: " + p.opciones[r.correcta];
    lista.appendChild(li);
  });
}

$("total-preguntas").textContent = PREGUNTAS.length;
$("btn-empezar").addEventListener("click", empezar);
$("btn-siguiente").addEventListener("click", siguiente);
$("btn-reiniciar").addEventListener("click", () => { mostrar("inicio"); });
