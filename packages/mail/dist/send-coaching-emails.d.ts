export interface SendRutinaAsignadaEmailParams {
    to: string;
    alumnaNombre: string;
    planNombre?: string;
    appName: string;
    appUrl?: string;
    /** La rutina nueva todavía no es la que la alumna ve hoy. */
    programada?: boolean;
    /** Fecha ya formateada en la que empieza esa rutina. */
    inicioProgramado?: string;
}
export declare function sendRutinaAsignadaEmail({ to, alumnaNombre, planNombre, appName, appUrl, programada: programadaParam, inicioProgramado, }: SendRutinaAsignadaEmailParams): Promise<void>;
export interface SendRecordatorioEntrenamientoEmailParams {
    to: string;
    alumnaNombre: string;
    hora: string;
    appName: string;
    appUrl?: string;
}
export declare function sendRecordatorioEntrenamientoEmail({ to, alumnaNombre, hora, appName, appUrl, }: SendRecordatorioEntrenamientoEmailParams): Promise<void>;
export interface SendResumenSemanalEmailParams {
    to: string;
    alumnaNombre: string;
    entrenosCompletados: number;
    checkinsCumplidos: number;
    checkinsParciales: number;
    checkinsNoPude: number;
    racha: number;
    appName: string;
    appUrl?: string;
}
export declare function sendResumenSemanalEmail({ to, alumnaNombre, entrenosCompletados, checkinsCumplidos, checkinsParciales, checkinsNoPude, racha, appName, appUrl, }: SendResumenSemanalEmailParams): Promise<void>;
//# sourceMappingURL=send-coaching-emails.d.ts.map