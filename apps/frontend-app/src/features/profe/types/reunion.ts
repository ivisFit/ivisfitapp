export type Reunion = {
  id: string;
  alumnaId: string;
  alumna?: {
    id: string;
    nombre: string;
    correo: string;
  };
  fecha: string;
  hora: string;
  titulo: string;
  descripcion: string;
  meetLink: string;
};

export type ReunionPayload = {
  alumnaId: string;
  fecha: string;
  hora: string;
  titulo: string;
  descripcion: string;
  meetLink: string;
};

export type ReunionUpdatePayload = Omit<ReunionPayload, "alumnaId">;

type ReunionApiDoc = {
  id?: string;
  _id?: string;
  alumnaId: string;
  alumna?: Reunion["alumna"];
  fecha: string;
  hora: string;
  titulo: string;
  descripcion?: string;
  meetLink: string;
};

export function mapReunionFromApi(doc: ReunionApiDoc): Reunion {
  return {
    id: doc.id ?? doc._id ?? "",
    alumnaId: doc.alumnaId,
    alumna: doc.alumna,
    fecha: doc.fecha,
    hora: doc.hora,
    titulo: doc.titulo,
    descripcion: doc.descripcion ?? "",
    meetLink: doc.meetLink,
  };
}

export function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthRange(year: number, month: number) {
  const desde = new Date(year, month, 1);
  const hasta = new Date(year, month + 1, 0);
  return { desde, hasta };
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseReunionDate(value: string) {
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function formatReunionDate(value: string) {
  return parseReunionDate(value).toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function isReunionToday(value: string) {
  return isSameDay(parseReunionDate(value), new Date());
}

export function getReunionDateKey(value: string) {
  return formatDateParam(parseReunionDate(value));
}
