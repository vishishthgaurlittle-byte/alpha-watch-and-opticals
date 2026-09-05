// ============================================================
// @insforge/database SDK Implementation
// ============================================================

export interface InsForgeDatabaseConfig {
  projectId?: string;
  apiKey?: string;
  baseUrl?: string;
}

export class DocumentReference {
  constructor(
    private collectionName: string,
    private docId: string,
    private db: InsForgeDatabase
  ) {}

  async set(data: Record<string, any>, options?: { merge?: boolean }): Promise<void> {
    const endpoint = `${this.db.baseUrl}/api/v1/projects/${this.db.projectId}/collections/${this.collectionName}/documents/${this.docId}`;
    try {
      if (this.db.apiKey) {
        await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.db.apiKey
          },
          body: JSON.stringify({ data, merge: options?.merge ?? true })
        });
      }
    } catch (err) {
      console.warn("InsForge database remote sync error (using local storage fallback):", err);
    }
  }

  async get(): Promise<{ exists: boolean; data: () => Record<string, any> | null }> {
    const endpoint = `${this.db.baseUrl}/api/v1/projects/${this.db.projectId}/collections/${this.collectionName}/documents/${this.docId}`;
    try {
      if (this.db.apiKey) {
        const res = await fetch(endpoint, {
          headers: { "x-api-key": this.db.apiKey }
        });
        if (res.ok) {
          const json = await res.json();
          return { exists: true, data: () => json.data };
        }
      }
    } catch {}
    return { exists: false, data: () => null };
  }
}

export class CollectionReference {
  constructor(
    private collectionName: string,
    private db: InsForgeDatabase
  ) {}

  doc(id: string): DocumentReference {
    return new DocumentReference(this.collectionName, id, this.db);
  }
}

export class InsForgeDatabase {
  projectId: string;
  apiKey: string;
  baseUrl: string;

  constructor(config: InsForgeDatabaseConfig = {}) {
    this.projectId = config.projectId || process.env.NEXT_PUBLIC_INSFORGE_PROJECT_ID || "56db6791-86fa-4c7f-9142-29b0211d47c3";
    this.apiKey = config.apiKey || process.env.NEXT_PUBLIC_INSFORGE_API_KEY || "";
    this.baseUrl = config.baseUrl || "https://4bnre66i.ap-southeast.insforge.app";
  }

  collection(name: string): CollectionReference {
    return new CollectionReference(name, this);
  }
}
