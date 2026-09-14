import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailEnvio } from '../database/entities/email-envio.entity';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EmailEnvio])],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
