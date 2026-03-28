export interface AppMetadata {
  name: string;
  service: string;
  version: string;
}

export function createApp(): AppMetadata {
  return {
    name: "USB System Control",
    service: "auth-service",
    version: "0.1.0",
  };
}
