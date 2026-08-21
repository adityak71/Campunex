import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@campunex/shared';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Access restricted to roles: [${allowedRoles.join(', ')}]`,
      });
      return;
    }

    next();
  };
}
