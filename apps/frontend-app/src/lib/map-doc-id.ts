const MONGO_OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

export function isMongoObjectId(value: string): boolean {
  return MONGO_OBJECT_ID_RE.test(value);
}

function bytesToHex(bytes: ArrayLike<number>): string {
  if (bytes.length !== 12) return "";

  let hex = "";
  for (let index = 0; index < bytes.length; index += 1) {
    const value = bytes[index];
    if (!Number.isInteger(value) || value < 0 || value > 255) return "";
    hex += value.toString(16).padStart(2, "0");
  }

  return hex;
}

function fromBufferLike(raw: object): string {
  if (ArrayBuffer.isView(raw)) {
    return bytesToHex(new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength));
  }

  if (
    "type" in raw &&
    (raw as { type: unknown }).type === "Buffer" &&
    "data" in raw &&
    Array.isArray((raw as { data: unknown }).data)
  ) {
    return bytesToHex((raw as { data: number[] }).data);
  }

  if (
    "buffer" in raw &&
    typeof (raw as { buffer: unknown }).buffer === "object" &&
    (raw as { buffer: unknown }).buffer !== null
  ) {
    return fromBufferLike((raw as { buffer: object }).buffer);
  }

  if ("data" in raw && Array.isArray((raw as { data: unknown }).data)) {
    return bytesToHex((raw as { data: number[] }).data);
  }

  return "";
}

function asUsableObjectId(value: string): string {
  const trimmed = value.trim();
  return isMongoObjectId(trimmed) ? trimmed : "";
}

function normalizeId(raw: unknown): string {
  if (raw == null) return "";

  if (typeof raw === "string") {
    return asUsableObjectId(raw);
  }

  if (typeof raw === "number" || typeof raw === "boolean" || typeof raw === "bigint") {
    return "";
  }

  if (typeof raw === "object") {
    if ("$oid" in raw && typeof (raw as { $oid: unknown }).$oid === "string") {
      return asUsableObjectId((raw as { $oid: string }).$oid);
    }

    if (typeof (raw as { toHexString?: () => string }).toHexString === "function") {
      try {
        return asUsableObjectId((raw as { toHexString: () => string }).toHexString());
      } catch {
        return "";
      }
    }

    const fromBuffer = fromBufferLike(raw);
    if (fromBuffer) return asUsableObjectId(fromBuffer);

    const value = String(raw);
    if (value === "[object Object]") return "";
    return asUsableObjectId(value);
  }

  return "";
}

export function mapDocId(doc: { _id?: unknown; id?: unknown }): string {
  return normalizeId(doc.id) || normalizeId(doc._id);
}

export function uniqueListKey(id: string, index: number, ids: string[]): string {
  const collisions = ids.filter((item) => item === id).length > 1;
  if (!id) return `item-${index}`;
  return collisions ? `${id}-${index}` : id;
}

export function removeFirstById<T extends { id: string }>(items: T[], id: string): T[] {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return items;
  return items.filter((_, itemIndex) => itemIndex !== index);
}
