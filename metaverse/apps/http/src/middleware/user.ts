import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

export const userMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const header = request.headers["authorization"];
  const token = header?.split(" ")[1];
  request.route.path;
  token;

  if (!token) {
    response.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as {
      role: string;
      userId: string;
    };
    request.userId = decoded.userId;
    next();
  } catch (e) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }
};
