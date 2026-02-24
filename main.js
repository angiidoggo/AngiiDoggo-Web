/* Funcion para las particulas del fondo */
(function () {
  const lienzo = document.getElementById("lienzo-fondo"); // Lienzo del fondo
  if (!lienzo) return;
  const contexto = lienzo.getContext("2d"); // Contexto del lienzo
  let ancho, alto, particulas;
  const PALETA = ["#6688ff", "#ff6eb4", "#4ddd72", "#ffc85a", "#a78bfa"]; // Paleta de colores para las partículas

  /* Funcion para redimensionar el lienzo */
  function redimensionar() {
    ancho = lienzo.width = window.innerWidth;
    alto = lienzo.height = window.innerHeight;
    particulas = Array.from(
      { length: Math.round((ancho * alto) / 20000) }, // Cantidad de partículas
      () => ({
        x: Math.random() * ancho, // Posición inicial en el eje X
        y: Math.random() * alto, // Posición inicial en el eje Y
        r: Math.random() * 1.6 + 0.3, // Tamaño aleatorio
        vx: (Math.random() - 0.5) * 0.2, // Velocidad en el eje X
        vy: (Math.random() - 0.5) * 0.2, // Velocidad en el eje Y
        c: PALETA[Math.floor(Math.random() * PALETA.length)], // Color aleatorio
        a: Math.random() * 0.4 + 0.1, // Opacidad aleatoria
      }),
    );
  }

  /* Funcion para actualizar las particulas */
  function actualizar() {
    contexto.clearRect(0, 0, ancho, alto);
    for (const p of particulas) {
      contexto.beginPath();
      contexto.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      contexto.fillStyle = p.c;
      contexto.globalAlpha = p.a;
      contexto.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = ancho; // Si la partícula sale por la izquierda, aparece por la derecha.
      if (p.x > ancho) p.x = 0; // Si la partícula sale por la derecha, aparece por la izquierda.
      if (p.y < 0) p.y = alto; // Si la partícula sale por arriba, aparece por abajo.
      if (p.y > alto) p.y = 0; // Si la partícula sale por abajo, aparece por arriba.
    }
    contexto.globalAlpha = 1; // Opacidad de las partículas
    requestAnimationFrame(actualizar); // Actualiza las partículas
  }

  redimensionar();
  window.addEventListener("resize", redimensionar);
  actualizar();
})();

/* Funcion para limpiar la fecha */
function limpiarFecha(fecha) {
  if (!fecha) return null;
  return String(fecha).substring(0, 10);
}

/* Funcion para cargar los eventos */
async function cargarEventos() {
  const contenedor = document.getElementById("lista-eventos");
  if (!contenedor) return;

  try {
    const respuesta = await fetch("/.netlify/functions/eventos");
    if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);

    const datos = await respuesta.json();
    if (!datos.success) throw new Error(datos.error || "Error en la API");

    if (!datos.eventos || datos.eventos.length === 0) {
      contenedor.innerHTML =
        '<div class="evento-vacio">No hay eventos próximos por el momento.</div>';
      return;
    }

    contenedor.innerHTML = datos.eventos.map(dibujarEvento).join("");
  } catch (error) {
    console.error("[Eventos]", error.message);
    contenedor.innerHTML =
      '<div class="evento-vacio" style="color:var(--accent2)">⚠️ No se pudieron cargar los eventos.</div>';
  }
}

/* Funcion para dibujar los eventos */
function dibujarEvento(evento) {
  const { nombre, ubicacion, hora_evento, dias_asistencia, estado_asistencia } =
    evento;

  const fecha_inicio = limpiarFecha(evento.fecha_inicio);
  const fecha_fin = limpiarFecha(evento.fecha_fin);

  /* Bloque de fecha */
  let mesTexto = "",
    diaTexto = "?",
    rangoTexto = "";

  if (fecha_inicio) {
    const d1 = new Date(fecha_inicio + "T00:00");
    mesTexto = d1
      .toLocaleDateString("es-ES", { month: "short" })
      .replace(".", "")
      .toUpperCase();
    diaTexto = d1.getDate();

    if (fecha_fin && fecha_fin !== fecha_inicio) {
      const d2 = new Date(fecha_fin + "T00:00");
      if (
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
      ) {
        rangoTexto = d1.getDate() + "\u2013" + d2.getDate();
      } else {
        rangoTexto = d2
          .toLocaleDateString("es-ES", { day: "numeric", month: "short" })
          .replace(".", "");
      }
    }
  }

  const bloqueFecha = fecha_inicio
    ? `<div class="fecha-evento">
        <div class="mes-fecha-evento">${mesTexto}</div>
        <div class="dia-fecha-evento">${diaTexto}</div>
        ${rangoTexto ? `<div class="rango-fecha-evento">${rangoTexto}</div>` : ""}
       </div>`
    : "";

  /* Estado de asistencia */
  const badgeEstado = estado_asistencia
    ? `<div class="estado-asistencia">${estado_asistencia}</div>`
    : "";

  /* Líneas de detalles */
  const detalles = [];
  if (ubicacion)
    detalles.push(
      `<div class="detalle-evento"><span class="ie-icono">📍</span>${ubicacion}</div>`,
    );
  if (hora_evento)
    detalles.push(
      `<div class="detalle-evento"><span class="ie-icono">🕐</span>${hora_evento}</div>`,
    );
  if (dias_asistencia)
    detalles.push(
      `<div class="detalle-evento"><span class="ie-icono">📆</span>${dias_asistencia}</div>`,
    );

  return `
    <div class="item-evento">
      ${bloqueFecha}
      <div class="info-evento">
        <div class="nombre-evento">${nombre}</div>
        ${badgeEstado}
        ${detalles.length ? `<div class="detalles-evento">${detalles.join("")}</div>` : ""}
      </div>
    </div>`;
}

/* Cargar eventos */
document.addEventListener("DOMContentLoaded", cargarEventos);

/* Desactivar el click derecho */
document.addEventListener("contextmenu", (event) => event.preventDefault());
