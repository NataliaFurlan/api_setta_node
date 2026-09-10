import { SetMetadata } from '@nestjs/common';
import { TipoUsuario } from '../database/entities/usuario.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TipoUsuario[]) => SetMetadata(ROLES_KEY, roles);
