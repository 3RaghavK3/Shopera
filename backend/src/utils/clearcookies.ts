import type { Response } from "express";

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
}