import {
  PrismaClient,
  Tier,
  Era,
  Category,
  Confidence,
  MomentStatus,
  UserRole,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Admin fundador
  await prisma.user.upsert({
    where: { email: 'fundadorcronos@gmail.com' },
    update: { role: UserRole.ADMIN },
    create: {
      email: 'fundadorcronos@gmail.com',
      name: 'Fundador Cronos',
      role: UserRole.ADMIN,
    },
  })
  console.log('✓ Admin creado/actualizado')

  await prisma.contextEvent.deleteMany()
  await prisma.moment.deleteMany()

  const moments = await prisma.moment.createManyAndReturn({
    data: [
      {
        slug: 'primer-aterrizaje-lunar',
        title: 'El Primer Aterrizaje Lunar',
        year: 1969,
        date: '20 de julio, 1969',
        era: Era.ERA_ESPACIAL,
        category: Category.CIENCIA,
        tier: Tier.MITICO,
        confidence: Confidence.HIGH,
        description:
          'A las 20:17 UTC, el módulo lunar Eagle toca la superficie de la Luna en el Mar de la Tranquilidad. Neil Armstrong y Buzz Aldrin se convierten en los primeros seres humanos en pisar otro mundo. "Un pequeño paso para el hombre, un gran salto para la humanidad."',
        procedence:
          'Documentado por NASA, registros del Centro de Control de Misión Houston, transmisiones televisivas en directo vistas por 600 millones de personas. Archivo desclasificado completo disponible en nasa.gov.',
        imageUrl: '/images/aterrizaje-lunar.jpg',
        location: 'Mar de la Tranquilidad, Luna',
        totalCirculation: 5,
        basePrice: 500000,
        status: MomentStatus.IN_VAULT,
        sources: ['https://www.nasa.gov/mission/apollo-11/'],
      },
      {
        slug: 'caida-de-constantinopla',
        title: 'La Caída de Constantinopla',
        year: 1453,
        date: '29 de mayo, 1453',
        era: Era.EDAD_MEDIA,
        category: Category.GUERRA,
        tier: Tier.EXCEPCIONAL,
        confidence: Confidence.HIGH,
        description:
          'Las tropas otomanas del sultán Mehmed II brecan las murallas de Teodosio tras 53 días de asedio. El Imperio Romano de Oriente, heredero ininterrumpido de Roma durante once siglos, cesa de existir. El mundo medieval termina en este instante.',
        procedence:
          'Crónicas contemporáneas de Critóbulo de Imbros, Ducas y Georgios Sphrantzes. Documentación otomana en el Archivo Topkapi. Fuentes venecianas del Archivo di Stato.',
        imageUrl: '/images/constantinopla.jpg',
        location: 'Constantinopla (actual Estambul, Turquía)',
        totalCirculation: 10,
        basePrice: 80000,
        status: MomentStatus.IN_VAULT,
        sources: ['https://www.britannica.com/event/Fall-of-Constantinople'],
      },
      {
        slug: 'einstein-annus-mirabilis',
        title: 'El Annus Mirabilis de Einstein',
        year: 1905,
        date: 'Marzo–Septiembre, 1905',
        era: Era.ERA_INDUSTRIAL,
        category: Category.CIENCIA,
        tier: Tier.MITICO,
        confidence: Confidence.HIGH,
        description:
          'En un solo año, Albert Einstein publica cuatro artículos que redefinen la física: el efecto fotoeléctrico (Nobel 1921), el movimiento browniano, la relatividad especial y la equivalencia masa-energía (E=mc²). Ningún científico antes o después ha transformado tanto la ciencia en tan poco tiempo.',
        procedence:
          'Publicaciones originales en Annalen der Physik, digitalizadas y verificadas. Archivo Einstein en la Hebrew University de Jerusalén.',
        imageUrl: '/images/einstein-1905.jpg',
        location: 'Berna, Suiza',
        totalCirculation: 5,
        basePrice: 500000,
        status: MomentStatus.IN_VAULT,
        sources: ['https://www.einstein-online.info/en/einsteins-year/'],
      },
      {
        slug: 'los-idus-de-marzo',
        title: 'Los Idus de Marzo',
        year: -44,
        date: '15 de marzo, 44 a.C.',
        era: Era.MUNDO_ANTIGUO,
        category: Category.POLITICA,
        tier: Tier.EXCEPCIONAL,
        confidence: Confidence.HIGH,
        description:
          'Julio César es apuñalado 23 veces en el teatro de Pompeyo por un grupo de senadores encabezado por Bruto y Casio. El magnicidio desencadena las guerras civiles que destruirán la República romana y darán paso al Imperio. El modelo político que gobernará Europa durante siglos nace en este baño de sangre.',
        procedence:
          'Fuentes primarias: Suetonio (De Vita Caesarum), Plutarco (Vidas Paralelas), Apiano (Historia Romana). Verificado por múltiples fuentes independientes contemporáneas.',
        imageUrl: '/images/idus-marzo.jpg',
        location: 'Teatro de Pompeyo, Roma',
        totalCirculation: 10,
        basePrice: 80000,
        status: MomentStatus.SCHEDULED,
        sources: ['https://www.britannica.com/event/Ides-of-March'],
      },
      {
        slug: 'da-vinci-ultima-cena',
        title: 'Da Vinci Termina La Última Cena',
        year: 1498,
        date: 'Febrero, 1498',
        era: Era.RENACIMIENTO,
        category: Category.ARTE,
        tier: Tier.RARO,
        confidence: Confidence.MEDIUM,
        description:
          'Leonardo da Vinci completa La Última Cena en el refectorio de Santa Maria delle Grazie tras tres años de trabajo. La obra revoluciona la perspectiva y la narrativa visual. Mateo 26:21 nunca volvería a pintarse igual.',
        procedence:
          'Documentado por Luca Pacioli en De divina proportione (1498). Registros del ducado de Milán. Fuentes del convento de Santa Maria delle Grazie.',
        imageUrl: '/images/da-vinci-ultima-cena.jpg',
        location: 'Milán, Ducado de Milán (actual Italia)',
        totalCirculation: 20,
        basePrice: 10000,
        status: MomentStatus.SCHEDULED,
        sources: ['https://www.britannica.com/topic/Last-Supper-Leonardo-da-Vinci'],
      },
      {
        slug: 'bomba-hiroshima',
        title: 'La Bomba sobre Hiroshima',
        year: 1945,
        date: '6 de agosto, 1945',
        era: Era.ERA_INDUSTRIAL,
        category: Category.GUERRA,
        tier: Tier.EXCEPCIONAL,
        confidence: Confidence.HIGH,
        description:
          'A las 8:15 hora local, el Enola Gay lanza Little Boy sobre Hiroshima. La primera arma nuclear usada en combate mata entre 70.000 y 80.000 personas de manera instantánea. La humanidad entra en la era atómica y la geopolítica global se reordena alrededor del terror nuclear.',
        procedence:
          'Registros declasificados del Manhattan Project, Comité de Inteligencia Estratégica USAF, testimonios del Archivo Truman. Documentación del gobierno japonés.',
        imageUrl: '/images/hiroshima.jpg',
        location: 'Hiroshima, Japón',
        totalCirculation: 10,
        basePrice: 80000,
        status: MomentStatus.IN_VAULT,
        sources: ['https://www.atomicheritage.org/history/bombings-hiroshima-and-nagasaki-1945'],
      },
      {
        slug: 'caida-muro-berlin',
        title: 'La Caída del Muro de Berlín',
        year: 1989,
        date: '9 de noviembre, 1989',
        era: Era.ERA_ESPACIAL,
        category: Category.POLITICA,
        tier: Tier.EXCEPCIONAL,
        confidence: Confidence.HIGH,
        description:
          'A las 22:17, el portavoz del Politburó Günter Schabowski anuncia por error la apertura inmediata de las fronteras. Miles de berlineses toman los checkpoints. El símbolo físico de la Guerra Fría empieza a derrumbarse a golpe de martillo. El orden mundial bipolar termina esa noche.',
        procedence:
          'Retransmisión en directo de la ZDF, archivos de la Stasi desclasificados, testimonios del Bundestag. Actas del Politburó del SED.',
        imageUrl: '/images/muro-berlin.jpg',
        location: 'Berlín, Alemania',
        totalCirculation: 10,
        basePrice: 80000,
        status: MomentStatus.SCHEDULED,
        sources: ['https://www.britannica.com/event/fall-of-the-Berlin-Wall'],
      },
      {
        slug: 'lanzamiento-chatgpt',
        title: 'El Lanzamiento de ChatGPT',
        year: 2022,
        date: '30 de noviembre, 2022',
        era: Era.ERA_DIGITAL,
        category: Category.CIENCIA,
        tier: Tier.RARO,
        confidence: Confidence.HIGH,
        description:
          'OpenAI publica ChatGPT como demo pública. En cinco días alcanza un millón de usuarios; en dos meses, cien millones. La interfaz conversacional democratiza el acceso a la inteligencia artificial generativa y desencadena la mayor reconfiguración de la industria tecnológica desde el iPhone.',
        procedence:
          'Blog post oficial de OpenAI (30/11/2022), datos de crecimiento verificados por Reuters y Bloomberg. Registros de tráfico de SimilarWeb.',
        imageUrl: '/images/chatgpt.jpg',
        location: 'San Francisco, California, EE.UU.',
        totalCirculation: 25,
        basePrice: 10000,
        status: MomentStatus.IN_AUCTION,
        sources: ['https://openai.com/blog/chatgpt'],
      },
      {
        slug: 'construccion-piramides-giza',
        title: 'La Construcción de las Pirámides de Guiza',
        year: -2560,
        date: 'c. 2560 a.C.',
        era: Era.MUNDO_ANTIGUO,
        category: Category.ARTE,
        tier: Tier.MITICO,
        confidence: Confidence.MEDIUM,
        description:
          'La Gran Pirámide de Keops se completa tras 20 años de construcción, empleando a más de 20.000 trabajadores. Con 146 metros de altura, permanecerá como la estructura más alta del mundo durante 3.800 años. La única de las Siete Maravillas del Mundo Antiguo que sigue en pie.',
        procedence:
          'Diario del oficial Merer (descubierto en Wadi el-Jarf, 2013) — única fuente contemporánea directa. Estudios arqueológicos del IFAO y la Universidad de Harvard.',
        imageUrl: '/images/piramides-giza.jpg',
        location: 'Meseta de Guiza, Egipto',
        totalCirculation: 5,
        basePrice: 500000,
        status: MomentStatus.IN_VAULT,
        sources: ['https://www.britannica.com/topic/Great-Pyramid-of-Giza'],
      },
      {
        slug: 'atentados-11s',
        title: 'Los Atentados del 11 de Septiembre',
        year: 2001,
        date: '11 de septiembre, 2001',
        era: Era.ERA_DIGITAL,
        category: Category.GUERRA,
        tier: Tier.EXCEPCIONAL,
        confidence: Confidence.HIGH,
        description:
          'Cuatro aviones comerciales secuestrados se convierten en armas. Las Torres Gemelas del World Trade Center colapsan en directo ante 2.000 millones de espectadores. 2.977 víctimas. El orden geopolítico post-Guerra Fría termina. La "guerra contra el terror" redefine el siglo XXI.',
        procedence:
          'Comisión Nacional 9/11 (informe público 2004), NIST, registros de la FAA y NORAD. Archivo de la CNN y principales cadenas internacionales.',
        imageUrl: '/images/11s.jpg',
        location: 'Nueva York, Washington D.C. y Pensilvania, EE.UU.',
        totalCirculation: 10,
        basePrice: 80000,
        status: MomentStatus.IN_VAULT,
        sources: ['https://www.9-11commission.gov/report/'],
      },
    ],
  })

  // Eventos de contexto para el Aterrizaje Lunar
  const lunarMoment = moments.find((m) => m.slug === 'primer-aterrizaje-lunar')!
  await prisma.contextEvent.createMany({
    data: [
      {
        momentId: lunarMoment.id,
        date: '4 oct. 1957',
        title: 'Sputnik 1',
        description: 'La URSS lanza el primer satélite artificial. La carrera espacial comienza.',
        order: 1,
      },
      {
        momentId: lunarMoment.id,
        date: '12 abr. 1961',
        title: 'Yuri Gagarin orbita la Tierra',
        description: 'El primer ser humano en el espacio. Kennedy anuncia el objetivo lunar.',
        order: 2,
      },
      {
        momentId: lunarMoment.id,
        date: '20 jul. 1969',
        title: 'Eagle ha aterrizado',
        description: 'Apollo 11 toca la Luna. Armstrong pisa la superficie 6 horas después.',
        order: 3,
      },
      {
        momentId: lunarMoment.id,
        date: '11 dic. 1972',
        title: 'Apollo 17 — última pisada',
        description: 'Harrison Schmitt y Gene Cernan son los últimos humanos en la Luna hasta hoy.',
        order: 4,
      },
    ],
  })

  // Eventos de contexto para la Caída del Muro
  const muroBerlin = moments.find((m) => m.slug === 'caida-muro-berlin')!
  await prisma.contextEvent.createMany({
    data: [
      {
        momentId: muroBerlin.id,
        date: '13 ago. 1961',
        title: 'Construcción del Muro',
        description: 'La RDA levanta el Muro de Berlín en una sola noche dividiendo la ciudad.',
        order: 1,
      },
      {
        momentId: muroBerlin.id,
        date: 'Jun. 1989',
        title: 'Hungría abre su frontera',
        description: 'Miles de alemanes del este huyen hacia occidente por Hungría y Austria.',
        order: 2,
      },
      {
        momentId: muroBerlin.id,
        date: '9 nov. 1989',
        title: 'El anuncio de Schabowski',
        description: 'Un error en la rueda de prensa abre las fronteras. El Muro cae esa noche.',
        order: 3,
      },
      {
        momentId: muroBerlin.id,
        date: '3 oct. 1990',
        title: 'Reunificación alemana',
        description:
          'Las dos Alemanias se unen formalmente. El país dividido en 1945 vuelve a ser uno.',
        order: 4,
      },
    ],
  })

  console.log(`✓ ${moments.length} momentos creados`)
  console.log(`✓ Eventos de contexto creados`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
