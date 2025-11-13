export interface Entity {
  id: string;
  text: string;
  type: 'person' | 'place' | 'concept' | 'organization';
  mentions: number;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: number;
}

// Simple rule-based entity extraction for demo
// In production, this would use a transformer model via @huggingface/transformers
export class EntityExtractor {
  private entities = new Map<string, Entity>();
  private relationships: Relationship[] = [];
  private entityIdCounter = 0;

  // Common patterns for entity detection
  private patterns = {
    person: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
    place: /\b(in|at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
    organization: /\b([A-Z][a-z]+(?:\s+(?:Inc|Corp|LLC|Company|University|Institute))\b)/g,
  };

  // Relationship patterns
  private relationPatterns = [
    { pattern: /(\w+)\s+(?:works at|is employed by)\s+(\w+)/gi, type: 'works_at' },
    { pattern: /(\w+)\s+(?:knows|met)\s+(\w+)/gi, type: 'knows' },
    { pattern: /(\w+)\s+(?:lives in|is from)\s+(\w+)/gi, type: 'lives_in' },
    { pattern: /(\w+)\s+(?:studied at|graduated from)\s+(\w+)/gi, type: 'studied_at' },
    { pattern: /(\w+)\s+(?:founded|created|started)\s+(\w+)/gi, type: 'founded' },
  ];

  extractFromText(text: string): { entities: Entity[]; relationships: Relationship[] } {
    // Extract persons
    const personMatches = text.matchAll(this.patterns.person);
    for (const match of personMatches) {
      const entityText = match[1];
      if (entityText && entityText.split(' ').length >= 2) {
        this.addOrUpdateEntity(entityText, 'person');
      }
    }

    // Extract places
    const placeMatches = text.matchAll(this.patterns.place);
    for (const match of placeMatches) {
      const place = match[2];
      if (place) {
        this.addOrUpdateEntity(place, 'place');
      }
    }

    // Extract organizations
    const orgMatches = text.matchAll(this.patterns.organization);
    for (const match of orgMatches) {
      const org = match[1];
      if (org) {
        this.addOrUpdateEntity(org, 'organization');
      }
    }

    // Extract concepts (capitalized words that aren't already entities)
    const conceptPattern = /\b([A-Z][a-z]{3,})\b/g;
    const conceptMatches = text.matchAll(conceptPattern);
    for (const match of conceptMatches) {
      const concept = match[1];
      if (concept && !this.entities.has(concept.toLowerCase())) {
        this.addOrUpdateEntity(concept, 'concept');
      }
    }

    // Extract relationships
    for (const { pattern, type } of this.relationPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const source = match[1];
        const target = match[2];
        if (source && target) {
          this.addRelationship(source, target, type);
        }
      }
    }

    return {
      entities: Array.from(this.entities.values()),
      relationships: this.relationships,
    };
  }

  private addOrUpdateEntity(text: string, type: Entity['type']) {
    const key = text.toLowerCase();
    const existing = this.entities.get(key);

    if (existing) {
      existing.mentions++;
    } else {
      this.entities.set(key, {
        id: `entity_${this.entityIdCounter++}`,
        text,
        type,
        mentions: 1,
      });
    }
  }

  private addRelationship(source: string, target: string, type: string) {
    const sourceKey = source.toLowerCase();
    const targetKey = target.toLowerCase();

    // Only create relationship if both entities exist
    if (this.entities.has(sourceKey) && this.entities.has(targetKey)) {
      const sourceEntity = this.entities.get(sourceKey)!;
      const targetEntity = this.entities.get(targetKey)!;

      const relationId = `${sourceEntity.id}_${targetEntity.id}_${type}`;
      
      // Check if relationship already exists
      const existing = this.relationships.find(r => r.id === relationId);
      if (!existing) {
        this.relationships.push({
          id: relationId,
          source: sourceEntity.id,
          target: targetEntity.id,
          type,
          confidence: 0.8,
        });
      }
    }
  }

  getGraphData() {
    return {
      nodes: Array.from(this.entities.values()).map(entity => ({
        id: entity.id,
        label: entity.text,
        type: entity.type,
        mentions: entity.mentions,
      })),
      links: this.relationships.map(rel => ({
        source: rel.source,
        target: rel.target,
        type: rel.type,
        confidence: rel.confidence,
      })),
    };
  }

  clear() {
    this.entities.clear();
    this.relationships = [];
    this.entityIdCounter = 0;
  }
}
