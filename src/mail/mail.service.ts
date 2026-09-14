import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import nodemailer, { Transporter } from 'nodemailer';
import { Repository } from 'typeorm';
import {
  EmailEnvio,
  StatusEmailEnvio,
} from '../database/entities/email-envio.entity';

export type SendEmailInput = {
  tipo: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(EmailEnvio)
    private readonly deliveries: Repository<EmailEnvio>,
  ) {
    const host = config.get<string>('SMTP_HOST');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASSWORD');
    this.transporter =
      host && user && pass
        ? nodemailer.createTransport({
            host,
            port: config.get<number>('SMTP_PORT') ?? 465,
            secure: config.get<string>('SMTP_SECURE') !== 'false',
            auth: { user, pass },
          })
        : null;
  }

  async send(input: SendEmailInput) {
    let delivery: EmailEnvio | null = null;
    let status = StatusEmailEnvio.PENDENTE;
    try {
      delivery = await this.deliveries.save(
        this.deliveries.create({
          tipo: input.tipo,
          destinatario: input.to,
          assunto: input.subject,
          status: StatusEmailEnvio.PENDENTE,
          tentativas: 0,
        }),
      );
    } catch (error) {
      this.logger.error(
        'Não foi possível registrar a tentativa de e-mail. Verifique a migration 005_email_deliveries.sql.',
        error instanceof Error ? error.stack : String(error),
      );
    }
    if (!this.transporter) {
      if (delivery) {
        delivery.status = StatusEmailEnvio.FALHA;
        delivery.ultimoErro = 'SMTP não configurado.';
        await this.saveDelivery(delivery);
      }
      this.logger.warn(
        `E-mail ${delivery?.idEmail ?? 'sem registro'} não enviado: SMTP não configurado.`,
      );
      return {
        idEmail: delivery?.idEmail ?? null,
        status: StatusEmailEnvio.FALHA,
      };
    }
    try {
      if (delivery) delivery.tentativas += 1;
      const result = await this.transporter.sendMail({
        from:
          this.config.get<string>('SMTP_FROM')?.trim() ||
          this.config.getOrThrow<string>('SMTP_USER'),
        to: input.to,
        replyTo: input.replyTo,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
      if (delivery) {
        delivery.status = StatusEmailEnvio.ENVIADO;
        delivery.idProvedor = result.messageId;
        delivery.enviadoEm = new Date();
        delivery.ultimoErro = null;
      }
      status = StatusEmailEnvio.ENVIADO;
    } catch (error) {
      status = StatusEmailEnvio.FALHA;
      const message =
        error instanceof Error
          ? error.message.slice(0, 2000)
          : String(error).slice(0, 2000);
      if (delivery) {
        delivery.status = StatusEmailEnvio.FALHA;
        delivery.ultimoErro = message;
      }
      this.logger.error(
        `Falha no envio ${delivery?.idEmail ?? 'sem registro'}: ${message}`,
      );
    }
    if (delivery) await this.saveDelivery(delivery);
    return {
      idEmail: delivery?.idEmail ?? null,
      status: delivery?.status ?? status,
    };
  }

  private async saveDelivery(delivery: EmailEnvio) {
    try {
      await this.deliveries.save(delivery);
    } catch (error) {
      this.logger.error(
        `Não foi possível atualizar o e-mail ${delivery.idEmail}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
