import type { Auth } from "better-auth";
import type { Db, MongoClient } from "mongodb";

export declare const auth: Auth;

export declare function getTrustedOrigins(): string[];

export declare function getMongoClient(): MongoClient;

export declare function getDb(): Db;

export declare const mongoClient: {
  connect: () => Promise<MongoClient>;
  db: () => Db;
};

export type AppRole = "profe" | "alumna";

export declare function resolveAppRole(
  ...roles: Array<string | null | undefined>
): AppRole;

export declare function resolveAppRoleForEmail(
  email: string,
  sessionRol?: string | null,
): Promise<AppRole>;
