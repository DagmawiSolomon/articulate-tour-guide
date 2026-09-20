export interface ArtworkMetadata {
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
}

export interface MapRoute {
  id: "restrooms" | "gauguin" | "elevator";
  label: string;
  targetRoom: string;
  distance: string;
  walkingTime: string;
  steps: string[];
  pathD: string;
  targetCoords: { x: number; y: number };
}

export interface ComparisonDiff {
  id: string;
  title: string;
  diff: string;
}

export interface TimelineMilestone {
  id: string;
  year: string;
  location: string;
  title: string;
  description: string;
  artworkTitle?: string;
  imageSrc?: string;
  isCurrent?: boolean;
}

export interface DetailHotspot {
  id: "cypress" | "star" | "steeple" | "vortex" | "moon";
  name: string;
  tag: string;
  xPercent: number;
  yPercent: number;
  zoomScale: number;
  zoomOrigin: string;
  insight: string;
}

export const ARTWORK_DATA: ArtworkMetadata = {
  title: "The Starry Night",
  originalTitle: "La Nuit étoilée",
  artist: "Vincent van Gogh",
  artistLifespan: "Dutch, 1853–1890",
  year: "June 1889",
  locationCreated: "Saint-Paul-de-Mausole Asylum, Saint-Rémy-de-Provence, France",
  medium: "Oil on canvas",
  dimensions: "73.7 cm × 92.1 cm (29.0 in × 36.3 in)",
  accession: "Acquired through the Lillie P. Bliss Bequest (1941)",
  curatorialQuote:
    "\"Be clearly aware of the stars and infinity on high. Then life seems almost enchanted after all.\"",
  summary:
    "Painted during Van Gogh's convalescence at Saint-Rémy, this masterwork represents an unprecedented departure from direct observation into psychological expressionism, using dynamic impasto spirals to evoke cosmic vitalism.",
  imageSrc: "/starry-night.jpg",
};

export const MAP_ROUTES: Record<string, MapRoute> = {
  restrooms: {
    id: "restrooms",
    label: "Restrooms",
    targetRoom: "Level 5 South Corridor Restrooms",
    distance: "45 m",
    walkingTime: "~1 min",
    steps: [
      "Exit Gallery 36 through the south archway",
      "Proceed straight past the colonnade corridor",
      "Restrooms are on your left beside the quiet lounge",
    ],
    pathD: "M 220 170 L 220 230 L 220 290 L 140 290 L 140 330",
    targetCoords: { x: 140, y: 345 },
  },
  gauguin: {
    id: "gauguin",
    label: "Gallery 37: Gauguin",
    targetRoom: "Gallery 37 (Paul Gauguin)",
    distance: "20 m",
    walkingTime: "~30 sec",
    steps: [
      "Pass through the east archway directly ahead",
      "Enter Gallery 37: Tahitian Reveries & Late Synthetism",
    ],
    pathD: "M 220 170 L 320 170 L 360 170",
    targetCoords: { x: 385, y: 170 },
  },
  elevator: {
    id: "elevator",
    label: "West Elevators",
    targetRoom: "Level 5 West Rotunda Bank",
    distance: "60 m",
    walkingTime: "~1.5 min",
    steps: [
      "Head west along the central impressionist concourse",
      "Elevator bank is on your right before Gallery 34",
    ],
    pathD: "M 220 170 L 120 170 L 60 170 L 60 100",
    targetCoords: { x: 60, y: 85 },
  },
};

export const COMPARISON_DATA = {
  study: {
    title: "Letter 782 Preparatory Study",
    date: "September 1889",
    medium: "Pen and ink with reed hatching",
    imageSrc: "/starry-night-sketch.jpg",
  },
  artwork: {
    title: "The Starry Night (Finished Canvas)",
    date: "June 1889",
    medium: "Oil on canvas with impasto",
    imageSrc: "/starry-night.jpg",
  },
  diffs: [
    {
      id: "sky",
      title: "Sky Vortex Dynamics",
      diff: "The letter study shows concentric linear pen strokes; the final oil canvas turns into undulating oceanic waves with cobalt and zinc yellow contrast.",
    },
    {
      id: "cypress",
      title: "Cypress Vertical Scale",
      diff: "The cypress silhouette was heightened by 30% on canvas to anchor the composition and bridge the village with the cosmic spiral.",
    },
    {
      id: "steeple",
      title: "Brabant Village Church",
      diff: "The architectural spire was modeled after nostalgic memories of Van Gogh's homeland in the Netherlands rather than Provencal steeples.",
    },
  ],
};

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: "nuenen",
    year: "1885",
    location: "Nuenen",
    title: "Peasant Realism",
    artworkTitle: "The Potato Eaters",
    description: "Somber earthy umbers, rustic domestic light, and gritty realism culminating in The Potato Eaters.",
    imageSrc: "/assets/timeline/nuenen.jpg",
  },
  {
    id: "paris",
    year: "1886–1887",
    location: "Paris",
    title: "The Impressionist Awakening",
    artworkTitle: "Self-Portrait in Grey Felt Hat",
    description: "Encounter with Pissarro, Monet, and Seurat; adoption of bright sunlight palettes and optical brushwork.",
    imageSrc: "/assets/timeline/paris.jpg",
  },
  {
    id: "arles",
    year: "1888",
    location: "Arles",
    title: "The Studio of the South",
    artworkTitle: "Sunflowers & Yellow House",
    description: "Dazzling Mediterranean yellows and bold complementary contrasts in The Yellow House and Bedroom in Arles.",
    imageSrc: "/assets/timeline/arles.jpg",
  },
  {
    id: "saint-remy",
    year: "1889",
    location: "Saint-Rémy",
    title: "Cosmic & Spiritual Rhythms",
    artworkTitle: "The Starry Night",
    description: "Convalescence at Saint-Paul asylum; turbulent swirling vortexes and cosmic nightscapes including The Starry Night.",
    imageSrc: "/starry-night.jpg",
    isCurrent: true,
  },
  {
    id: "auvers",
    year: "1890",
    location: "Auvers-sur-Oise",
    title: "The Final Tempest",
    artworkTitle: "Wheatfield with Crows",
    description: "Agitated skies, vast undulating wheatfields, and seventy feverish final canvases under Dr. Gachet's care.",
    imageSrc: "/assets/timeline/auvers.jpg",
  },
];

