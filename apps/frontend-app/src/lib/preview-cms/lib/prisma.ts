import { connectDB, SiteContent, type SiteContentDocument } from "@ivisfit/database";

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

let connected = false;

async function ensureDb(): Promise<void> {
  if (!connected) {
    await connectDB();
    connected = true;
  }
}

function toRow(doc: SiteContentDocument): SiteContentRow {
  return {
    locale: doc.locale,
    data: doc.data ?? {},
    version: doc.version ?? 1,
    updatedById: doc.updatedById ?? null,
    updatedAt: doc.updatedAt ?? new Date(),
  };
}

export const prisma: PrismaClientLike = {
  siteContent: {
    async findMany({ where }) {
      await ensureDb();
      const rows = await SiteContent.find({
        locale: { $in: where.locale.in },
      });
      return rows.map(toRow);
    },
    async upsert({ where, create, update }) {
      await ensureDb();
      const existing = await SiteContent.findOne({ locale: where.locale });

      if (existing) {
        const row = await SiteContent.findOneAndUpdate(
          { locale: where.locale },
          {
            $set: {
              data: update.data,
              updatedById: update.updatedById,
            },
            $inc: { version: 1 },
          },
          { new: true },
        );
        if (!row) {
          throw new Error("No se pudo actualizar site_content");
        }
        return toRow(row);
      }

      const row = await SiteContent.create({
        locale: create.locale,
        data: create.data,
        version: create.version,
        updatedById: create.updatedById,
      });
      return toRow(row);
    },
  },
};
