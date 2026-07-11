import { Role } from '@/modules/auth/user.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      role: Role;
      name: string;
      email: string;
      kelasId?: string;
    };
  }
}
