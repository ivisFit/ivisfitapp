export interface SendPasswordResetEmailParams {
    to: string;
    resetUrl: string;
    appName: string;
}
export declare function sendPasswordResetEmail({ to, resetUrl, appName, }: SendPasswordResetEmailParams): Promise<void>;
//# sourceMappingURL=send-password-reset-email.d.ts.map