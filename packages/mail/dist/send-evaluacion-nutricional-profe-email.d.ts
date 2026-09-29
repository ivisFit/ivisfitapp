export interface SendEvaluacionNutricionalProfeEmailParams {
    to: string;
    alumnaNombre: string;
    objetivoLabel: string;
    alumnaId: string;
    appName: string;
    appUrl?: string;
}
export declare function sendEvaluacionNutricionalProfeEmail({ to, alumnaNombre, objetivoLabel, alumnaId, appName, appUrl, }: SendEvaluacionNutricionalProfeEmailParams): Promise<void>;
//# sourceMappingURL=send-evaluacion-nutricional-profe-email.d.ts.map