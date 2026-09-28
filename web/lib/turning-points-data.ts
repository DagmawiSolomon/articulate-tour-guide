export interface TurningPointArtwork {
  id: string;
  title: string;
  originalTitle: string;
  artist: string;
  artistLifespan: string;
  year: string;
  locationCreated: string;
  medium: string;
  dimensions: string;
  accession: string;
  curatorialQuote: string;
  summary: string;
  imageSrc: string;
  wingId: string;
  historicalPivot: string;
}

export interface ExhibitionWing {
  id: "wing-perspective" | "wing-shadow" | "wing-feeling" | "wing-cubism" | "wing-concept";
  number: number;
  title: string;
  subtitle: string;
  period: string;
  yearSpan: string;
  anchorArtworkId: string;
  historicalPivot: string;
  accentColor: string;
  roomName: string;
  coordinates: { x: number; y: number };
  routeId: string;
  walkingTime: string;
  distance: string;
  previewDescription: string;
}

export interface CuratedComparisonPair {
  id: string;
  title: string;
  subtitle: string;
  thesis: string;
  curatorialTakeaway: string;
  leftArtwork: {
    title: string;
    artist: string;
    year: string;
    school: string;
    imageSrc: string;
    traits: string[];
    dimensions: string;
    medium: string;
  };
  rightArtwork: {
    title: string;
    artist: string;
    year: string;
    school: string;
    imageSrc: string;
    traits: string[];
    dimensions: string;
    medium: string;
  };
}

export const TURNING_POINTS_WINGS: ExhibitionWing[] = [
  {
    id: "wing-perspective",
    number: 1,
    title: "The Perspective Leap",
    subtitle: "Invention of Mathematical Illusionism",
    period: "Early Renaissance",
    yearSpan: "1420–1480",
    anchorArtworkId: "masaccio-holy-trinity",
    historicalPivot: "The invention of mathematical single-point linear perspective by Brunelleschi, codified on fresco by Masaccio.",
    accentColor: "hsl(var(--amber-warm, 38 72% 52%))",
    roomName: "Pavilion 1: Florence & The Grid",
    coordinates: { x: 260, y: 440 },
    routeId: "perspective",
    walkingTime: "~30 sec",
    distance: "25 m",
    previewDescription: "Before 1427, paintings were flat devotional icons. Masaccio broke the chapel wall with a mathematical barrel vault."
  },
  {
    id: "wing-shadow",
    number: 2,
    title: "The Theatre of Shadow",
    subtitle: "Tenebrism & The Violent Sacred",
    period: "Italian Baroque",
    yearSpan: "1590–1640",
    anchorArtworkId: "caravaggio-calling-st-matthew",
    historicalPivot: "Caravaggio replaced ideal renaissance grace with visceral, street-level tavern realism and dramatic raking spotlight (tenebrism).",
    accentColor: "hsl(var(--amber-rich, 28 85% 48%))",
    roomName: "Pavilion 2: Rome & The Darkened Tavern",
    coordinates: { x: 220, y: 220 },
    routeId: "shadow",
    walkingTime: "~45 sec",
    distance: "35 m",
    previewDescription: "Divine calling in a tavern of gamblers and tax collectors, lit by an unforgiving beam of direct daylight."
  },
  {
    id: "wing-feeling",
    number: 3,
    title: "The Sky of Pure Feeling",
    subtitle: "Expressionism Beyond the Eye",
    period: "Post-Impressionism",
    yearSpan: "1880–1905",
    anchorArtworkId: "van-gogh-starry-night",
    historicalPivot: "Van Gogh rejected passive photographic observation, using color, vibration, and rhythmic impasto to project inner emotional turbulence.",
    accentColor: "hsl(var(--sky-azure, 210 88% 56%))",
    roomName: "Pavilion 3: Saint-Rémy & Celestial Vortices",
    coordinates: { x: 600, y: 150 },
    routeId: "feeling",
    walkingTime: "~1 min",
    distance: "50 m",
    previewDescription: "Painted from an asylum window: stars churn in cosmic sympathy with human suffering and ecstasy."
  },
  {
    id: "wing-cubism",
    number: 4,
    title: "The Shattered Mirror",
    subtitle: "Multiple Simultaneous Realities",
    period: "Early Modern & Cubism",
    yearSpan: "1905–1920",
    anchorArtworkId: "picasso-demoiselles",
    historicalPivot: "Picasso shattered 500 years of unified Renaissance perspective, compressing multiple angles and Iberian masks into serrated planes.",
    accentColor: "hsl(var(--rust-crimson, 12 78% 54%))",
    roomName: "Pavilion 4: Montmartre & The Spatial Rupture",
    coordinates: { x: 980, y: 220 },
    routeId: "cubism",
    walkingTime: "~45 sec",
    distance: "40 m",
    previewDescription: "Five figures that shocked even Matisse and Braque, dismantling classical beauty into aggressive geometric shards."
  },
  {
    id: "wing-concept",
    number: 5,
    title: "Beyond the Frame",
    subtitle: "Art as Physical Gesture & Concept",
    period: "Post-War Avant-Garde",
    yearSpan: "1917–1955",
    anchorArtworkId: "pollock-autumn-rhythm",
    historicalPivot: "Duchamp declared the idea is the art; Pollock abandoned easel, brush, and representation to record the kinetic trace of the human body in space.",
    accentColor: "hsl(var(--sage-olive, 142 55% 42%))",
    roomName: "Pavilion 5: The Studio Floor & The Idea",
    coordinates: { x: 940, y: 440 },
    routeId: "concept",
    walkingTime: "~1 min 15 sec",
    distance: "65 m",
    previewDescription: "Paint flung from air onto unstretched cotton duck on the barn floor: the painting is an arena, not an illustration."
  }
];

