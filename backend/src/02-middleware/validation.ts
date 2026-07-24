import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import AppError from "../utils/AppError.js";

const validate =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(new AppError(400, result.error.issues[0].message));
    }

    req.body = result.data;

    next();
  };

export default validate;
