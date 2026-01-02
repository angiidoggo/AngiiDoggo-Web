// netlify/functions/comisiones.js
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
    const sql = neon(process.env.DATABASE_URL);

    const comisiones = await sql`
      SELECT 
        id,
        nombre,
        precio,
        moneda,
        imagen_url,
        descripcion,
        estado
      FROM comisiones
      WHERE activo = true
      ORDER BY orden ASC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        comisiones: comisiones,
      }),
    };
  } catch (error) {
    console.error("Error al obtener comisiones:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Error al cargar las comisiones",
      }),
    };
  }
};
