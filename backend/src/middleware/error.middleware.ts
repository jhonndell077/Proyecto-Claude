import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
};
