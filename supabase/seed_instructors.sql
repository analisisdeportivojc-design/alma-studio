-- Seed: 10 instructoras de prueba para Alma Studio
-- Ejecuta DESPUÉS de tener al menos 1 negocio en la tabla businesses
-- Asegúrate de que las tablas profiles, memberships e instructors existen

DO $$
DECLARE
  biz_id UUID;
  uid UUID;
  instr_data RECORD;
BEGIN
  -- Obtener el business_id de Alma Studio
  SELECT id INTO biz_id FROM businesses LIMIT 1;
  IF biz_id IS NULL THEN
    RAISE EXCEPTION 'No existe ningún negocio. Crea primero el negocio.';
  END IF;

  -- Datos de las 10 instructoras
  FOR instr_data IN SELECT * FROM (VALUES
    (
      'valentina.torres@alma-demo.com', 'Valentina', 'Torres',
      'Certificada en Pilates Reformer por BASI Pilates. 8 años de experiencia transformando cuerpos y mentes a través del movimiento consciente.',
      'Especialista en Reformer · BASI Certified',
      '@valentina.pilates',
      ARRAY['Pilates Reformer', 'Pilates Mat', 'Stretching'],
      ARRAY['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop'
    ),
    (
      'sofia.miranda@alma-demo.com', 'Sofía', 'Miranda',
      'Bailarina profesional reconvertida a instructora de Barré y Pilates. Fusiona técnica clásica de danza con el método Pilates para crear clases únicas.',
      'Barré & Pilates · Ex Bailarina',
      '@sofia.barre',
      ARRAY['Barré', 'Pilates Mat', 'Danza'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop'
    ),
    (
      'camila.reyes@alma-demo.com', 'Camila', 'Reyes',
      'Fisioterapeuta y instructora certificada. Especializada en rehabilitación y Pilates terapéutico para clientes con lesiones o condiciones especiales.',
      'Pilates Terapéutico · Fisioterapeuta',
      '@camila.rehab',
      ARRAY['Rehabilitación', 'Pilates Reformer', 'Prenatal'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1594736797933-d0d3a1b6f3f4?w=400&h=400&fit=crop'
    ),
    (
      'isabella.santos@alma-demo.com', 'Isabella', 'Santos',
      'Instructora de Yoga y Pilates formada en India y Brasil. Conecta el movimiento con la respiración y la meditación para una práctica integral.',
      'Yoga · Pilates · Mindfulness',
      '@bella.yoga',
      ARRAY['Yoga', 'Pilates Mat', 'Stretching'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop'
    ),
    (
      'mariana.cruz@alma-demo.com', 'Mariana', 'Cruz',
      'Especialista en Pilates Reformer con enfoque funcional. Sus clases combinan fuerza, flexibilidad y trabajo cardiovascular para resultados reales.',
      'Reformer Funcional · Certificada STOTT',
      '@mariana.stott',
      ARRAY['Pilates Reformer', 'Funcional'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop'
    ),
    (
      'lucia.vargas@alma-demo.com', 'Lucía', 'Vargas',
      'Instructora prenatal y postnatal certificada. Acompaña a mamás en cada etapa de su embarazo y recuperación con ejercicios seguros y efectivos.',
      'Pilates Prenatal · Postnatal',
      '@lucia.prenatal',
      ARRAY['Prenatal', 'Pilates Mat', 'Stretching'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop'
    ),
    (
      'andrea.gomez@alma-demo.com', 'Andrea', 'Gómez',
      'Formada en Buenos Aires y Barcelona, trae lo mejor del método clásico europeo de Pilates. Exigente pero empática, para quienes quieren resultados de verdad.',
      'Método Clásico · Reforma y Mat',
      '@andrea.clasico',
      ARRAY['Pilates Reformer', 'Pilates Mat'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1486218119243-13301543a831?w=400&h=400&fit=crop'
    ),
    (
      'natalia.flores@alma-demo.com', 'Natalia', 'Flores',
      'Ex atleta de alto rendimiento. Sus clases de Pilates funcional están diseñadas para deportistas y personas que quieren mejorar su performance físico.',
      'Pilates Deportivo · Alto Rendimiento',
      '@natalia.sport',
      ARRAY['Funcional', 'Pilates Reformer'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    ),
    (
      'alejandra.rios@alma-demo.com', 'Alejandra', 'Ríos',
      'Instructora de Pilates y meditación con 10 años de experiencia. Crea un espacio seguro y acogedor para practicantes de todos los niveles.',
      'Pilates · Meditación · Bienestar',
      '@aleja.zen',
      ARRAY['Pilates Mat', 'Yoga', 'Stretching'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=400&fit=crop'
    ),
    (
      'daniela.paredes@alma-demo.com', 'Daniela', 'Paredes',
      'La más joven del equipo, graduada con honores en Kinesiología. Fresca, dinámica y siempre al día con las últimas tendencias en movimiento consciente.',
      'Kinesióloga · Pilates Nueva Generación',
      '@dani.kine',
      ARRAY['Pilates Reformer', 'Funcional', 'Barré'],
      ARRAY[]::TEXT[],
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=400&fit=crop'
    )
  ) AS t(email, first_name, last_name, bio, tagline, instagram_handle, specialties, video_urls, photo_url)
  LOOP
    -- Generar UUID para el usuario
    uid := gen_random_uuid();

    -- Insertar en profiles (sin crear usuario de auth, solo perfil demo)
    INSERT INTO profiles (id, first_name, last_name)
    VALUES (uid, instr_data.first_name, instr_data.last_name)
    ON CONFLICT (id) DO NOTHING;

    -- Insertar membresía como instructor
    INSERT INTO memberships (user_id, business_id, role)
    VALUES (uid, biz_id, 'instructor')
    ON CONFLICT DO NOTHING;

    -- Insertar instructora
    INSERT INTO instructors (user_id, business_id, bio, specialties, photo_url, video_urls, instagram_handle, tagline, is_active)
    VALUES (
      uid, biz_id,
      instr_data.bio,
      instr_data.specialties,
      instr_data.photo_url,
      instr_data.video_urls,
      instr_data.instagram_handle,
      instr_data.tagline,
      true
    )
    ON CONFLICT DO NOTHING;

  END LOOP;

  RAISE NOTICE 'Seed completado: 10 instructoras creadas para business_id = %', biz_id;
END;
$$;
