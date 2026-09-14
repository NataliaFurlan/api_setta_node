import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

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
  constructor(
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async notifyNewTrainer(data: TrainerRegistration): Promise<void> {
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

    await this.mail.send({
      tipo: 'CADASTRO_TREINADOR',
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
  }
}
