import { Response } from "express";

export const ok = (res: Response, data: unknown, message = "OK") =>
  res.status(200).json({ success: true, message, data });

export const created = (res: Response, data: unknown, message = "Created") =>
  res.status(201).json({ success: true, message, data });

export const paginated = (
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) =>
  res.status(200).json({
    success: true,
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });

export const notFound = (res: Response, message = "Not found") =>
  res.status(404).json({ success: false, message });

export const forbidden = (res: Response, message = "Forbidden") =>
  res.status(403).json({ success: false, message });

export const badRequest = (res: Response, message = "Bad request") =>
  res.status(400).json({ success: false, message });
