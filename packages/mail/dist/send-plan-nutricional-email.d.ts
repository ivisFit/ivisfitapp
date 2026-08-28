export interface SendPlanNutricionalEmailParams {
    to: string;
    alumnaNombre: string;
    appName: string;
    appUrl?: string;
}
export declare function sendPlanNutricionalEmail({ to, alumnaNombre, appName, appUrl, }: SendPlanNutricionalEmailParams): Promise<void>;
//# sourceMappingURL=send-plan-nutricional-email.d.ts.map