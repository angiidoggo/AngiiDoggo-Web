// netlify/functions/eventos.js
const { neon } = require("@neondatabase/serverless");

exports.handler = async (event, context) => {
  // Headers CORS para permitir peticiones desde tu web
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Manejo de preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Conexión a Neon
    const sql = neon(process.env.DATABASE_URL);

    // Consulta para obtener eventos activos ordenados
    const eventos = await sql`
      SELECT 
        id,
        nombre,
        ubicacion,
        fecha_inicio,
        fecha_fin,
        hora_evento,
        dias_asistencia,
        tipo_participacion,
        estado_asistencia
      FROM eventos
      WHERE activo = true
      ORDER BY orden ASC, fecha_inicio ASC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        eventos: eventos,
      }),
    };
  } catch (error) {
    console.error("Error al obtener eventos:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Error al cargar los eventos",
      }),
    };
  }
};
