from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# ── Colors ──────────────────────────────────────────────────────────────────
ALMA_DARK   = colors.HexColor("#1a1a1a")
ALMA_GOLD   = colors.HexColor("#c9a96e")
ALMA_CREAM  = colors.HexColor("#f5f0eb")
FITCO_GREEN = colors.HexColor("#00b894")
RED         = colors.HexColor("#e74c3c")
GREEN_OK    = colors.HexColor("#27ae60")
BLUE_NOUS   = colors.HexColor("#2980b9")
GRAY_LIGHT  = colors.HexColor("#f8f8f8")
GRAY_MID    = colors.HexColor("#cccccc")

W, H = A4

def build_pdf(path):
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    def S(name, **kw):
        base = kw.pop("parent", "Normal")
        s = ParagraphStyle(name, parent=styles[base], **kw)
        return s

    sTitle    = S("sTitle",    fontSize=26, textColor=ALMA_DARK,  alignment=TA_CENTER, spaceAfter=4,  fontName="Helvetica-Bold")
    sSubtitle = S("sSubtitle", fontSize=13, textColor=ALMA_GOLD,  alignment=TA_CENTER, spaceAfter=2,  fontName="Helvetica")
    sDate     = S("sDate",     fontSize=9,  textColor=colors.grey, alignment=TA_CENTER, spaceAfter=20, fontName="Helvetica")
    sH1       = S("sH1",       fontSize=15, textColor=colors.white, spaceAfter=4, spaceBefore=16, fontName="Helvetica-Bold", backColor=ALMA_DARK, borderPadding=(6,8,6,8))
    sH2       = S("sH2",       fontSize=11, textColor=ALMA_DARK,  spaceAfter=4, spaceBefore=12, fontName="Helvetica-Bold", borderPadding=(2,0,2,0))
    sH2g      = S("sH2g",      fontSize=11, textColor=FITCO_GREEN, spaceAfter=4, spaceBefore=10, fontName="Helvetica-Bold")
    sBody     = S("sBody",     fontSize=9,  textColor=ALMA_DARK,  spaceAfter=4, leading=14, alignment=TA_JUSTIFY)
    sBullet   = S("sBullet",   fontSize=9,  textColor=ALMA_DARK,  spaceAfter=2, leading=13, leftIndent=12, bulletIndent=0)
    sCaption  = S("sCaption",  fontSize=8,  textColor=colors.grey, spaceAfter=6, fontName="Helvetica-Oblique")
    sNote     = S("sNote",     fontSize=8.5,textColor=ALMA_DARK,  spaceAfter=6, backColor=ALMA_CREAM, borderPadding=(6,8,6,8), leading=13)
    sSmall    = S("sSmall",    fontSize=8,  textColor=colors.grey)

    def hr(color=ALMA_GOLD, thickness=0.8):
        return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=6, spaceBefore=2)

    def h1(txt):
        return [Spacer(1, 6), Paragraph(f"  {txt}", sH1), Spacer(1,4)]

    def h2(txt, green=False):
        st = sH2g if green else sH2
        return [Paragraph(txt, st), hr(GRAY_MID, 0.5)]

    def body(txt):
        return Paragraph(txt, sBody)

    def bullet(txt):
        return Paragraph(f"• {txt}", sBullet)

    def note(txt):
        return Paragraph(txt, sNote)

    def table(data, col_widths, header=True):
        t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
        style = [
            ("BACKGROUND", (0,0), (-1,0), ALMA_DARK),
            ("TEXTCOLOR",  (0,0), (-1,0), colors.white),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",   (0,0), (-1,-1), 8),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, GRAY_LIGHT]),
            ("GRID",       (0,0), (-1,-1), 0.4, GRAY_MID),
            ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
            ("TOPPADDING", (0,0), (-1,-1), 5),
            ("BOTTOMPADDING", (0,0), (-1,-1), 5),
            ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ]
        t.setStyle(TableStyle(style))
        return t

    story = []

    # ── PORTADA ──────────────────────────────────────────────────────────────
    story += [
        Spacer(1, 1.5*cm),
        Paragraph("ALMA STUDIO", sTitle),
        Paragraph("Análisis Completo del Sistema Fitco", sSubtitle),
        Paragraph("Informe Estratégico · Junio 2026", sDate),
        hr(ALMA_GOLD, 1.5),
        Spacer(1, 0.4*cm),
        note(
            "<b>Objetivo de este informe:</b> Mapear cada funcionalidad de Fitco con base en "
            "el acceso real al sistema de Alma Studio. Identificar qué ya tenemos construido, "
            "qué debemos construir, y por qué nuestra solución es estratégicamente superior."
        ),
        Spacer(1, 0.3*cm),
    ]

    # ── 1. RESUMEN EJECUTIVO ─────────────────────────────────────────────────
    story += h1("1. RESUMEN EJECUTIVO")
    story += [
        body("Fitco es un SaaS latinoamericano para gestión de gimnasios y estudios fitness. "
             "Alma Studio (Magdalena del Mar, Lima) paga mensualmente por usar este sistema. "
             "Tras revisar cada módulo del admin, encontramos que <b>Fitco funciona como un "
             "widget JavaScript embebido en el sitio del cliente</b>, no como una web real. "
             "El código, el dominio funcional, el SEO y la marca pertenecen a Fitco, no al negocio."),
        Spacer(1, 0.2*cm),
        body("Nuestra propuesta es diferente: construimos un sistema a medida, propiedad del cliente, "
             "con identidad de marca real, escalable a múltiples negocios como plataforma blanca."),
        Spacer(1, 0.3*cm),
    ]

    # Resumen comparativo rápido
    data = [
        ["Criterio", "Fitco", "Nuestra Solución"],
        ["Propietario del código", "Fitco S.A.", "El cliente"],
        ["Propietario del dominio web", "fitcoapp.net / fitcolatam.com", "Tu dominio propio"],
        ["Branding en el sistema", '"Powered by Fitco" inamovible', "100% marca propia"],
        ["Diseño web", "Template genérico verde", "Identidad de marca real"],
        ["Tipografía", "Sans-serif heredada", "Playfair Display + custom"],
        ["Pasarela de pago", "Solo Mercado Pago", "Culqi / Yape / MercadoPago / Niubiz"],
        ["Integraciones web", "Meta Pixel + Google Analytics", "Todo lo anterior + GTM + WhatsApp API"],
        ["SEO", "Indexa a Fitco, no al negocio", "El negocio es dueño del SEO"],
        ["Costo mensual", "Suscripción fija (escala con plan)", "Fee de mantenimiento negociado"],
        ["Escalable a multi-negocio", "No (cada sede paga por separado)", "Sí — plataforma blanca reutilizable"],
    ]
    story.append(table(data, [5.5*cm, 5.5*cm, 5.5*cm]))
    story.append(Spacer(1, 0.3*cm))

    # ── 2. MAPA COMPLETO DE FITCO ────────────────────────────────────────────
    story += h1("2. MAPA COMPLETO DE FITCO — Módulo por Módulo")

    # 2.1 Dashboard
    story += h2("2.1 Dashboard")
    story += [
        body("Panel principal con métricas en tiempo real:"),
        bullet("Ingresos del día / semana / mes"),
        bullet("Clientes activos, inactivos y prospectos"),
        bullet("Próximas clases con aforo en tiempo real"),
        bullet("Próximas renovaciones de membresía (15 días)"),
        bullet("Clientes por recuperar (inactivos +15 días)"),
        bullet("Cumpleaños del mes con envío de cupón automático"),
        bullet("Accesos rápidos: Punto de Venta + Nuevo Cliente"),
        Spacer(1, 0.2*cm),
    ]

    # 2.2 Clases
    story += h2("2.2 Clases")
    story += [
        body("Gestión completa del calendario de clases presenciales:"),
        bullet("Vista Mes / Semana / Día con navegación"),
        bullet("Color por disciplina (Mat=verde, Reformer=verde, Barré=rosa)"),
        bullet("Aforo visible: formato X/Y por clase"),
        bullet("Estados: Abierta / Dictada / Cancelada"),
        bullet("% de ocupación por clase"),
        bullet("Filtros: Sala / Disciplina / Instructor"),
        bullet("Apertura y cierre manual de clases"),
        bullet("Lista de espera con límite configurable (Alma: máx 2 personas)"),
        bullet("Reserva de clientes desde el admin"),
        bullet("Registro de asistencia (Marcar Entrada)"),
        Spacer(1, 0.2*cm),
    ]

    # 2.3 Clientes
    story += h2("2.3 Clientes")
    story += [
        body("CRM de clientes con 1,374 registros en Alma Studio:"),
        bullet("Estados: Prospecto / Activo / Inactivo"),
        bullet("Filtros por estado, membresía, deuda, último acceso"),
        bullet("Perfil completo: datos personales, historial de pagos, clases, medidas corporales"),
        bullet("Campos adicionales custom (Nuevo Cliente / Referencia / Nuevo)"),
        bullet("Categorización de clientes segmentable"),
        bullet("Categoría de documentos adjuntables"),
        bullet("Marcar Entrada directamente desde lista"),
        bullet("Alertas: próximos a vencer, inactivos, cumpleaños"),
        Spacer(1, 0.2*cm),
    ]

    # 2.4 Personal
    story += h2("2.4 Personal")
    story += [
        body("Gestión de staff con 24 personas en Alma Studio:"),
        bullet("Roles: Administración / Coach / Counter / Super Usuario"),
        bullet("Toggle activo/inactivo por persona"),
        bullet("Acceso granular por rol (Coach: solo clases y reservas)"),
        bullet("Pago a personal: por clase / comisión / hora / salario"),
        bullet("Bono basado en reservas (configurable)"),
        Spacer(1, 0.2*cm),
    ]

    story.append(PageBreak())

    # 2.5 Inventario
    story += h2("2.5 Inventario")
    story += [
        body("Módulo para productos físicos (Alma Studio: 0 ítems activos):"),
        bullet("Campos: Categoría, Nombre, Cantidad, Precio, Tipo de venta, Etiquetas"),
        bullet("Conectado al Punto de Venta"),
        Spacer(1, 0.2*cm),
    ]

    # 2.6 Página Web (CMS integrado)
    story += h2("2.6 Página Web — CMS Integrado")
    story += [
        body("Fitco incluye un constructor de web básico. Tiene 5 páginas configurables:"),
        bullet("Página de Inicio — Hero (video/imagen desktop+mobile), Disciplinas, Planes"),
        bullet("Clases — Calendario embebido (plan superior requerido)"),
        bullet("Quiénes Somos (plan superior)"),
        bullet("Planes — Lista filtrable con precios"),
        bullet("On Demand — Galería de clases grabadas (plan superior)"),
        body("<b>Limitación crítica:</b> Solo 6 colores configurables. Tipografía fija (sans-serif heredada). "
             "Layout inamovible. Footer con 'Copyright Fitco © 2015-2026' hardcodeado. "
             "Todos los estudios con Fitco se ven iguales, solo cambia el color."),
        Spacer(1, 0.2*cm),
    ]

    # 2.7 Web Integrada
    story += h2("2.7 Web Integrada — El Verdadero Modelo de Fitco")
    story += [
        note("CLAVE: Fitco no es una web — es un widget JavaScript que se incrusta en cualquier página HTML. "
             "El cliente pega un &lt;script&gt; en su sitio y Fitco toma el control de secciones específicas."),
        body("Divs embebibles disponibles:"),
        bullet("fitcoSignIn — Login y registro de clientes"),
        bullet("fitcoProfileButton + fitcoProfile — Perfil de usuario"),
        bullet("fitcoPlans / fitcoSubscriptionPlans / fitcoNormalPlans — Planes de pago"),
        bullet("fitcoCalendar — Calendario de reservas"),
        bullet("Fitco SDK — Botones de compra por plan ID"),
        body("Cada elemento embebido muestra 'Powered by Fitco' al usuario. "
             "URL de Alma Studio en Fitco: <b>almastudio.fitcoapp.net</b>"),
        Spacer(1, 0.2*cm),
    ]

    # 2.8 Gastos
    story += h2("2.8 Gastos")
    story += [
        body("Registro de egresos del negocio (alquiler, salarios, servicios). "
             "Alma Studio: 0 gastos registrados — módulo sin usar."),
        Spacer(1, 0.2*cm),
    ]

    # 2.9 Promociones y Regalos
    story += h2("2.9 Promociones y Regalos")
    story += [
        body("Dos submódulos:"),
        bullet("Promociones y regalos — el personal otorga beneficios a clientes, "
               "con flujo de aprobación (En espera / Aprobado / Denegado)"),
        bullet("Cupones de descuento — gestión de códigos promocionales"),
        body("Alma Studio: 0 registros — módulos sin usar."),
        Spacer(1, 0.2*cm),
    ]

    # 2.10 Comunicaciones
    story += h2("2.10 Comunicaciones")
    story += [
        body("Tres submódulos de comunicación (todos vacíos en Alma Studio):"),
        bullet("Comunicaciones — mensajes directos a clientes"),
        bullet("Notificaciones — alertas push"),
        bullet("Noticias — publicaciones para la comunidad"),
        Spacer(1, 0.2*cm),
    ]

    # 2.11 Mensajes Automáticos
    story += h2("2.11 Mensajes Automáticos")
    story += [
        body("Email marketing automatizado con 9+ plantillas configurables:"),
        bullet("Lista de espera (3 sub-eventos: ingreso / posición / de espera a reserva)"),
        bullet("Clases Reservadas — confirmación de reserva"),
        bullet("Cancelación — notificación de cancelación"),
        bullet("Compra de producto"),
        bullet("Vencimiento de plan — recordatorio pre-vencimiento"),
        bullet("Cumpleaños — mensaje automático en fecha"),
        bullet("Sin actividad — reactivación de clientes inactivos"),
        bullet("Recordatorio de pago"),
        bullet("Invitación a renovar"),
        body("Editor rico con variables dinámicas [Disciplina], [Nombre], etc. "
             "Remitente y asunto personalizables por plantilla."),
        Spacer(1, 0.2*cm),
    ]

    story.append(PageBreak())

    # 2.12 Reportes
    story += h2("2.12 Reportes")
    data2 = [
        ["Reportes Básicos (26)", "Reportes Avanzados (9)"],
        ["Alertas de Clientes", "Análisis de Asistencias"],
        ["Asistencia de Clientes por Clases", "Reporte de Retención"],
        ["Caja Ingresos-Gastos", "Reporte de Conversión de Prospectos"],
        ["Cantidad de Clientes por Clases", "Análisis últimas visitas"],
        ["Deudas", "Evolución de Usuarios Activos e Inactivos"],
        ["Gastos", "Mix de Ventas"],
        ["Información de Clientes", "Reporte unificado de membresías"],
        ["Ingresos - Caja por Membresías", "Reporte P&L Mensual"],
        ["Ingresos - Caja por Productos", "Calificación de instructores"],
        ["Lista de espera por clase / cliente", ""],
        ["Membresías de Prueba Asignadas", ""],
        ["Mensajes Automáticos Enviados", ""],
        ["Movimientos De Inventario", ""],
        ["Notificaciones", ""],
        ["Pago a Personal (Por Clase/Comisión/Hora/Salario)", ""],
        ["Reservas", ""],
        ["Usuarios Activos - Inactivos / Prospectos", ""],
        ["Venta de membresías / Ventas por Plan", ""],
        ["Registro Entrada Clientes / Entrada-Salida Personal", ""],
    ]
    story.append(table(data2, [8.5*cm, 8*cm]))
    story.append(Spacer(1, 0.3*cm))

    # 2.13 Configuración
    story += h2("2.13 Configuración del Sistema")
    story += [
        body("Alma Studio configurado con:"),
        bullet("2 Salas: Sala Reformer + Sala Multiusos"),
        bullet("3 Disciplinas: Mat (verde) / Reformer (verde) / Barré (rosa)"),
        bullet("17 Planes activos (Mat & Barré: S/40–S/960 / Reformer: S/60–S/455+)"),
        bullet("Métodos de pago: Online + Tarjeta/Débito/Yape"),
        bullet("Comprobante: Boleta (sin factura)"),
        bullet("Pasarela: Mercado Pago (única opción)"),
        bullet("Cancelación bloqueada: 24h antes de clase"),
        bullet("Reserva anticipada: hasta 14 días"),
        bullet("Clase de prueba: límite 1 por cada 4 meses (anti-abuso)"),
        bullet("5 Roles: Administración / Coach (x2) / Counter / Super Usuario"),
        bullet("Zona horaria: Perú — Lima (UTC-5)"),
        bullet("ZKTeco ADMS: integración biométrica disponible (sin dispositivos activos)"),
        Spacer(1, 0.2*cm),
    ]

    # 2.14 Eventos
    story += h2("2.14 Eventos — Audit Log")
    story += [
        body("Registro de auditoría completo con 6 tipos de eventos filtrables:"),
        bullet("Registro de pagos online"),
        bullet("Registro de clases"),
        bullet("Registro de reservas"),
        bullet("Registro de membresías"),
        bullet("Registro de clientes"),
        bullet("Registro de asociaciones de plan y cupón"),
        Spacer(1, 0.2*cm),
    ]

    # ── 3. NUESTRA SOLUCIÓN ──────────────────────────────────────────────────
    story += h1("3. LO QUE YA TENEMOS CONSTRUIDO — Alma Studio")

    story += h2("3.1 Web Pública (Next.js + Vercel)", green=True)
    story += [
        bullet("Landing page completa: Hero con video full-screen desktop + móvil"),
        bullet("Secciones: Disciplinas, Método, Instructoras, Niveles, Paquetes, Horarios, Contacto"),
        bullet("Popup de bienvenida con Clase de Prueba Gratis"),
        bullet("Navbar con logo propio, fondo blanco, menú fullscreen móvil"),
        bullet("Footer + botón WhatsApp flotante"),
        bullet("Tipografía Playfair Display — identidad premium única"),
        bullet("Deploy automático en Vercel desde GitHub"),
        bullet("Dominio: almastudio-lemon.vercel.app (listo para dominio propio)"),
        Spacer(1, 0.2*cm),
    ]

    story += h2("3.2 Páginas internas", green=True)
    story += [
        bullet("/reserva — página de reservas"),
        bullet("/login — acceso de clientes"),
        Spacer(1, 0.2*cm),
    ]

    # ── 4. ROADMAP ───────────────────────────────────────────────────────────
    story.append(PageBreak())
    story += h1("4. ROADMAP — Lo Que Vamos a Construir")

    story += [
        note("Priorizamos por impacto en el negocio. Fase 1 = mínimo viable para reemplazar Fitco. "
             "Fase 2 = superar a Fitco. Fase 3 = funciones que Fitco no tiene."),
        Spacer(1, 0.2*cm),
    ]

    data3 = [
        ["Fase", "Módulo", "Descripción", "Estado"],
        ["1 — MVP", "Admin: Clases", "Calendario semanal/mensual, aforo, disciplinas por color", "Por construir"],
        ["1 — MVP", "Admin: Reservas", "Reservar cliente a clase, marcar asistencia, lista de espera", "Por construir"],
        ["1 — MVP", "Admin: Clientes", "CRM básico: Prospecto/Activo/Inactivo, historial de clases", "Por construir"],
        ["1 — MVP", "Admin: Planes", "Crear/editar planes, asignar a clientes, control de prueba", "Por construir"],
        ["1 — MVP", "Admin: Pagos", "Registro de pagos, membresías activas, vencimientos", "Por construir"],
        ["1 — MVP", "Auth Clientes", "Login/registro propio, perfil, mis reservas", "Por construir"],
        ["1 — MVP", "Reservas Online", "Widget de calendario para que clientes reserven desde la web", "Por construir"],
        ["2 — Superar", "Dashboard", "Métricas: ingresos, ocupación, activos, próximas renovaciones", "Por construir"],
        ["2 — Superar", "Mensajes Auto.", "Emails automáticos: confirmación, recordatorio, vencimiento", "Por construir"],
        ["2 — Superar", "Personal", "Gestión de instructoras, roles, horarios asignados", "Por construir"],
        ["2 — Superar", "Reportes", "P&L mensual, retención, conversión prospectos, asistencia", "Por construir"],
        ["2 — Superar", "Gastos", "Registro de egresos para calcular utilidad neta", "Por construir"],
        ["2 — Superar", "Cupones", "Códigos de descuento para planes específicos", "Por construir"],
        ["2 — Superar", "Punto de Venta", "Cobro presencial en recepción con múltiples métodos de pago", "Por construir"],
        ["3 — Superar+", "Pasarelas múltiples", "Culqi + Yape + Niubiz + Mercado Pago", "Por construir"],
        ["3 — Superar+", "App móvil", "PWA instalable (sin tiendas de apps)", "Visión futura"],
        ["3 — Superar+", "Multi-negocio", "Plataforma blanca: 1 sistema para N estudios", "Visión futura"],
        ["3 — Superar+", "IA: Retención", "Alertas predictivas de abandono por patrones de asistencia", "Visión futura"],
    ]
    story.append(table(data3, [2.5*cm, 3.5*cm, 7*cm, 3.5*cm]))
    story.append(Spacer(1, 0.3*cm))

    # ── 5. ESTRATEGIA DE NEGOCIO ─────────────────────────────────────────────
    story += h1("5. ESTRATEGIA — UN SISTEMA, MÚLTIPLES NEGOCIOS")

    story += [
        body("La pregunta clave es: ¿Construyo algo a medida para cada cliente, o un sistema reutilizable?"),
        Spacer(1, 0.2*cm),
    ]

    data4 = [
        ["Modelo", "Ventaja", "Desventaja"],
        ["Custom por cliente\n(desde cero c/vez)", "Totalmente único\nSin limitaciones técnicas", "Caro de mantener\nLento de entregar\nNo escala"],
        ["Plataforma blanca\n(1 base, N clientes)", "Escala infinita\nMejoras compartidas\nEntrega en días\nIngreso recurrente", "Requiere más\nplanificación inicial"],
        ["Fitco (SaaS externo)", "Todo incluido desde día 1", "Sin control\nBranding ajeno\nUn solo proveedor\nSin diferenciación"],
    ]
    story.append(table(data4, [4.5*cm, 6*cm, 6*cm]))

    story += [
        Spacer(1, 0.3*cm),
        note("RECOMENDACIÓN: Construir una plataforma blanca (White Label). "
             "El código base es el mismo para todos los estudios. Por cliente solo configuras: "
             "logo, colores, disciplinas, planes, instructoras, zona horaria. "
             "Un cliente nuevo = 1 semana de setup. Eso es lo que hace Fitco internamente, "
             "pero nosotros lo hacemos con código propio, branding 100% del cliente, y sin cuota mensual a terceros."),
        Spacer(1, 0.2*cm),
        body("Ejemplo de portfolio escalable: Alma Studio (pilates) → estudio de yoga → gimnasio funcional → "
             "academia de baile → spa con membresías. Mismo sistema, diferentes marcas."),
        Spacer(1, 0.3*cm),
    ]

    # ── 6. VENTAJAS COMPETITIVAS ─────────────────────────────────────────────
    story += h1("6. POR QUÉ SOMOS MEJORES QUE FITCO")

    ventajas = [
        ("Identidad de Marca Real", "Fitco pone su logo en cada pantalla. Nosotros somos invisibles — "
         "el cliente es la marca."),
        ("SEO propio del negocio", "Google indexa almastudio.fitcoapp.net como Fitco, no como Alma Studio. "
         "Con nuestra web, el SEO le pertenece al negocio."),
        ("Código = Activo del cliente", "Si mañana Fitco cierra o sube precios, Alma Studio pierde todo. "
         "Con nuestra solución, el código es suyo."),
        ("Pasarelas de pago flexibles", "Fitco solo acepta Mercado Pago. Nosotros integramos Culqi, "
         "Yape, Niubiz, Mercado Pago — lo que el cliente prefiera."),
        ("Diseño diferenciado", "Todos los estudios con Fitco se ven iguales. Alma Studio tiene "
         "Playfair Display, paleta crema/dorado, video hero — una identidad premium única."),
        ("Sin 'Powered by' ajeno", "Fitco aparece en el login, el footer y el widget. "
         "Nada de eso en nuestra solución."),
        ("Integraciones sin límite", "Fitco: Meta Pixel + Google Analytics. Nosotros: + GTM, "
         "WhatsApp API, CRM externo, Zapier, IA — cualquier integración posible."),
        ("Escalable a Multi-negocio", "Fitco cobra por cada sede por separado. "
         "Nosotros construimos una plataforma para gestionar N estudios desde un solo panel."),
    ]

    for titulo, desc in ventajas:
        story.append(Paragraph(f"<b>✓ {titulo}</b>", sH2))
        story.append(body(desc))
        story.append(Spacer(1, 0.1*cm))

    # ── CIERRE ───────────────────────────────────────────────────────────────
    story.append(PageBreak())
    story += h1("7. PRÓXIMOS PASOS")

    pasos = [
        "Terminar la web pública de Alma Studio (ya está ~85% lista)",
        "Construir el admin: módulo de Clases y Reservas (Fase 1 MVP)",
        "Módulo de Clientes con CRM básico (Fase 1 MVP)",
        "Sistema de Planes y Pagos con Culqi (Fase 1 MVP)",
        "Login de clientes y reservas online (Fase 1 MVP)",
        "Dashboard con métricas básicas (Fase 2)",
        "Mensajes automáticos vía email (Fase 2)",
        "Presentar a Mary Milachay el sistema completo como reemplazo de Fitco",
        "Usar Alma Studio como caso de éxito para vender a otros estudios de Lima",
    ]

    for i, paso in enumerate(pasos, 1):
        story.append(Paragraph(f"<b>{i}.</b> {paso}", sBullet))

    story += [
        Spacer(1, 0.5*cm),
        hr(ALMA_GOLD, 1),
        Spacer(1, 0.2*cm),
        Paragraph("Documento preparado por Juan Carlos · Alma Studio Project · Junio 2026", sSmall),
        Paragraph("Análisis basado en acceso directo al sistema Fitco de Alma Studio (almastudio.fitcoapp.net)", sSmall),
    ]

    doc.build(story)
    print(f"PDF generado: {path}")

if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "Analisis_Fitco_vs_AlmaStudio.pdf")
    build_pdf(out)
