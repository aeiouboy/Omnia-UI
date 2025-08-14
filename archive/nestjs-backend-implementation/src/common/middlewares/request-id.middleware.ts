import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';
import short from 'short-uuid';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const translator = short();

    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = translator.fromUUID(uuidv4());
    }

    res.setHeader('x-request-id', req.headers['x-request-id']);

    next();
  }
}
