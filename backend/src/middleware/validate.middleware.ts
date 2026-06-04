import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(422).json({ success: false, message: "Datos inválidos", errors });
    }
    req[source] = result.data;
    next();
  };
