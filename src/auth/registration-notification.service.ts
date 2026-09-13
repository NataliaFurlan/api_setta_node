import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

type TrainerRegistration = {
  idTreinador: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  nomeProfissional: string | null;
  cref: string | null;
};

@Injectable()
export class RegistrationNotificationService {
  private readonly logger = new Logger(RegistrationNotificationService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly config: ConfigService) {
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

  async notifyNewTrainer(data: TrainerRegistration): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        'Notificação não enviada: configure SMTP_HOST, SMTP_USER e SMTP_PASSWORD.',
      );
      return;
    }
    const recipient =
      this.config.get<string>('REGISTRATION_NOTIFICATION_EMAIL')?.trim() ||
      'equipe@varten.com.br';
    const portalUrl =
      this.config.get<string>('PORTAL_URL')?.trim() ||
      'https://admin-setta.varten.com.br';
    const escape = (value: string | null) =>
      (value || 'Não informado')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM')?.trim() || recipient,
        to: recipient,
        replyTo: data.email || undefined,
        subject: `Novo cadastro de treinador — ${data.nome}`,
        text: [
          'Uma nova solicitação de cadastro de treinador foi recebida.',
          `Nome: ${data.nome}`,
          `Nome profissional: ${data.nomeProfissional || 'Não informado'}`,
          `E-mail: ${data.email || 'Não informado'}`,
          `Celular: ${data.telefone || 'Não informado'}`,
          `CREF: ${data.cref || 'Não informado'}`,
          `Analisar cadastro: ${portalUrl}`,
        ].join('\n'),
        html: `<h2>Nova solicitação de treinador</h2><p><strong>Nome:</strong> ${escape(data.nome)}</p><p><strong>Nome profissional:</strong> ${escape(data.nomeProfissional)}</p><p><strong>E-mail:</strong> ${escape(data.email)}</p><p><strong>Celular:</strong> ${escape(data.telefone)}</p><p><strong>CREF:</strong> ${escape(data.cref)}</p><p><a href="${portalUrl}">Analisar cadastro no portal administrativo</a></p>`,
      });
    } catch (error) {
      this.logger.error(
        `Falha ao notificar cadastro ${data.idTreinador}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
