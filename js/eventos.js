// js/eventos.js

// Traducciones para eventos
const traduccionesEventos = {
  estados: {
    es: {
      asistiendo: "Asistiendo",
      noAsistire: "No asistiré",
      pendiente: "Pendiente",
      na: "N/A",
    },
    en: {
      asistiendo: "Attending",
      noAsistire: "Not attending",
      pendiente: "Pending",
      na: "N/A",
    },
  },
  participacion: {
    es: {
      vendiendo: "Vendiendo",
      visitante: "Visitante",
      expositor: "Expositor",
    },
    en: {
      vendiendo: "Selling",
      visitante: "Visitor",
      expositor: "Exhibitor",
    },
  },
  mensajes: {
    es: {
      sinEventos: "No hay eventos próximos por el momento.",
      errorCargar:
        "Error al cargar los eventos. Por favor, verifica la conexión.",
      diasAsistencia: "Días de asistencia",
    },
    en: {
      sinEventos: "No upcoming events at the moment.",
      errorCargar: "Error loading events. Please check your connection.",
      diasAsistencia: "Attendance days",
    },
  },
};

// Obtener idioma actual
function getIdiomaEventos() {
  return localStorage.getItem("idioma") || "es";
}

// Función para formatear fechas según el idioma
function formatearFecha(fecha) {
  const idioma = getIdiomaEventos();
  const locale = idioma === "en" ? "en-US" : "es-ES";
  const opciones = { day: "numeric", month: "long", year: "numeric" };
  return new Date(fecha).toLocaleDateString(locale, opciones);
}

// Función para formatear rango de fechas
function formatearRangoFechas(fechaInicio, fechaFin) {
  const idioma = getIdiomaEventos();
  const locale = idioma === "en" ? "en-US" : "es-ES";

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
      locale,
      opcionesInicio
    )} - ${fin.toLocaleDateString(locale, opcionesFin)}`;
  }

  // Si son meses diferentes
  return `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`;
}

// Función para obtener la clase CSS y texto del estado de asistencia
function obtenerEstadoAsistencia(estado) {
  if (!estado) return null;

  const idioma = getIdiomaEventos();
  const textos = traduccionesEventos.estados[idioma];

  const estadosConfig = {
    confirmada: {
      clase: "asistencia-confirmada",
      icono: "fa-solid fa-check",
      texto: textos.asistiendo,
    },
    si: {
      clase: "asistencia-confirmada",
      icono: "fa-solid fa-check",
      texto: textos.asistiendo,
    },
    no: {
      clase: "asistencia-no",
      icono: "fa-solid fa-xmark",
      texto: textos.noAsistire,
    },
    pendiente: {
      clase: "asistencia-pendiente",
      icono: "fa-solid fa-clock",
      texto: textos.pendiente,
    },
    "n-a": {
      clase: "asistencia-na",
      icono: "fa-solid fa-minus",
      texto: textos.na,
    },
    na: {
      clase: "asistencia-na",
      icono: "fa-solid fa-minus",
      texto: textos.na,
    },
  };

  const estadoNormalizado = estado.toLowerCase().trim();
  return estadosConfig[estadoNormalizado] || null;
}

// Función para traducir tipo de participación
function traducirParticipacion(tipo) {
  if (!tipo) return null;

  const idioma = getIdiomaEventos();
  const textos = traduccionesEventos.participacion[idioma];
  const tipoNormalizado = tipo.toLowerCase().trim();

  const traducciones = {
    vendiendo: textos.vendiendo,
    selling: textos.vendiendo,
    visitante: textos.visitante,
    visitor: textos.visitante,
    expositor: textos.expositor,
    exhibitor: textos.expositor,
  };

  return traducciones[tipoNormalizado] || tipo;
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
    const tipoTraducido = traducirParticipacion(tipo_participacion);
    const claseEtiqueta =
      tipo_participacion.toLowerCase() === "vendiendo"
        ? "etiqueta-evento etiqueta-vending"
        : "etiqueta-evento";
    etiquetasHTML += `<div class="${claseEtiqueta}">${tipoTraducido}</div>`;
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

  // Añadir ubicación si existe - con enlace a Google Maps
  if (ubicacion) {
    const urlGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      ubicacion
    )}`;
    html += `
      <p class="ubicacion-evento">
        <a href="${urlGoogleMaps}" target="_blank" rel="noopener noreferrer" class="enlace-ubicacion" title="Ver en Google Maps">
          <i class="fa-solid fa-location-dot"></i> ${ubicacion}
          <i class="fa-solid fa-arrow-up-right-from-square icono-externo"></i>
        </a>
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
      const idiomaActual = getIdiomaEventos();
      contenedorEventos.innerHTML = `
        <p class="texto-centrado" style="color: #8a8a8a; font-style: italic;">
          ${traduccionesEventos.mensajes[idiomaActual].sinEventos}
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
    const idiomaActual = getIdiomaEventos();
    contenedorEventos.innerHTML = `
      <p class="texto-centrado" style="color: #e74c3c;">
        ⚠️ ${traduccionesEventos.mensajes[idiomaActual].errorCargar}
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

// Recargar eventos cuando cambie el idioma
window.addEventListener("idiomaChanged", () => {
  console.log("🌐 Idioma cambiado, recargando eventos...");
  cargarEventos();
});
