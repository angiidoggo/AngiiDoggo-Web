// js/comisiones.js

// Traducciones para datos dinámicos de comisiones
const traduccionesComisiones = {
  estados: {
    es: {
      abierta: "DISPONIBLE",
      cerrada: "NO DISPONIBLE",
      pausada: "PAUSADA",
    },
    en: {
      abierta: "AVAILABLE",
      cerrada: "NOT AVAILABLE",
      pausada: "PAUSED",
    },
  },
  mensajes: {
    es: {
      cargando: "Cargando comisiones...",
      sinComisiones: "No hay comisiones disponibles por el momento.",
      errorCargar:
        "Error al cargar las comisiones. Por favor, intenta más tarde.",
    },
    en: {
      cargando: "Loading commissions...",
      sinComisiones: "No commissions available at the moment.",
      errorCargar: "Error loading commissions. Please try again later.",
    },
  },
};

// Cache de traducciones en localStorage para no repetir llamadas
const CACHE_KEY = "traducciones_cache";

function getTraduccionesCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function setTraduccionCache(textoOriginal, traduccion) {
  const cache = getTraduccionesCache();
  cache[textoOriginal] = traduccion;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// Función para traducir texto usando MyMemory API (gratis)
async function traducirTexto(texto) {
  if (!texto || texto.trim() === "") return texto;

  // Revisar cache primero
  const cache = getTraduccionesCache();
  if (cache[texto]) {
    return cache[texto];
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      texto
    )}&langpair=es|en`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData.translatedText) {
      const traduccion = data.responseData.translatedText;
      setTraduccionCache(texto, traduccion);
      return traduccion;
    }
    return texto;
  } catch (error) {
    console.warn("Error al traducir:", error);
    return texto;
  }
}

// Obtener idioma actual
function getIdiomaComisiones() {
  return localStorage.getItem("idioma") || "es";
}

// Función para crear el indicador de estado
function crearIndicadorEstado(estado) {
  const idioma = getIdiomaComisiones();
  let claseEstado, icono, texto;

  switch (estado.toLowerCase()) {
    case "abierta":
      claseEstado = "estado-abierta";
      icono = "fa-check-circle";
      texto = traduccionesComisiones.estados[idioma].abierta;
      break;
    case "cerrada":
      claseEstado = "estado-cerrada";
      icono = "fa-times-circle";
      texto = traduccionesComisiones.estados[idioma].cerrada;
      break;
    case "pausada":
      claseEstado = "estado-pausada";
      icono = "fa-pause-circle";
      texto = traduccionesComisiones.estados[idioma].pausada;
      break;
    default:
      claseEstado = "estado-abierta";
      icono = "fa-check-circle";
      texto = traduccionesComisiones.estados[idioma].abierta;
  }

  return `
    <div class="indicador-estado ${claseEstado}">
      <div class="estado-header">
        <i class="fas ${icono}"></i>
        <span class="estado-texto">${texto}</span>
      </div>
    </div>
  `;
}

// Función para crear HTML de una tarjeta de comisión (ahora async)
async function crearTarjetaComision(comision) {
  const { nombre, precio, moneda, imagen_url, descripcion, estado } = comision;
  const precioEnDolares = (precio * 1.1).toFixed(2);
  const idioma = getIdiomaComisiones();

  // Traducir nombre y descripción si el idioma es inglés
  let nombreTraducido = nombre;
  let descripcionTraducida = descripcion;

  if (idioma === "en") {
    // Traducir en paralelo para mayor velocidad
    const [nombreTrad, descTrad] = await Promise.all([
      traducirTexto(nombre),
      descripcion ? traducirTexto(descripcion) : Promise.resolve(""),
    ]);
    nombreTraducido = nombreTrad;
    descripcionTraducida = descTrad;
  }

  // Convertir saltos de línea (\n) a <br> para que se muestren en HTML
  const descripcionFormateada = descripcionTraducida
    ? descripcionTraducida.replace(/\n/g, "<br>")
    : "";

  return `
    <div class="tarjeta-comision">
      <div class="imagen-comision">
        <img src="${imagen_url}" alt="${nombreTraducido}">
      </div>
      <div class="contenido-comision">
        <h3 class="nombre-comision">${nombreTraducido}</h3>
        <div class="precio-comision">
          <div>${precio} €</div>
          <small style="font-weight: bold; font-size: 0.5em; display: block; line-height: 1;">$${precioEnDolares} USD</small>
        </div>
        
        ${crearIndicadorEstado(estado)}
        
        <p class="descripcion-comision">${descripcionFormateada}</p>
      </div>
    </div>
  `;
}

// Función principal para cargar comisiones
async function cargarComisiones() {
  const contenedorComisiones = document.getElementById("grid-comisiones");

  if (!contenedorComisiones) {
    console.error("No se encontró el contenedor de comisiones");
    return;
  }

  try {
    // Mostrar loader
    contenedorComisiones.innerHTML =
      '<p class="texto-centrado">Cargando comisiones...</p>';

    // Llamar a la API
    const response = await fetch("/.netlify/functions/comisiones");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      const idiomaActual = getIdiomaComisiones();
      throw new Error(
        data.error || traduccionesComisiones.mensajes[idiomaActual].errorCargar
      );
    }

    // Si no hay comisiones
    if (data.comisiones.length === 0) {
      const idiomaActual = getIdiomaComisiones();
      contenedorComisiones.innerHTML = `
        <p class="texto-centrado" style="color: #8a8a8a; font-style: italic;">
          ${traduccionesComisiones.mensajes[idiomaActual].sinComisiones}
        </p>
      `;
      return;
    }

    // Generar HTML para cada comisión (ahora con Promise.all porque es async)
    const idiomaActual = getIdiomaComisiones();
    if (idiomaActual === "en") {
      contenedorComisiones.innerHTML =
        '<p class="texto-centrado">🌐 Translating...</p>';
    }

    const tarjetasPromises = data.comisiones.map((com) =>
      crearTarjetaComision(com)
    );
    const tarjetasHTML = await Promise.all(tarjetasPromises);
    contenedorComisiones.innerHTML = tarjetasHTML.join("");

    console.log(
      `✅ ${data.comisiones.length} comisiones cargadas correctamente`
    );
  } catch (error) {
    console.error("❌ Error al cargar comisiones:", error);
    const idiomaActual = getIdiomaComisiones();
    contenedorComisiones.innerHTML = `
      <p class="texto-centrado" style="color: #e74c3c;">
        ⚠️ ${traduccionesComisiones.mensajes[idiomaActual].errorCargar}
      </p>
    `;
  }
}

// Cargar comisiones cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", cargarComisiones);
} else {
  cargarComisiones();
}

// Recargar comisiones cuando cambie el idioma
window.addEventListener("idiomaChanged", () => {
  console.log("🌐 Idioma cambiado, recargando comisiones...");
  cargarComisiones();
});
