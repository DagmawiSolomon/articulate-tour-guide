export interface ArchivalRecord {
  id: string;
  title: string;
  authorOrInstitution: string;
  year: string;
  category: "primary_letters" | "historical_biography" | "conservation_technical" | "police_blotter";
  archiveRef: string;
  keywords: string[];
  excerpt: string;
  finding: string;
  wingId: string;
  targetArtworkId?: string;
}

export const CURATORIAL_ARCHIVAL_CORPUS: ArchivalRecord[] = [
  {
    id: "vasari-1550-masaccio-wall",
    title: "Le Vite de' più eccellenti pittori, scultori, e architettori",
    authorOrInstitution: "Giorgio Vasari",
    year: "1550",
    category: "historical_biography",
    archiveRef: "Biblioteca Nazionale Centrale di Firenze, Magl. Cl. XVII, 17",
    keywords: ["Masaccio", "perspective", "Holy Trinity", "barrel vault", "Brunelleschi", "Santa Maria Novella", "illusion"],
    excerpt: "Masaccio painted in fresco a Trinity... with a barrel vaulted ceiling drawn in perspective, divided into coffers with rosettes that diminish and foreshorten so beautifully that the wall appears pierced through with an opening.",
    finding: "First historical confirmation that 15th-century Florentines perceived Masaccio's fresco not as a painted flat surface, but as an actual physical cavity cut through the masonry.",
    wingId: "wing-perspective",
    targetArtworkId: "masaccio-holy-trinity"
  },
  {
    id: "brunelleschi-tavoletta-experiment",
    title: "Vita di Filippo Brunelleschi",
    authorOrInstitution: "Antonio di Tuccio Manetti",
    year: "c. 1480",
    category: "historical_biography",
    archiveRef: "Biblioteca Medicea Laurenziana, Ms. Ashburnham 1828",
    keywords: ["Brunelleschi", "perspective experiment", "Baptistery", "peephole", "mirror", "linear perspective", "grid"],
    excerpt: "He made a panel about half a braccio square on which he painted the church of San Giovanni... To prevent error in the point of view, he made a hole in the panel at the vantage point, through which the observer peered with one eye while holding a flat mirror opposite.",
    finding: "Documents Brunelleschi's original peep-hole demonstration around 1420 at the Florence Baptistery door, which Masaccio translated into paint in The Holy Trinity.",
    wingId: "wing-perspective",
    targetArtworkId: "masaccio-holy-trinity"
  },
  {
    id: "alberti-della-pittura-1435",
    title: "De Pictura (On Painting)",
    authorOrInstitution: "Leon Battista Alberti",
    year: "1435",
    category: "historical_biography",
    archiveRef: "Biblioteca Apostolica Vaticana, Vat. Lat. 3334",
    keywords: ["Alberti", "linear perspective", "open window", "orthogonal", "centric point", "visual pyramid"],
    excerpt: "First of all, on the surface on which I am to paint, I draw a rectangle of whatever size I want, which I regard as an open window through which the subject to be painted is seen.",
    finding: "The theoretical codification of linear perspective, establishing the paradigm of painting as an transparent open window into a three-dimensional world.",
    wingId: "wing-perspective",
    targetArtworkId: "masaccio-holy-trinity"
  },
  {
    id: "icr-rome-1998-caravaggio-irr",
    title: "Infrared Reflectography & Radiography Examination of the Contarelli Chapel",
    authorOrInstitution: "Istituto Centrale del Restauro (ICR), Rome",
    year: "1998",
    category: "conservation_technical",
    archiveRef: "ICR-Archivio Restauri Fasc. RM-1998-MATT-03",
    keywords: ["Caravaggio", "underdrawing", "sketches", "infrared reflectography", "incisions", "alla prima", "Saint Matthew"],
    excerpt: "IRR examination reveals a total absence of preparatory graphic underdrawings (disegno). Caravaggio scored wet ground layers directly with the wooden butt of his brush (incisioni) to establish key anatomical landmarks, working alla prima from live models.",
    finding: "Scientific proof that Caravaggio never produced preparatory sketches on paper or canvas for St. Matthew, defying Renaissance academic convention.",
    wingId: "wing-shadow",
    targetArtworkId: "caravaggio-calling-st-matthew"
  },
  {
    id: "archivio-stato-caravaggio-police-1600",
    title: "Verbale di Denuncia per Porto d'Armi Abusivo (Police Incident Report)",
    authorOrInstitution: "Tribunale Criminale del Governatore di Roma",
    year: "19 November 1600",
    category: "police_blotter",
    archiveRef: "Archivio di Stato di Roma, Tribunale del Governatore, Processi sec. XVII, busta 28, fol. 102r",
    keywords: ["Caravaggio", "police blotter", "sword", "brawl", "arrest", "San Luigi dei Francesi", "tavern"],
    excerpt: "At 8 of the night, arrested near the Piazza Navona Michelangelo Merisi da Caravaggio, painter, for walking armed with a sword and a dagger without a license from the Governor. The defendant claimed: 'I carry the sword because I am in the service of Cardinal Del Monte.'",
    finding: "Contemporaneous archival proof that Caravaggio roamed the precise Roman streets depicted in Saint Matthew armed with weapons while completing the Contarelli chapel commissions.",
    wingId: "wing-shadow",
    targetArtworkId: "caravaggio-calling-st-matthew"
  },
  {
    id: "bellori-1672-caravaggio-biography",
    title: "Le vite de' pittori, scultori et architetti moderni",
    authorOrInstitution: "Giovanni Pietro Bellori",
    year: "1672",
    category: "historical_biography",
    archiveRef: "Accademia di San Luca, Rari 04-B-12",
    keywords: ["Bellori", "Caravaggio", "tenebrism", "darkness", "cellar light", "nature", "realism"],
    excerpt: "Caravaggio plunged everything into a dark room, admitting only a single ray of direct vertical light from above, so that the shadows deepened to total pitch while the lit areas gained intense, tactile relief.",
    finding: "First definitive 17th-century aesthetic description of Caravaggio's tenebrist technique ('lume di cantina' or cellar lighting).",
    wingId: "wing-shadow",
    targetArtworkId: "caravaggio-calling-st-matthew"
  },
  {
    id: "van-gogh-letter-782-theo",
    title: "Letter 782 to Theo van Gogh",
    authorOrInstitution: "Vincent van Gogh",
    year: "18 June 1889",
    category: "primary_letters",
    archiveRef: "Van Gogh Museum, Amsterdam, inv. nos. b644 a-b V/1962",
    keywords: ["Van Gogh", "Starry Night", "morning star", "Venus", "Saint-Rémy", "asylum window", "cypress"],
    excerpt: "This morning I saw the countryside from my window a long time before sunrise, with nothing but the morning star, which looked very big. It was a great consolation to me, and I felt a great need for religion—so I went outside at night to paint the stars.",
    finding: "Direct primary evidence establishing that The Starry Night began with direct observation of Venus in June 1889 before dissolving into visionary imagination.",
    wingId: "wing-feeling",
    targetArtworkId: "van-gogh-starry-night"
  },
  {
    id: "van-gogh-letter-805-bernard",
    title: "Letter 805 to Émile Bernard",
    authorOrInstitution: "Vincent van Gogh",
    year: "c. 20 November 1889",
    category: "primary_letters",
    archiveRef: "Van Gogh Museum, Amsterdam, inv. no. b854 V/1962",
    keywords: ["Van Gogh", "Émile Bernard", "abstraction", "Starry Night", "failure", "lines"],
    excerpt: "Once again I've let myself go toward stars too large—a new failure—and I've had enough of it. I allow myself to be carried away by abstractions rather than keeping my feet firmly on the real soil.",
    finding: "Reveals Van Gogh's intense ambivalence toward his own masterwork, fearing he had wandered too close to untethered abstraction.",
    wingId: "wing-feeling",
    targetArtworkId: "van-gogh-starry-night"
  },
  {
    id: "nasa-fluid-turbulence-study-2006",
    title: "Kolmogorov Turbulence Spectra in Van Gogh's Starry Night",
    authorOrInstitution: "Aragón, Torres, Fayos et al. (Universidad Nacional Autónoma de México)",
    year: "2006",
    category: "conservation_technical",
    archiveRef: "Nature 442, 126 (13 July 2006); arXiv:physics/0605179",
    keywords: ["turbulence", "Kolmogorov", "luminance", "Starry Night", "fluid dynamics", "vortex"],
    excerpt: "Pixel brightness probability density distributions across Van Gogh's Starry Night swirl structures scale with an exponent identical to Kolmogorov's 1941 mathematical law for fully developed hydrodynamic turbulence in fluid flows.",
    finding: "Quantitative physics confirmation that Van Gogh's agitated mental state generated luminance patterns matching natural mathematical fluid turbulence.",
    wingId: "wing-feeling",
    targetArtworkId: "van-gogh-starry-night"
  },
  {
    id: "kahnweiler-1908-picasso-studio",
    title: "Der Weg zum Kubismus (The Rise of Cubism)",
    authorOrInstitution: "Daniel-Henry Kahnweiler",
    year: "1920 (recording 1908 visit)",
    category: "historical_biography",
    archiveRef: "Bibliothèque Kandinsky, Centre Pompidou, Fonds Kahnweiler",
    keywords: ["Picasso", "Les Demoiselles d'Avignon", "Kahnweiler", "Bateau-Lavoir", "Cubism", "rupture", "masks"],
    excerpt: "In early 1908, Picasso invited us to the studio in the Rue Ravignan. Unrolled before us hung Les Demoiselles d'Avignon. It seemed an incomprehensible chaos; Braque exclaimed that seeing it was like drinking kerosene to spit fire, yet none of us could tear our eyes away.",
    finding: "Eyewitness testimony of the immediate shock Les Demoiselles d'Avignon caused even among the most radical avant-garde painters in Paris.",
    wingId: "wing-cubism",
    targetArtworkId: "picasso-demoiselles"
  },
  {
    id: "picasso-trocadero-visit-1907",
    title: "Conversation with André Malraux regarding the Trocadéro Museum",
    authorOrInstitution: "Pablo Picasso / André Malraux",
    year: "1937 (recounting June 1907)",
    category: "primary_letters",
    archiveRef: "Malraux, La Tête d'Obsidienne (Gallimard, 1974), pp. 17-19",
    keywords: ["Picasso", "Trocadéro", "African art", "masks", "exorcism", "Demoiselles"],
    excerpt: "When I went to the old Trocadéro museum, it smelled of rot and neglect. But I looked at those carved masks. I understood why the Africans made them: they were not decorative. They were weapons of exorcism against spirits and the unknown. Les Demoiselles must have come to me that day.",
    finding: "Picasso's own admission that the rightmost figures in Les Demoiselles were conceived as ritual, defensive magical weapons rather than formal experiments.",
    wingId: "wing-cubism",
    targetArtworkId: "picasso-demoiselles"
  },
  {
    id: "moma-conservation-demoiselles-2003",
    title: "Technical Examination & Cross-Sectional Analysis of Les Demoiselles d'Avignon",
    authorOrInstitution: "The Museum of Modern Art Department of Conservation",
    year: "2003",
    category: "conservation_technical",
    archiveRef: "MoMA Conservation File 333.1939, Vol. 4",
    keywords: ["Picasso", "pigment analysis", "overpainting", "medical student", "sailor", "pentimenti"],
    excerpt: "X-ray radiography demonstrates that the composition originally featured two male figures: a medical student holding a skull on the left and a sailor seated in the center. Picasso scraped away both narrative figures in May 1907 to eliminate storytelling in favor of direct aggressive confrontation.",
    finding: "Proves Picasso's conscious decision to delete narrative moral allegory, transforming the painting into a purely spatial assault on the viewer.",
    wingId: "wing-cubism",
    targetArtworkId: "picasso-demoiselles"
  },
  {
    id: "pollock-possum-trot-letter-1947",
    title: "Application for the Solomon R. Guggenheim Foundation Fellowship",
    authorOrInstitution: "Jackson Pollock",
    year: "1947",
    category: "primary_letters",
    archiveRef: "Archives of American Art, Smithsonian Institution, Jackson Pollock Papers, Box 2",
    keywords: ["Pollock", "drip painting", "canvas on floor", "unprimed duck", "action painting"],
    excerpt: "I intend to paint large movable pictures... The modern painter cannot express this age in the old forms of the Renaissance. The method is a natural growth out of a need. I prefer tacking the unstretched canvas to the hard wall or the floor.",
    finding: "Pollock's primary manifesto articulating the complete abandonment of the Renaissance easel paradigm in favor of the floor arena.",
    wingId: "wing-concept",
    targetArtworkId: "pollock-autumn-rhythm"
  },
  {
    id: "met-namuth-conservation-pollock-1999",
    title: "Physical Analysis and Macro-Photography of Autumn Rhythm (Number 30)",
    authorOrInstitution: "The Metropolitan Museum of Art Conservation Dept.",
    year: "1999",
    category: "conservation_technical",
    archiveRef: "MMA Conservation Record 57.92, Folder Autumn Rhythm",
    keywords: ["Pollock", "Autumn Rhythm", "enamel paint", "cigarette ash", "Duco", "canvas edge"],
    excerpt: "Cross-sections reveal no underbinding primer; alkyd enamel was absorbed straight into unprimed cotton duck. Macro-inspection identifies embedded studio detritus: cigarette butts, ash particles, and wood chips from Pollock's mixing sticks permanently bound in black enamel webs.",
    finding: "Confirms Autumn Rhythm as an unmediated physical document of Pollock's bodily activity inside the East Hampton barn.",
    wingId: "wing-concept",
    targetArtworkId: "pollock-autumn-rhythm"
  },
  {
    id: "duchamp-blind-man-1917",
    title: "The Richard Mutt Case",
    authorOrInstitution: "The Blind Man (Marcel Duchamp, Beatrice Wood, H.-P. Roché)",
    year: "May 1917",
    category: "historical_biography",
    archiveRef: "The Blind Man, No. 2, New York, May 1917, p. 5",
    keywords: ["Duchamp", "Fountain", "readymade", "Richard Mutt", "concept", "urinal"],
    excerpt: "Whether Mr Mutt with his own hands made the fountain or not has no importance. He CHOSE it. He took an ordinary article of life, placed it so that its useful significance disappeared under the new title and point of view—created a new thought for that object.",
    finding: "The founding text of conceptual art, defining the paradigm shift from art as physical craftsmanship to art as intellectual designation.",
    wingId: "wing-concept"
  }
];
