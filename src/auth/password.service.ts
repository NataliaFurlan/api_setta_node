import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import { createHmac } from 'node:crypto';
@Injectable()
export class PasswordService {
  static readonly PREFIX = '{bcrypt-pepper-v1}';
  private readonly pepper: string;
  constructor(config: ConfigService) {
    this.pepper = config.getOrThrow<string>('PASSWORD_PEPPER');
  }
  async encode(raw: string) {
    return PasswordService.PREFIX + (await hash(this.peppered(raw), 12));
  }
  async matches(raw: string, encoded: string) {
    if (encoded.startsWith(PasswordService.PREFIX))
      return compare(
        this.peppered(raw),
        encoded.slice(PasswordService.PREFIX.length),
      );
    return encoded.startsWith('$2') && compare(raw, encoded);
  }
  needsUpgrade(encoded: string) {
    return !encoded.startsWith(PasswordService.PREFIX);
  }
  private peppered(raw: string) {
    return createHmac('sha256', this.pepper).update(raw).digest('base64');
  }
}
