// Storage types
// TODO: Define storage-related types here

export interface StorageConfig {
  provider: 'local' | 'cloud';
  path?: string;
  credentials?: any;
}

// Placeholder export to make this a valid module
export const storageTypes = {};
