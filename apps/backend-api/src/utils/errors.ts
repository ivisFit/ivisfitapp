export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

export function assertFound<T>(
  doc: T | null,
  message = "Recurso no encontrado",
): T {
  if (!doc) {
    throw new AppError(404, message);
  }
  return doc;
}
