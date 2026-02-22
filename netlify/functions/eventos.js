const { neon } = require("@neondatabase/serverless");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const connectionString =
      process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL no configurada");
    }

    const sql = neon(connectionString);

    const eventos = await sql`
      SELECT
        id,
        nombre,
        ubicacion,
        fecha_inicio,
        fecha_fin,
        hora_evento,
        dias_asistencia,
        estado_asistencia
      FROM eventos
      WHERE activo = true
      ORDER BY orden ASC, fecha_inicio ASC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, eventos }),
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
