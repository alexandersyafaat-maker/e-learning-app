import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '@/utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

function flattenZodErrors(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path.join('.') || '_root';
    acc[key] = issue.message;
    return acc;
  }, {});
}

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = flattenZodErrors(result.error);
      next(AppError.validation(errors));
      return;
    }

    // Express types req.body as `any` by design; result.data is the Zod-validated replacement.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    req[target] = result.data;
    next();
  };
}