export const TURNING_POINTS_ARTWORKS: Record<string, TurningPointArtwork> = {
  "masaccio-holy-trinity": {
    id: "masaccio-holy-trinity",
    title: "The Holy Trinity",
    originalTitle: "Santa Trinità",
    artist: "Masaccio (Tommaso di Ser Giovanni di Simone)",
    artistLifespan: "Italian, 1401–1428",
    year: "c. 1427",
    locationCreated: "Church of Santa Maria Novella, Florence, Italy",
    medium: "Fresco on plaster",
    dimensions: "667 cm × 317 cm (262.6 in × 124.8 in)",
    accession: "In situ, Santa Maria Novella, Florence",
    curatorialQuote:
      "\"What I once was, you are now; what I am now, you shall be.\" — Memento Mori inscription upon the tomb",
    summary:
      "Regarded as the foundational fresco of Renaissance humanism. Masaccio applied Filippo Brunelleschi's mathematical laws of linear perspective to paint a coffered barrel vault so convincing that contemporaries believed the stone wall had been carved away.",
    imageSrc: "/artworks/masaccio-holy-trinity.jpg",
    wingId: "wing-perspective",
    historicalPivot: "The birth of single-point linear perspective in painting. The observer's eye is locked into an exact geometric relationship with the sacred space.",
  },
  "caravaggio-calling-st-matthew": {
    id: "caravaggio-calling-st-matthew",
    title: "The Calling of Saint Matthew",
    originalTitle: "Vocazione di San Matteo",
    artist: "Michelangelo Merisi da Caravaggio",
    artistLifespan: "Italian, 1571–1610",
    year: "1599–1600",
    locationCreated: "Contarelli Chapel, San Luigi dei Francesi, Rome",
    medium: "Oil on canvas",
    dimensions: "322 cm × 340 cm (127 in × 134 in)",
    accession: "Contarelli Chapel, Rome (Commissioned 1599)",
    curatorialQuote:
      "\"Caravaggio did not look at antique statues; he took his models directly from the sun-drenched alleys and darkened taverns of Rome.\" — Giovanni Pietro Bellori, 1672",
    summary:
      "Caravaggio shattered Late Mannerist convention by setting Christ's divine summons not in a celestial cloud, but in a shadowy Roman customs house where men in doublet and feathers count coins.",
    imageSrc: "/artworks/caravaggio-calling-st-matthew.jpg",
    wingId: "wing-shadow",
    historicalPivot: "Tenebrism as narrative engine. Divine revelation is not a halo of light around a saint, but a ruthless physical beam piercing everyday corruption.",
  },
  "van-gogh-starry-night": {
    id: "van-gogh-starry-night",
    title: "The Starry Night",
    originalTitle: "La Nuit étoilée",
    artist: "Vincent van Gogh",
    artistLifespan: "Dutch, 1853–1890",
    year: "June 1889",
    locationCreated: "Saint-Paul-de-Mausole Asylum, Saint-Rémy-de-Provence, France",
    medium: "Oil on canvas",
    dimensions: "73.7 cm × 92.1 cm (29.0 in × 36.3 in)",
    accession: "Acquired through the Lillie P. Bliss Bequest (1941), MoMA New York",
    curatorialQuote:
      "\"Be clearly aware of the stars and infinity on high. Then life seems almost enchanted after all.\" — Letter 642 to Theo",
    summary:
      "Painted during Van Gogh's convalescence at Saint-Rémy, this masterwork represents an unprecedented departure from direct observation into psychological expressionism, using dynamic impasto spirals to evoke cosmic vitalism.",
    imageSrc: "/artworks/van-gogh-starry-night.jpg",
    wingId: "wing-feeling",
    historicalPivot: "The turn inward: art ceases to record optical appearance and becomes the direct conduit of psychological and cosmic emotion.",
  },
  "picasso-demoiselles": {
    id: "picasso-demoiselles",
    title: "Les Demoiselles d'Avignon",
    originalTitle: "Le Bordel d'Avignon",
    artist: "Pablo Picasso",
    artistLifespan: "Spanish, 1881–1973",
    year: "June–July 1907",
    locationCreated: "Bateau-Lavoir studio, Montmartre, Paris",
    medium: "Oil on canvas",
    dimensions: "243.9 cm × 233.7 cm (96 in × 92 in)",
    accession: "Acquired through the Lillie P. Bliss Bequest (1939), MoMA New York",
    curatorialQuote:
      "\"It was as if someone were drinking kerosene in order to spit fire.\" — Georges Braque upon first seeing the painting in Picasso's studio, 1907",
    summary:
      "A watershed rupture in 20th-century culture. Picasso dismantled the academic female nude into an explosive confrontation of geometric planes, Iberian primitive heads, and African ritual masks, initiating the trajectory toward Cubism.",
    imageSrc: "/artworks/picasso-demoiselles.jpg",
    wingId: "wing-cubism",
    historicalPivot: "The total destruction of single-point Renaissance perspective. Space is no longer a vacuum containing objects, but a solid crystal smashed into shards.",
  },
  "pollock-autumn-rhythm": {
    id: "pollock-autumn-rhythm",
    title: "Autumn Rhythm (Number 30)",
    originalTitle: "Number 30, 1950",
    artist: "Jackson Pollock",
    artistLifespan: "American, 1912–1956",
    year: "October 1950",
    locationCreated: "Springs studio barn, East Hampton, New York",
    medium: "Enamel and commercial paint on unprimed canvas",
    dimensions: "266.7 cm × 525.8 cm (105 in × 207 in)",
    accession: "The Metropolitan Museum of Art, George A. Hearn Fund (1957)",
    curatorialQuote:
      "\"On the floor I am more at ease. I feel nearer, more a part of the painting, since this way I can walk around it, work from the four sides and literally be in the painting.\" — Jackson Pollock, 1947",
    summary:
      "A monument of Abstract Expressionism and Action Painting. Spanning over seventeen feet, Pollock abandoned easel and brushes entirely, rhythmically drizzling industrial Duco enamel onto unprimed canvas with sticks, trowels, and basting syringes.",
    imageSrc: "/artworks/pollock-autumn-rhythm.jpg",
    wingId: "wing-concept",
    historicalPivot: "The canvas transformed from an illusionistic window into an arena of action. Art is no longer a representation of an object, but the physical record of bodily event.",
  },
  "duchamp-fountain": {
    id: "duchamp-fountain",
    title: "Fountain",
    originalTitle: "Fontaine",
    artist: "Marcel Duchamp",
    artistLifespan: "French-American, 1887–1968",
    year: "1917",
    locationCreated: "New York City, United States",
    medium: "Glazed ceramic urinal inverted on pedestal with black enamel paint",
    dimensions: "36 cm × 48 cm × 61 cm (14.2 in × 18.9 in × 24.0 in)",
    accession: "Original lost; authorized edition replica (1964), Tate Modern & MoMA",
    curatorialQuote:
      "\"Whether Mr Mutt with his own hands made the fountain or not has no importance. He CHOSE it. He took an ordinary article of life, placed it so that its useful significance disappeared under the new title and point of view — created a new thought for that object.\" — The Blind Man, May 1917",
    summary:
      "The definitive conceptual watershed of 20th-century art. Submitted to the 1917 Society of Independent Artists under the pseudonym 'R. Mutt 1917', Duchamp severed artistic value from manual craft, decreeing that the artist's intellectual choice is itself the creation.",
    imageSrc: "/artworks/duchamp-fountain.jpg",
    wingId: "wing-concept",
    historicalPivot: "The birth of Conceptual Art. The artwork transforms from an object of physical craft into an intellectual provocation and test of institutional framing.",
  }
};

