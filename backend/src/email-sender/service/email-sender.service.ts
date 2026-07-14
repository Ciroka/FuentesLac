import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailSenderService {
    private from!: string;
    private transporter!: nodemailer.Transporter;

    constructor(
        configService: ConfigService
    ) {
        this.from = configService.get('SMTP_FROM')!;
        this.transporter = nodemailer.createTransport({
            port: Number(configService.get('SMTP_PORT')!),
            host: configService.get('SMTP_HOST')!,
            auth: {
                user: configService.get('SMTP_USER')!,
                pass: configService.get("SMTP_PASS")!
            },
            tls: {
                rejectUnauthorized: configService.get('NODE_ENV') === 'production'
            },
            secure: false
        });
    }

    async sendResetCode(to: string, code: string): Promise<void> {
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        await this.transporter.sendMail({
            from: this.from,
            to,
            subject: 'Código para restablecer tu contraseña',
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h2>Restablecer contraseña</h2>
                    <p>Usá este código para continuar. Vence en 15 minutos.</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${escapedCode}</p>
                </div>
            `,
        });
    }
}
