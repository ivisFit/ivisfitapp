export interface SendOtpEmailParams {
    to: string;
    code: string;
    appName: string;
}
export declare function sendOtpEmail({ to, code, appName, }: SendOtpEmailParams): Promise<void>;
//# sourceMappingURL=send-otp-email.d.ts.map