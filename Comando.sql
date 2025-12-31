CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  ubicacion VARCHAR(200) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  hora_evento TIME,
  dias_asistencia TEXT,
  tipo_participacion VARCHAR(50) DEFAULT 'Asistiendo',
  activo BOOLEAN DEFAULT true,
  orden INT DEFAULT 0
);

-- Insertar datos de prueba
INSERT INTO eventos (nombre, ubicacion, fecha_inicio, fecha_fin, hora_evento, dias_asistencia, tipo_participacion, orden) VALUES
('Fur The Record', 'Glasgow, Escocia', '2025-12-06', NULL, NULL, NULL, 'Asistiendo', 1),
('Scotiacon', 'Glasgow, Escocia', '2026-02-06', '2026-02-08', '10:00', 'Viernes y Sábado', 'Vendiendo', 2),
('Confuzzled', 'Birmingham, Inglaterra', '2026-05-22', '2026-05-25', NULL, 'Todo el evento', 'Asistiendo', 3);

-- Añadir la columna a tu tabla existente
ALTER TABLE eventos 
ADD COLUMN estado_asistencia VARCHAR(20);

-- Todos los campos son opcionales, así que pueden ser NULL