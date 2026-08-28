export type CheckinAlimentacionEstado = "cumpli" | "parcial" | "no_pude";

export type CheckinAlimentacion = {
  _id: string;
  alumnaId: string;
  dateKey: string;
  estado: CheckinAlimentacionEstado;
  createdAt: string;
  updatedAt: string;
};
