import type { ContentNode, LocalizedContent } from "./schema.js";

export interface ContentRepository {
  readonly locale: LocalizedContent["locale"];
  getById(id: string): ContentNode | undefined;
  getChildren(parentId: string | null): ContentNode[];
  getRelated(id: string): ContentNode[];
  listByType(type: ContentNode["type"]): ContentNode[];
  search(query: string, tags?: string[]): ContentNode[];
}

export class JsonContentRepository implements ContentRepository {
  readonly locale: LocalizedContent["locale"];
  private readonly nodes: ContentNode[];
  private readonly byId: Map<string, ContentNode>;

  constructor(document: LocalizedContent) {
    this.locale = document.locale;
    this.nodes = document.nodes;
    this.byId = new Map(document.nodes.map((node) => [node.id, node]));
  }

  getById(id: string): ContentNode | undefined {
    return this.byId.get(id);
  }

  getChildren(parentId: string | null): ContentNode[] {
    return this.nodes.filter((node) => node.parentId === parentId);
  }

  getRelated(id: string): ContentNode[] {
    const node = this.getById(id);
    if (!node) return [];
    return node.relatedIds
      .map((relatedId) => this.byId.get(relatedId))
      .filter((candidate): candidate is ContentNode => candidate !== undefined);
  }

  listByType(type: ContentNode["type"]): ContentNode[] {
    return this.nodes.filter((node) => node.type === type);
  }

  search(query: string, tags: string[] = []): ContentNode[] {
    const needle = query.trim().toLocaleLowerCase(this.locale);
    return this.nodes.filter((node) => {
      const hasTags = tags.length === 0 || tags.every((tag) => node.filterTags.includes(tag));
      if (!hasTags) return false;
      if (!needle) return true;
      const haystack = [node.title, node.summary, node.body]
        .filter((value): value is string => Boolean(value))
        .join("\n")
        .toLocaleLowerCase(this.locale);
      return haystack.includes(needle);
    });
  }
}
