-- Asignar instructoras por defecto a las clases plantilla
-- Usa WITH para obtener IDs reales de instructoras y clases del negocio

WITH
  instr AS (
    SELECT i.id, ROW_NUMBER() OVER (ORDER BY i.id) AS rn
    FROM instructors i
    JOIN businesses b ON b.id = i.business_id
    WHERE b.slug = 'alma-studio'
      AND i.is_active = true
    LIMIT 10
  ),
  cls AS (
    SELECT c.id, c.name, c.day_of_week, ROW_NUMBER() OVER (ORDER BY c.day_of_week, c.start_time) AS rn
    FROM classes c
    JOIN businesses b ON b.id = c.business_id
    WHERE b.slug = 'alma-studio'
      AND c.is_active = true
  ),
  total_instr AS (SELECT COUNT(*) AS cnt FROM instr),
  assigned AS (
    SELECT
      cls.id AS class_id,
      (SELECT id FROM instr WHERE rn = ((cls.rn - 1) % (SELECT cnt FROM total_instr)::int) + 1) AS instructor_id
    FROM cls
  )
UPDATE classes
SET instructor_id = assigned.instructor_id
FROM assigned
WHERE classes.id = assigned.class_id;

-- Verificar resultado
SELECT c.name, c.day_of_week,
       p.first_name || ' ' || p.last_name AS instructora
FROM classes c
LEFT JOIN instructors i ON i.id = c.instructor_id
LEFT JOIN profiles p ON p.id = i.user_id
JOIN businesses b ON b.id = c.business_id
WHERE b.slug = 'alma-studio'
ORDER BY c.day_of_week, c.start_time;