export const EPOCH_COMPARISONS: Record<string, CuratedComparisonPair> = {
  "comparison-perspective": {
    id: "comparison-perspective",
    title: "Medieval Icon vs. Renaissance Depth",
    subtitle: "The 150-Year Transformation of Picture Space",
    thesis: "How Western painting transitioned from an object of ritual worship in symbolic flat space to an optical window into human reality.",
    curatorialTakeaway: "Cimabue's angels stack vertically to communicate spiritual rank; Masaccio's figures exist within a mathematically calculated metric volume governed by human optics.",
    leftArtwork: {
      title: "Maestà (Madonna Enthroned)",
      artist: "Cimabue (Cenni di Pepo)",
      year: "c. 1280",
      school: "Late Italo-Byzantine / Proto-Renaissance",
      imageSrc: "/artworks/cimabue-maesta.jpg",
      traits: [
        "Gold leaf ground denoting timeless heavenly atmosphere",
        "Hieratic scale: Mary dwarfs attendant angels by virtue of divine status",
        "Stacked vertical arrangement rather than receding ground plane",
        "Linear golden striations (agemina) depicting drapery folds"
      ],
      dimensions: "385 cm × 223 cm",
      medium: "Tempera and gold on wood panel"
    },
    rightArtwork: {
      title: "The Holy Trinity",
      artist: "Masaccio",
      year: "1427",
      school: "Early Florentine Renaissance",
      imageSrc: "/artworks/masaccio-holy-trinity.jpg",
      traits: [
        "Rigorous single-point linear perspective with vanishing point at human eye level",
        "Coffered Roman triumphal arch modeled on Brunelleschi's architecture",
        "Consistent directional light source casting real cast shadows",
        "Secular patrons kneel outside the sacred threshold in empirical space"
      ],
      dimensions: "667 cm × 317 cm",
      medium: "Fresco on plaster"
    }
  },
  "comparison-cubism": {
    id: "comparison-cubism",
    title: "Academic Sensuality vs. Cubist Fracture",
    subtitle: "The Destruction of the Classical Nude",
    thesis: "A century apart: from the neoclassical seduction of continuous contour to the violent spatial deconstruction of female form.",
    curatorialTakeaway: "Ingres lengthened vertebrae for anatomical elegance; Picasso smashed anatomy entirely into faceted, multi-angle facets to represent the psychological tension of the gaze.",
    leftArtwork: {
      title: "La Grande Odalisque",
      artist: "Jean-Auguste-Dominique Ingres",
      year: "1814",
      school: "French Neoclassicism / Orientalism",
      imageSrc: "/artworks/ingres-grande-odalisque.jpg",
      traits: [
        "Continuous unbroken sinuous contour lines without visible brushstrokes",
        "Intentional anatomical distortion (three extra vertebrae) to enhance fluid grace",
        "Sensual tactile textures: velvet, peacock feather fan, satin, and silk",
        "Single, tranquil theatrical viewpoint bathed in soft diffused studio light"
      ],
      dimensions: "91 cm × 162 cm",
      medium: "Oil on canvas"
    },
    rightArtwork: {
      title: "Les Demoiselles d'Avignon",
      artist: "Pablo Picasso",
      year: "1907",
      school: "Proto-Cubism",
      imageSrc: "/artworks/picasso-demoiselles.jpg",
      traits: [
        "Serrated, angular anatomy broken into flat intersecting geometric planes",
        "African and Iberian ritual mask faces confronting spectator with overt hostility",
        "Multiple simultaneous viewpoints: back and face seen at the same instant",
        "Spatial compression: background drapery and flesh are made of the same hard shards"
      ],
      dimensions: "243.9 cm × 233.7 cm",
      medium: "Oil on canvas"
    }
  }
};
