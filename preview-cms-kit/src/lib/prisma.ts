/**
 * Reemplazá este archivo con tu cliente Prisma del proyecto host.
 *
 * Ejemplo:
 *   import { PrismaClient } from '@prisma/client';
 *   export const prisma = new PrismaClient();
 */
export type PrismaJson = Record<string, unknown>;

export type SiteContentRow = {
  locale: string;
  data: unknown;
  version: number;
  updatedById: string | null;
  updatedAt: Date;
};

export type PrismaClientLike = {
  siteContent: {
    findMany(args: { where: { locale: { in: string[] } } }): Promise<SiteContentRow[]>;
    upsert(args: {
      where: { locale: string };
      create: {
        locale: string;
        data: unknown;
        version: number;
        updatedById: string;
      };
      update: {
        data: unknown;
        version: { increment: number };
        updatedById: string;
      };
    }): Promise<SiteContentRow>;
  };
};

/** Stub para el demo. En tu proyecto, exportá tu PrismaClient real. */
export const prisma: PrismaClientLike = {
  siteContent: {
    async findMany() {
      return [];
    },
    async upsert(args) {
      return {
        locale: args.where.locale,
        data: args.create.data,
        version: args.create.version,
        updatedById: args.create.updatedById,
        updatedAt: new Date(),
      };
    },
  },
};
