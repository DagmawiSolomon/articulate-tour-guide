import { CURATORIAL_ARCHIVAL_CORPUS, type ArchivalRecord } from "./curatorial-archives-data";

/**
 * In-memory fast token/keyword retrieval engine for archival primary sources.
 * Execution speed is sub-5ms, suitable for real-time voice docent RAG tools.
 */
export function searchCuratorialArchives(
  query: string,
  category?: string
): ArchivalRecord | null {
  if (!query || !query.trim()) return null;

  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery
    .split(/[\s,.;:!?\-'"()]+/)
    .filter((token) => token.length > 2);

  if (queryTokens.length === 0) return null;

  let bestScore = -1;
  let bestMatch: ArchivalRecord | null = null;

  for (const record of CURATORIAL_ARCHIVAL_CORPUS) {
    if (category && category !== "all" && record.category !== category) {
      continue;
    }

    let score = 0;
    const lowerTitle = record.title.toLowerCase();
    const lowerAuthor = record.authorOrInstitution.toLowerCase();
    const lowerExcerpt = record.excerpt.toLowerCase();
    const lowerFinding = record.finding.toLowerCase();
    const keywords = record.keywords.map((k) => k.toLowerCase());

    // Check exact full phrase in title or keywords (highest weight)
    if (lowerTitle.includes(normalizedQuery)) score += 30;
    if (lowerAuthor.includes(normalizedQuery)) score += 25;

    for (const kw of keywords) {
      if (kw === normalizedQuery || normalizedQuery.includes(kw)) {
        score += 20;
      }
    }

    // Token match scoring
    for (const token of queryTokens) {
      if (lowerAuthor.includes(token)) score += 8;
      if (keywords.some((k) => k.includes(token))) score += 6;
      if (lowerTitle.includes(token)) score += 5;
      if (lowerFinding.includes(token)) score += 3;
      if (lowerExcerpt.includes(token)) score += 2;
    }

    if (score > bestScore && score >= 5) {
      bestScore = score;
      bestMatch = record;
    }
  }

  return bestMatch;
}

export function getArchivesByWing(wingId: string): ArchivalRecord[] {
  return CURATORIAL_ARCHIVAL_CORPUS.filter((rec) => rec.wingId === wingId);
}

export function getArchivesByArtwork(artworkId: string): ArchivalRecord[] {
  return CURATORIAL_ARCHIVAL_CORPUS.filter((rec) => rec.targetArtworkId === artworkId);
}

export function getArchiveById(id: string): ArchivalRecord | null {
  return CURATORIAL_ARCHIVAL_CORPUS.find((rec) => rec.id === id) || null;
}

export function getAllArchives(): ArchivalRecord[] {
  return CURATORIAL_ARCHIVAL_CORPUS;
}
