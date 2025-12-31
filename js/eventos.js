// js/eventos.js

// Función para formatear fechas en español
function formatearFecha(fecha) {
  const opciones = { day: "numeric", month: "long", year: "numeric" };
  return new Date(fecha).toLocaleDateString("es-ES", opciones);
}

// Función para formatear rango de fechas
function formatearRangoFechas(fechaInicio, fechaFin) {
  if (!fechaFin) {
    // Solo un día
    return formatearFecha(fechaInicio);
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  // Si es el mismo mes
  if (
    inicio.getMonth() === fin.getMonth() &&
    inicio.getFullYear() === fin.getFullYear()
  ) {
    const opcionesInicio = { day: "numeric" };
    const opcionesFin = { day: "numeric", month: "long", year: "numeric" };
    return `${inicio.toLocaleDateString(
      "es-ES",
      opcionesInicio
    )} - ${fin.toLocaleDateString("es-ES", opcionesFin)}`;
  }

  // Si son meses diferentes
  return `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`;
}

// Función para crear HTML de una tarjeta de evento
function crearTarjetaEvento(evento) {
  const {
    nombre,
    ubicacion,
    fecha_inicio,
    fecha_fin,
    hora_evento,
    dias_asistencia,
    tipo_participacion,
  } = evento;

  // Determinar clase CSS de la etiqueta
  const claseEtiqueta =
    tipo_participacion === "Vendiendo"
      ? "etiqueta-evento etiqueta-vending"
      : "etiqueta-evento";

  // Formatear fecha
  const fechaTexto = formatearRangoFechas(fecha_inicio, fecha_fin);

  // Construir HTML
  let html = `
    <div class="tarjeta-evento">
      <div class="${claseEtiqueta}">${tipo_participacion}</div>
      <h3 class="nombre-evento">${nombre}</h3>
      <p class="ubicacion-evento">
        <i class="fa-solid fa-location-dot"></i> ${ubicacion}
      </p>
      <p class="fecha-evento">
        <i class="fa-solid fa-calendar"></i> ${fechaTexto}
      </p>
  `;

  // Añadir hora si existe
  if (hora_evento) {
    html += `
      <p class="hora-evento">
        <i class="fa-solid fa-clock"></i> ${hora_evento}
      </p>
    `;
  }

  // Añadir días de asistencia si existe
  if (dias_asistencia) {
    html += `
      <p class="dias-asistencia">
        <i class="fa-solid fa-calendar-check"></i> ${dias_asistencia}
      </p>
    `;
  }

  html += `</div>`;

  return html;
}

// Función principal para cargar eventos
async function cargarEventos() {
  const contenedorEventos = document.getElementById("grid-eventos");
  const textoExtra = document.getElementById("texto-extra");

  if (!contenedorEventos) {
    console.error("No se encontró el contenedor de eventos");
    return;
  }

  try {
    // Llamar a la API de Netlify Functions
    const response = await fetch("/.netlify/functions/eventos");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Error al cargar eventos");
    }

    // Si no hay eventos
    if (data.eventos.length === 0) {
      contenedorEventos.innerHTML = `
        <p class="texto-centrado" style="color: #8a8a8a; font-style: italic;">
          No hay eventos próximos por el momento.
        </p>
      `;
      if (textoExtra) textoExtra.style.display = "none";
      return;
    }

    // Generar HTML para cada evento
    const eventosHTML = data.eventos
      .map((evento) => crearTarjetaEvento(evento))
      .join("");
    contenedorEventos.innerHTML = eventosHTML;

    console.log(`✅ ${data.eventos.length} eventos cargados correctamente`);
  } catch (error) {
    console.error("❌ Error al cargar eventos:", error);
    contenedorEventos.innerHTML = `
      <p class="texto-centrado" style="color: #e74c3c;">
        ⚠️ Error al cargar los eventos. Por favor, verifica la conexión.
      </p>
    `;
  }
}

// Cargar eventos cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarEventos);
} else {
  cargarEventos();
}
