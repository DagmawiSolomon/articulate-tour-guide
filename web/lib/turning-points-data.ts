import type { DetailHotspot } from "./demo-tour-data";

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
  hotspots: DetailHotspot[];
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
    imageSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Masaccio_trinity.jpg/1024px-Masaccio_trinity.jpg",
    wingId: "wing-perspective",
    historicalPivot: "The birth of single-point linear perspective in painting. The observer's eye is locked into an exact geometric relationship with the sacred space.",
    hotspots: [
      {
        id: "vortex" as any,
        name: "Coffered Barrel Vault",
        tag: "Brunelleschian Geometry",
        xPercent: 50,
        yPercent: 24,
        zoomScale: 2.2,
        zoomOrigin: "50% 24%",
        insight: "Calculated with exact mathematical orthogonal lines receding into a single vanishing point placed at eye level of the observer on the chapel floor."
      },
      {
        id: "cypress" as any,
        name: "God the Father & The Dove",
        tag: "The Eternal Axis",
        xPercent: 50,
        yPercent: 12,
        zoomScale: 2.4,
        zoomOrigin: "50% 12%",
        insight: "God stands on an architectural ledge behind the cross, with the Holy Spirit depicted as a dove hovering immediately between the Father's collar and the Son's halo."
      },
      {
        id: "star" as any,
        name: "The Lenzi Patrons",
        tag: "Secular Infiltration",
        xPercent: 18,
        yPercent: 62,
        zoomScale: 2.0,
        zoomOrigin: "18% 62%",
        insight: "Domenico Lenzi and his wife kneel outside the architectural triumphal arch in earthly space, human-sized, marking the rise of civic merchant patronage."
      },
      {
        id: "steeple" as any,
        name: "The Memento Mori Skeleton",
        tag: "Tomb & Inscription",
        xPercent: 50,
        yPercent: 88,
        zoomScale: 2.1,
        zoomOrigin: "50% 88%",
        insight: "The lower sarcophagus bears an open skeleton with the Italian verse warning that death is the universal equalizer for every viewer walking past."
      }
    ]
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
    imageSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Caravaggio_-_The_Calling_of_Saint_Matthew.jpg/1280px-Caravaggio_-_The_Calling_of_Saint_Matthew.jpg",
    wingId: "wing-shadow",
    historicalPivot: "Tenebrism as narrative engine. Divine revelation is not a halo of light around a saint, but a ruthless physical beam piercing everyday corruption.",
    hotspots: [
      {
        id: "star" as any,
        name: "The Shaft of Divine Light",
        tag: "Tenebrist Beam",
        xPercent: 68,
        yPercent: 20,
        zoomScale: 2.2,
        zoomOrigin: "68% 20%",
        insight: "A raking beam of intense illumination originates from an unseen window above Christ, cutting through dust to highlight faces and coins while leaving corners in total blackout."
      },
      {
        id: "cypress" as any,
        name: "Christ's Pointing Hand",
        tag: "Michelangelo Quote",
        xPercent: 86,
        yPercent: 44,
        zoomScale: 2.6,
        zoomOrigin: "86% 44%",
        insight: "Christ's limp index finger is an inverted, mirror citation of Michelangelo's hand of Adam from the Sistine Chapel ceiling, casting Christ as the second Adam."
      },
      {
        id: "vortex" as any,
        name: "Matthew's Hesitant Gesture",
        tag: "\"Who, Me?\"",
        xPercent: 44,
        yPercent: 50,
        zoomScale: 2.4,
        zoomOrigin: "44% 50%",
        insight: "Levi (Matthew) points to himself in astonishment. The contrast between his lavish fur collar and the barefoot humility of Peter captures the shock of grace."
      },
      {
        id: "steeple" as any,
        name: "The Moneylender's Spectacles",
        tag: "Spiritual Blindness",
        xPercent: 26,
        yPercent: 54,
        zoomScale: 2.3,
        zoomOrigin: "26% 54%",
        insight: "An elderly tax official perches eyeglasses on his nose, entirely engrossed in counting coins, completely oblivious to Christ standing two paces away."
      }
    ]
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
    imageSrc: "/starry-night.jpg",
    wingId: "wing-feeling",
    historicalPivot: "The turn inward: art ceases to record optical appearance and becomes the direct conduit of psychological and cosmic emotion.",
    hotspots: [
      {
        id: "cypress" as any,
        name: "Cypress Tree",
        tag: "Obelisk of Mourning",
        xPercent: 22,
        yPercent: 62,
        zoomScale: 2.4,
        zoomOrigin: "22% 62%",
        insight: "Traditional Mediterranean cemetery motif anchoring the foreground, bridging earth and sky like a dark, living flame."
      },
      {
        id: "vortex" as any,
        name: "Celestial Swirl",
        tag: "Cosmic Turbulence",
        xPercent: 54,
        yPercent: 32,
        zoomScale: 2.2,
        zoomOrigin: "54% 32%",
        insight: "Eleven pulsating stars and an undulating vortex that physicists note maps precisely onto Kolmogorov hydrodynamic turbulence."
      },
      {
        id: "star" as any,
        name: "Morning Star (Venus)",
        tag: "Beacon of Hope",
        xPercent: 72,
        yPercent: 48,
        zoomScale: 2.5,
        zoomOrigin: "72% 48%",
        insight: "Painted with a brilliant white-yellow halo just above the horizon, corresponding to Van Gogh's observation in his June letters to Theo."
      },
      {
        id: "steeple" as any,
        name: "Village Church Spire",
        tag: "Memory of Brabant",
        xPercent: 58,
        yPercent: 68,
        zoomScale: 2.3,
        zoomOrigin: "58% 68%",
        insight: "An idealized architectural motif evoking Dutch Protestant church towers from his youth, unlike the flat tiled roofs of Provence."
      }
    ]
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
    imageSrc: "https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg",
    wingId: "wing-cubism",
    historicalPivot: "The total destruction of single-point Renaissance perspective. Space is no longer a vacuum containing objects, but a solid crystal smashed into shards.",
    hotspots: [
      {
        id: "vortex" as any,
        name: "The African Mask Head",
        tag: "Primitivist Rupture",
        xPercent: 82,
        yPercent: 24,
        zoomScale: 2.3,
        zoomOrigin: "82% 24%",
        insight: "Painted after Picasso's June 1907 visit to the Trocadéro Ethnographic Museum; the features borrow directly from Dan and Etoumbi ritual reliquaries."
      },
      {
        id: "cypress" as any,
        name: "The Squatting Figure",
        tag: "Simultaneous Viewpoint",
        xPercent: 74,
        yPercent: 76,
        zoomScale: 2.4,
        zoomOrigin: "74% 76%",
        insight: "Her back is turned squarely to the spectator, yet her head is swiveled 180 degrees to confront us directly—the seminal Cubist synthesis of multiple perspectives in one body."
      },
      {
        id: "star" as any,
        name: "The Sliced Melon Still Life",
        tag: "Pointed Blade of Flesh",
        xPercent: 50,
        yPercent: 92,
        zoomScale: 2.2,
        zoomOrigin: "50% 92%",
        insight: "A precarious cluster of grapes, apple, and razor-sharp melon wedge thrusts toward the lower canvas edge like a dagger, echoing the angular aggression of the bodies."
      },
      {
        id: "steeple" as any,
        name: "Iberian Classical Face",
        tag: "Archaic Spanish Roots",
        xPercent: 32,
        yPercent: 34,
        zoomScale: 2.2,
        zoomOrigin: "32% 34%",
        insight: "The central figures retain the heavy eyelid almond shapes and flat profiles derived from 6th-century BCE Iberian stone sculptures excavated at Osuna."
      }
    ]
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
    imageSrc: "https://upload.wikimedia.org/wikipedia/en/f/f6/Autumn_Rhythm.jpg",
    wingId: "wing-concept",
    historicalPivot: "The canvas transformed from an illusionistic window into an arena of action. Art is no longer a representation of an object, but the physical record of bodily event.",
    hotspots: [
      {
        id: "vortex" as any,
        name: "The Skein Web of Enamel",
        tag: "Controlled Chance",
        xPercent: 48,
        yPercent: 46,
        zoomScale: 2.3,
        zoomOrigin: "48% 46%",
        insight: "Layered ribbons of black, brown, white, and teal enamel paint interact fluidly; viscosity and velocity determine line thickness without hair brushes touching canvas."
      },
      {
        id: "star" as any,
        name: "Raw Unprimed Cotton Duck",
        tag: "Material Honesty",
        xPercent: 12,
        yPercent: 22,
        zoomScale: 2.4,
        zoomOrigin: "12% 22%",
        insight: "Unpainted canvas breathes through the dense web, absorbing thin solvent stains while resisting thicker gloss enamel pools."
      },
      {
        id: "cypress" as any,
        name: "Barn Floor Trace & Debris",
        tag: "Studio Archaeology",
        xPercent: 82,
        yPercent: 80,
        zoomScale: 2.5,
        zoomOrigin: "82% 80%",
        insight: "Micro-inspection reveals cigarette ash, matches, and studio dust trapped forever inside dried lacquer skin—evidence of total physical immersion."
      }
    ]
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
      imageSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Cimabue_-_Maest%C3%A0_di_Santa_Trinita_-_Google_Art_Project.jpg/800px-Cimabue_-_Maest%C3%A0_di_Santa_Trinita_-_Google_Art_Project.jpg",
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
      imageSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Masaccio_trinity.jpg/1024px-Masaccio_trinity.jpg",
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
      imageSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Jean-Auguste-Dominique_Ingres_-_Une_Odalisque%2C_dite_La_Grande_Odalisque.jpg/1280px-Jean-Auguste-Dominique_Ingres_-_Une_Odalisque%2C_dite_La_Grande_Odalisque.jpg",
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
      imageSrc: "https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg",
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
