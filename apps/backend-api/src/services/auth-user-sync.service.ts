import { getDb } from "@ivisfit/auth";
import { AppError } from "../utils/errors.js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findAuthUserByEmail(email: string) {
  const db = getDb();
  const normalized = normalizeEmail(email);
  const user = await db.collection("user").findOne({
    email: { $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  });
  if (user) return user;
  return db.collection("user").findOne({ email: normalized });
}

export async function syncBetterAuthName({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  const user = await findAuthUserByEmail(email);
  if (!user) {
    throw new AppError(
      422,
      "No hay cuenta de acceso vinculada a este correo; no se pudo actualizar el nombre",
    );
  }

  const db = getDb();
  await db.collection("user").updateOne(
    { _id: user._id },
    { $set: { name: trimmedName, updatedAt: new Date() } },
  );
}

export async function syncBetterAuthEmail({
  fromEmail,
  toEmail,
  name,
}: {
  fromEmail: string;
  toEmail: string;
  name?: string;
}) {
  const from = normalizeEmail(fromEmail);
  const to = normalizeEmail(toEmail);
  if (from === to) return;

  const user = await findAuthUserByEmail(from);
  if (!user) {
    throw new AppError(
      422,
      "No hay cuenta de acceso vinculada al correo actual; no se pudo cambiar el email",
    );
  }

  const existing = await findAuthUserByEmail(to);
  if (existing && String(existing._id) !== String(user._id)) {
    throw new AppError(409, "Ya existe un usuario con ese correo");
  }

  const db = getDb();
  const userIdField = (user as { id?: unknown }).id;
  const authUserId =
    typeof userIdField === "string" && userIdField.length > 0
      ? userIdField
      : String(user._id);
  const setFields: Record<string, unknown> = {
    email: to,
    updatedAt: new Date(),
  };
  if (name?.trim()) {
    setFields.name = name.trim();
  }

  await db.collection("user").updateOne({ _id: user._id }, { $set: setFields });

  await db.collection("account").updateMany(
    {
      $or: [{ userId: authUserId }, { userId: String(user._id) }],
      providerId: "credential",
    },
    { $set: { accountId: to, updatedAt: new Date() } },
  );
}
