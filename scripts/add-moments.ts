import { PrismaClient, Tier, Era, Category, Confidence, MomentStatus } from '@prisma/client'

const prisma = new PrismaClient()

const newMoments = [
  // ── PREHISTORIA ──
  {
    slug: 'homo-sapiens-primer-arte',
    title: 'El Primer Arte de la Humanidad',
    year: -40000,
    date: 'c. 40.000 a.C.',
    era: Era.PREHISTORIA,
    category: Category.ARTE,
    tier: Tier.MITICO,
    confidence: Confidence.MEDIUM,
    description:
      'En las cuevas de Sulawesi (Indonesia) y Chauvet (Francia), el Homo sapiens deja las primeras representaciones pictóricas conocidas: manos en negativo, animales y escenas de caza. El arte nace. La capacidad de crear símbolos abstractos define definitivamente al ser humano moderno.',
    procedence:
      'Datación por uranio-torio del PNAS (2019): cuevas de Sulawesi, 45.500 años. Cuevas de Chauvet datadas por radiocarbon en 36.000 años. Investigaciones del Max Planck Institute for Evolutionary Anthropology.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Lascaux_painting.jpg/1280px-Lascaux_painting.jpg',
    location: 'Sulawesi, Indonesia / Ardèche, Francia',
    totalCirculation: 3,
    basePrice: 1000000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.science.org/doi/10.1126/science.aaw4296'],
  },

  // ── MUNDO ANTIGUO ──
  {
    slug: 'nacimiento-democracia-atenas',
    title: 'Nace la Democracia en Atenas',
    year: -507,
    date: '508–507 a.C.',
    era: Era.MUNDO_ANTIGUO,
    category: Category.POLITICA,
    tier: Tier.EXCEPCIONAL,
    confidence: Confidence.HIGH,
    description:
      'Clístenes implementa las reformas que crean la primera democracia de la historia: todos los ciudadanos atenienses tienen derecho a voto en la Ekklesia. Inventa el concepto de ciudadanía e igualdad ante la ley. El sistema de gobierno que dominaría el mundo 2.500 años después nace en el Ágora de Atenas.',
    procedence:
      'Fuentes primarias: Heródoto (Historias, V.66-69), Aristóteles (Constitución de Atenas). Inscripciones del Ágora de Atenas excavadas por la Escuela Americana de Estudios Clásicos.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Greek_Vase_Painting.jpg/1280px-Greek_Vase_Painting.jpg',
    location: 'Atenas, Grecia',
    totalCirculation: 10,
    basePrice: 100000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.britannica.com/topic/democracy/Ancient-origins'],
  },
  {
    slug: 'conquistas-alejandro-magno',
    title: 'La Muerte de Alejandro Magno',
    year: -323,
    date: '11 de junio, 323 a.C.',
    era: Era.MUNDO_ANTIGUO,
    category: Category.GUERRA,
    tier: Tier.EXCEPCIONAL,
    confidence: Confidence.HIGH,
    description:
      'Alejandro III de Macedonia muere en Babilonia a los 32 años tras conquistar el mayor imperio del mundo antiguo: desde Grecia hasta el actual Pakistán. Su muerte desencadena las guerras de los Diádocos y la helenización del mundo conocido. Ningún conquistador volvería a cambiar el mapa con tanta velocidad.',
    procedence:
      'Fuentes primarias: Arriano (Anábasis de Alejandro), Plutarco (Vida de Alejandro), Diodoro Sículo. Verificado contra registros babilónicos del British Museum.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/AlexanderTheGreat_Bust.jpg/800px-AlexanderTheGreat_Bust.jpg',
    location: 'Babilonia (actual Irak)',
    totalCirculation: 10,
    basePrice: 80000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.britannica.com/biography/Alexander-the-Great'],
  },

  // ── EDAD MEDIA ──
  {
    slug: 'magna-carta',
    title: 'La Firma de la Magna Carta',
    year: 1215,
    date: '15 de junio, 1215',
    era: Era.EDAD_MEDIA,
    category: Category.POLITICA,
    tier: Tier.EXCEPCIONAL,
    confidence: Confidence.HIGH,
    description:
      'El rey Juan I de Inglaterra firma la Magna Carta en Runnymede bajo presión de los barones rebeldes. Por primera vez en la historia occidental, el poder del monarca queda limitado por ley escrita: ningún hombre libre puede ser encarcelado sin juicio. El germen del Estado de Derecho y los derechos constitucionales modernos.',
    procedence:
      'Cuatro ejemplares originales conservados: British Library (dos), Catedral de Lincoln y Catedral de Salisbury. Autenticados por el British Museum y la British Library.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Magna_Carta_%28British_Library_Cotton_MS_Augustus_II.106%29.jpg/1280px-Magna_Carta_%28British_Library_Cotton_MS_Augustus_II.106%29.jpg',
    location: 'Runnymede, Surrey, Inglaterra',
    totalCirculation: 15,
    basePrice: 60000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.bl.uk/magna-carta'],
  },

  // ── RENACIMIENTO ──
  {
    slug: 'imprenta-gutenberg',
    title: 'Gutenberg Inventa la Imprenta',
    year: 1450,
    date: 'c. 1450',
    era: Era.RENACIMIENTO,
    category: Category.CIENCIA,
    tier: Tier.MITICO,
    confidence: Confidence.MEDIUM,
    description:
      'Johannes Gutenberg perfecciona el sistema de tipos móviles metálicos en Maguncia. La Biblia de Gutenberg (1455) es el primer libro impreso en Europa. La imprenta democratiza el conocimiento, hace posible la Reforma Protestante, la Revolución Científica y la Ilustración. Ningún invento hasta Internet ha transformado más la transmisión del conocimiento.',
    procedence:
      'Primeras menciones documentadas: carta de Enea Silvio Piccolomini (1455). Análisis tipográfico de la Biblia de Gutenberg. Estudios del Gutenberg-Museum de Maguncia.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg/1280px-Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg',
    location: 'Maguncia, Sacro Imperio Romano Germánico (actual Alemania)',
    totalCirculation: 5,
    basePrice: 400000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.britannica.com/biography/Johannes-Gutenberg'],
  },
  {
    slug: 'colon-llega-a-america',
    title: 'Colón Llega a América',
    year: 1492,
    date: '12 de octubre, 1492',
    era: Era.RENACIMIENTO,
    category: Category.EXPLORACION,
    tier: Tier.MITICO,
    confidence: Confidence.HIGH,
    description:
      'Rodrigo de Triana avista tierra desde la Pinta a las 2:00 AM. Cristóbal Colón desembarca en la isla Guanahaní. El encuentro entre el Viejo y el Nuevo Mundo desencadena el mayor intercambio de plantas, animales, enfermedades y culturas de la historia. La globalización comienza aquí.',
    procedence:
      'Diario original de Colón (conservado en transcripción de Bartolomé de las Casas), Archivo General de Indias, Sevilla. Verificado por múltiples fuentes iberoamericanas contemporáneas.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Columbus_Taking_Possession.jpg/1280px-Columbus_Taking_Possession.jpg',
    location: 'Isla Guanahaní (actual Bahamas)',
    totalCirculation: 5,
    basePrice: 400000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.britannica.com/biography/Christopher-Columbus'],
  },

  // ── ERA INDUSTRIAL ──
  {
    slug: 'revolucion-francesa-bastilla',
    title: 'La Toma de la Bastilla',
    year: 1789,
    date: '14 de julio, 1789',
    era: Era.ERA_INDUSTRIAL,
    category: Category.POLITICA,
    tier: Tier.EXCEPCIONAL,
    confidence: Confidence.HIGH,
    description:
      'El pueblo de París asalta la fortaleza-prisión de la Bastilla, símbolo del absolutismo monárquico. El inicio de la Revolución Francesa redefine conceptos como soberanía, ciudadanía y derechos humanos. "Liberté, Égalité, Fraternité" se convierte en el grito político más influyente de la historia moderna.',
    procedence:
      'Actas de la Asamblea Nacional, registros del Archivo Nacional de Francia, crónicas del Journal de Paris (15/07/1789). Testimonios de Jacques Necker y otros contemporáneos.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Prise_de_la_Bastille.jpg/1280px-Prise_de_la_Bastille.jpg',
    location: 'París, Francia',
    totalCirculation: 10,
    basePrice: 80000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.britannica.com/event/storming-of-the-Bastille'],
  },
  {
    slug: 'darwin-el-origen-de-las-especies',
    title: 'Darwin Publica El Origen de las Especies',
    year: 1859,
    date: '24 de noviembre, 1859',
    era: Era.ERA_INDUSTRIAL,
    category: Category.CIENCIA,
    tier: Tier.EXCEPCIONAL,
    confidence: Confidence.HIGH,
    description:
      'Charles Darwin publica "On the Origin of Species". La teoría de la evolución por selección natural explica por primera vez la diversidad de la vida sin recurrir a la intervención divina. El libro más disruptivo de la historia de la ciencia, vendido en su totalidad el primer día de publicación.',
    procedence:
      'Primera edición (John Murray, Londres, 1859) conservada en el Natural History Museum. Correspondencia de Darwin digitalizada por la Darwin Correspondence Project, Cambridge.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Voyage_of_the_Beagle.jpg/800px-Voyage_of_the_Beagle.jpg',
    location: 'Londres, Reino Unido',
    totalCirculation: 15,
    basePrice: 60000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.darwin-online.org.uk/'],
  },
  {
    slug: 'descubrimiento-penicilina',
    title: 'Fleming Descubre la Penicilina',
    year: 1928,
    date: '3 de septiembre, 1928',
    era: Era.ERA_INDUSTRIAL,
    category: Category.CIENCIA,
    tier: Tier.EXCEPCIONAL,
    confidence: Confidence.HIGH,
    description:
      'Alexander Fleming vuelve de vacaciones a su laboratorio en St Mary\'s Hospital y observa que el moho Penicillium notatum ha matado las bacterias de sus cultivos. El descubrimiento accidental del primer antibiótico salvaría más de 200 millones de vidas durante el siglo XX.',
    procedence:
      'Cuadernos de laboratorio de Fleming conservados en el British Library (Add MS 56106-56214). Premio Nobel de Fisiología y Medicina 1945. Publicación original en British Journal of Experimental Pathology (1929).',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Alexander_Fleming.jpg/800px-Alexander_Fleming.jpg',
    location: 'Londres, Reino Unido',
    totalCirculation: 15,
    basePrice: 60000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.nobelprize.org/prizes/medicine/1945/fleming/biographical/'],
  },

  // ── ERA ESPACIAL ──
  {
    slug: 'yuri-gagarin-primer-humano-espacio',
    title: 'Gagarin: El Primer Humano en el Espacio',
    year: 1961,
    date: '12 de abril, 1961',
    era: Era.ERA_ESPACIAL,
    category: Category.CIENCIA,
    tier: Tier.MITICO,
    confidence: Confidence.HIGH,
    description:
      'Yuri Gagarin completa una órbita completa de la Tierra a bordo del Vostok 1 en 108 minutos. "¡Poyekhali!" (¡Vámonos!). El ser humano abandona por primera vez los límites de su planeta. La carrera espacial se acelera y Kennedy anuncia el objetivo de llegar a la Luna antes de que acabe la década.',
    procedence:
      'Registros del programa espacial soviético (parcialmente desclasificados). Transcripción completa de comunicaciones tierra-nave. Verificado por la Federación Aeronáutica Internacional (FAI).',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Yuri_Gagarin_in_Sweden%2C_1964.jpg/800px-Yuri_Gagarin_in_Sweden%2C_1964.jpg',
    location: 'Órbita terrestre / Baikonur, URSS',
    totalCirculation: 7,
    basePrice: 200000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.britannica.com/biography/Yuri-Gagarin'],
  },
  {
    slug: 'disolucion-union-sovietica',
    title: 'La Disolución de la Unión Soviética',
    year: 1991,
    date: '25 de diciembre, 1991',
    era: Era.ERA_ESPACIAL,
    category: Category.POLITICA,
    tier: Tier.EXCEPCIONAL,
    confidence: Confidence.HIGH,
    description:
      'Mijail Gorbachov dimite como presidente de la URSS. A las 19:32 hora de Moscú, la bandera roja con la hoz y el martillo es arriada del Kremlin y reemplazada por la tricolor rusa. El mayor estado del mundo, heredero de setenta años de comunismo soviético, cesa de existir. La Guerra Fría termina definitivamente.',
    procedence:
      'Declaración de Alma-Ata (21/12/1991), discurso de dimisión de Gorbachov (25/12/1991), retransmitido en directo por CNN y TASS. Actas del Soviet Supremo.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Gorbachev_at_the_White_House%2C_1987.jpg/800px-Gorbachev_at_the_White_House%2C_1987.jpg',
    location: 'Moscú, Rusia',
    totalCirculation: 10,
    basePrice: 80000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.britannica.com/event/the-dissolution-of-the-Soviet-Union'],
  },
  {
    slug: 'mandela-presidente-sudafrica',
    title: 'Mandela Jura como Presidente de Sudáfrica',
    year: 1994,
    date: '10 de mayo, 1994',
    era: Era.ERA_ESPACIAL,
    category: Category.POLITICA,
    tier: Tier.RARO,
    confidence: Confidence.HIGH,
    description:
      'Nelson Mandela jura el cargo como primer presidente democráticamente elegido de Sudáfrica ante 4.000 invitados y mil millones de espectadores. Tras 27 años en prisión, el símbolo de la resistencia al apartheid lidera la transición hacia la democracia racial. La reconciliación como modelo político global.',
    procedence:
      'Transmisión en directo de la SABC y CNN. Registros oficiales del Parlamento de Sudáfrica. Archivo Nelson Mandela Foundation, Johannesburgo.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Nelson_Mandela-2008_%28edit%29.jpg/800px-Nelson_Mandela-2008_%28edit%29.jpg',
    location: 'Pretoria, Sudáfrica',
    totalCirculation: 20,
    basePrice: 25000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.britannica.com/biography/Nelson-Mandela'],
  },

  // ── ERA DIGITAL ──
  {
    slug: 'lanzamiento-world-wide-web',
    title: 'Tim Berners-Lee Lanza la World Wide Web',
    year: 1991,
    date: '6 de agosto, 1991',
    era: Era.ERA_DIGITAL,
    category: Category.CIENCIA,
    tier: Tier.MITICO,
    confidence: Confidence.HIGH,
    description:
      'Tim Berners-Lee publica el primer sitio web de la historia en info.cern.ch. La World Wide Web, que había propuesto en 1989 como sistema de gestión de información del CERN, se hace pública. La infraestructura que conectaría a toda la humanidad nace en este momento. El mundo antes y después de Internet.',
    procedence:
      'Primer sitio web conservado y restaurado por el CERN (info.cern.ch). Propuesta original "Information Management: A Proposal" (marzo 1989) archivada en el CERN. Verificado por la W3C.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Tim_Berners-Lee.jpg/800px-Tim_Berners-Lee.jpg',
    location: 'CERN, Ginebra, Suiza',
    totalCirculation: 7,
    basePrice: 300000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://home.cern/science/computing/birth-web'],
  },
  {
    slug: 'primer-iphone',
    title: 'Steve Jobs Presenta el iPhone',
    year: 2007,
    date: '9 de enero, 2007',
    era: Era.ERA_DIGITAL,
    category: Category.CIENCIA,
    tier: Tier.EXCEPCIONAL,
    confidence: Confidence.HIGH,
    description:
      '"Every once in a while a revolutionary product comes along that changes everything." Steve Jobs presenta en el Macworld Conference un dispositivo que combina teléfono, iPod e internet. El smartphone redefine la comunicación humana, crea la economía de apps y conecta a más de 4.000 millones de personas en sus bolsillos.',
    procedence:
      'Keynote completa archivada en Apple.com y YouTube (verificada). Registros de USPTO para las patentes del iPhone. Cobertura de TechCrunch, The New York Times y Wall Street Journal (09/01/2007).',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/IPhone_1st_Gen.svg/800px-IPhone_1st_Gen.svg.png',
    location: 'Moscone Center, San Francisco, California',
    totalCirculation: 10,
    basePrice: 100000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/'],
  },
  {
    slug: 'bitcoin-genesis-block',
    title: 'El Bloque Génesis de Bitcoin',
    year: 2009,
    date: '3 de enero, 2009',
    era: Era.ERA_DIGITAL,
    category: Category.CIENCIA,
    tier: Tier.RARO,
    confidence: Confidence.HIGH,
    description:
      'Satoshi Nakamoto mina el primer bloque de Bitcoin. El mensaje incrustado —"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"— es un manifiesto. Nace la primera criptomoneda: dinero digital descentralizado, sin intermediarios. El sistema financiero convencional tiene un competidor por primera vez en su historia.',
    procedence:
      'Bloque génesis verificable en la blockchain de Bitcoin (hash: 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f). White paper original: Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png',
    location: 'Desconocido (red distribuida)',
    totalCirculation: 21,
    basePrice: 30000,
    status: MomentStatus.IN_VAULT,
    sources: ['https://bitcoin.org/bitcoin.pdf'],
  },
]

async function main() {
  console.log(`Añadiendo ${newMoments.length} momentos históricos...`)

  let added = 0
  let skipped = 0

  for (const moment of newMoments) {
    const existing = await prisma.moment.findUnique({ where: { slug: moment.slug } })
    if (existing) {
      console.log(`  ↷ Ya existe: ${moment.title}`)
      skipped++
      continue
    }
    await prisma.moment.create({ data: moment })
    console.log(`  ✓ Creado: ${moment.title}`)
    added++
  }

  console.log(`\nResumen: ${added} añadidos, ${skipped} omitidos`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