export const DETAIL_HOTSPOTS: DetailHotspot[] = [
  {
    id: "cypress",
    name: "The Cypress Tree",
    tag: "Symbol of Grief & Eternity",
    xPercent: 24,
    yPercent: 55,
    zoomScale: 2.1,
    zoomOrigin: "24% 55%",
    insight:
      "In Mediterranean culture, the cypress is the traditional tree of mourning. Van Gogh transforms it into a living dark flame bridging earth and cosmos.",
  },
  {
    id: "star",
    name: "Venus / The Morning Star",
    tag: "Astronomical Alignment",
    xPercent: 63,
    yPercent: 44,
    zoomScale: 2.3,
    zoomOrigin: "63% 44%",
    insight:
      "In June 1889, astronomical models show Venus was at maximum brilliance before sunrise. Van Gogh recorded seeing it luminous and large from his window.",
  },
  {
    id: "steeple",
    name: "Dutch Village Church",
    tag: "Brabant Nostalgia",
    xPercent: 52,
    yPercent: 74,
    zoomScale: 2.4,
    zoomOrigin: "52% 74%",
    insight:
      "Churches in Provence lack tall Gothic steeples; Van Gogh painted this spire from nostalgic memories of his father's Dutch Reformed parish.",
  },
  {
    id: "vortex",
    name: "Cosmic Sky Vortex",
    tag: "Atmospheric Turbulence",
    xPercent: 46,
    yPercent: 28,
    zoomScale: 2.2,
    zoomOrigin: "46% 28%",
    insight:
      "The central undulating spiral evokes oceanic dynamics and fluid turbulence, painted with concentric rhythmic strokes of French ultramarine and cobalt.",
  },
  {
    id: "moon",
    name: "Crescent Moon & Sun Orb",
    tag: "Celestial Fusion",
    xPercent: 86,
    yPercent: 18,
    zoomScale: 2.5,
    zoomOrigin: "86% 18%",
    insight:
      "Van Gogh synthesizes sun and moon into a fiery golden crescent radiating pulsating halo concentric waves across an illuminated night sky.",
  },
];

export interface VanGoghLetter {
  id: "letter-782" | "letter-cypress" | "letter-stars";
  recipient: string;
  date: string;
  location: string;
  excerpt: string;
  context: string;
  letterRef: string;
  archiveUrl: string;
}

export const VANGOGH_LETTERS: Record<string, VanGoghLetter> = {
  "letter-782": {
    id: "letter-782",
    recipient: "Theo van Gogh",
    date: "c. 2 June 1889",
    location: "Saint-Rémy-de-Provence",
    excerpt:
      "\"This morning I saw the countryside from my window a long time before sunrise, with nothing but the morning star, which looked very big.\"",
    context:
      "Written from his barred window at Saint-Paul-de-Mausole asylum, describing the actual pre-dawn observation that inspired the luminous morning star (Venus) in The Starry Night.",
    letterRef: "Letter 782 (Van Gogh Museum Archive)",
    archiveUrl: "https://vangoghletters.org/vg/letters/let782/letter.html",
  },
  "letter-cypress": {
    id: "letter-cypress",
    recipient: "Theo van Gogh",
    date: "25 June 1889",
    location: "Saint-Rémy-de-Provence",
    excerpt:
      "\"The cypresses are always occupying my thoughts. I should like to make something of them like the canvases of the sunflowers, because it astonishes me that no one has yet done them as I see them.\"",
    context:
      "Written during the same month he completed The Starry Night, revealing his fascination with cypresses as monumental obelisks connecting earth and cosmic sky.",
    letterRef: "Letter 783 (Van Gogh Museum Archive)",
    archiveUrl: "https://vangoghletters.org/vg/letters/let783/letter.html",
  },
  "letter-stars": {
    id: "letter-stars",
    recipient: "Émile Bernard",
    date: "c. 19 June 1888",
    location: "Arles",
    excerpt:
      "\"Looking at the stars always makes me dream, as simply as I dream over the black dots of a map representing towns and villages. Why, I ask myself, should the shining dots of the sky not be as accessible to us as the black dots on the map of France?\"",
    context:
      "Written a year earlier to fellow artist Émile Bernard, revealing Vincent's enduring spiritual obsession with the starry sky as a celestial destination.",
    letterRef: "Letter 628 (Van Gogh Museum Archive)",
    archiveUrl: "https://vangoghletters.org/vg/letters/let628/letter.html",
  },
};

