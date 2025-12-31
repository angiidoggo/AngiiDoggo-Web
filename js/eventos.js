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

// Función para obtener la clase CSS y texto del estado de asistencia
function obtenerEstadoAsistencia(estado) {
  if (!estado) return null;

  const estadosConfig = {
    confirmada: {
      clase: "asistencia-confirmada",
      icono: "fa-solid fa-check",
      texto: "Asistiendo",
    },
    si: {
      clase: "asistencia-confirmada",
      icono: "fa-solid fa-check",
      texto: "Asistiendo",
    },
    no: {
      clase: "asistencia-no",
      icono: "fa-solid fa-xmark",
      texto: "No asistiré",
    },
    pendiente: {
      clase: "asistencia-pendiente",
      icono: "fa-solid fa-clock",
      texto: "Pendiente",
    },
    "n-a": {
      clase: "asistencia-na",
      icono: "fa-solid fa-minus",
      texto: "N/A",
    },
    na: {
      clase: "asistencia-na",
      icono: "fa-solid fa-minus",
      texto: "N/A",
    },
  };

  const estadoNormalizado = estado.toLowerCase().trim();
  return estadosConfig[estadoNormalizado] || null;
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
    estado_asistencia,
  } = evento;

  // Iniciar HTML de la tarjeta
  let html = `<div class="tarjeta-evento">`;

  // Contenedor de etiquetas (tipo de participación y estado de asistencia)
  let etiquetasHTML = "";

  // Añadir etiqueta de tipo de participación si existe
  if (tipo_participacion) {
    const claseEtiqueta =
      tipo_participacion.toLowerCase() === "vendiendo"
        ? "etiqueta-evento etiqueta-vending"
        : "etiqueta-evento";
    etiquetasHTML += `<div class="${claseEtiqueta}">${tipo_participacion}</div>`;
  }

  // Añadir etiqueta de estado de asistencia si existe
  const estadoConfig = obtenerEstadoAsistencia(estado_asistencia);
  if (estadoConfig) {
    etiquetasHTML += `<div class="etiqueta-asistencia ${estadoConfig.clase}">
      <i class="${estadoConfig.icono}"></i> ${estadoConfig.texto}
    </div>`;
  }

  // Si hay al menos una etiqueta, añadir el contenedor
  if (etiquetasHTML) {
    html += `<div class="contenedor-etiquetas">${etiquetasHTML}</div>`;
  }

  // Añadir nombre del evento (siempre debe existir)
  html += `<h3 class="nombre-evento">${nombre}</h3>`;

  // Añadir ubicación si existe
  if (ubicacion) {
    html += `
      <p class="ubicacion-evento">
        <i class="fa-solid fa-location-dot"></i> ${ubicacion}
      </p>
    `;
  }

  // Añadir fecha si existe
  if (fecha_inicio) {
    const fechaTexto = formatearRangoFechas(fecha_inicio, fecha_fin);
    html += `
      <p class="fecha-evento">
        <i class="fa-solid fa-calendar"></i> ${fechaTexto}
      </p>
    `;
  }

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
