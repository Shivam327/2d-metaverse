import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

export const adminMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const header = request.headers["authorization"];
  const token = header?.split(" ")[1];

  if (!token) {
    response.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as {
      role: string;
      userId: string;
    };
    if (decoded.role !== "Admin") {
      response.status(403).json({ message: "Unauthorized" });
      return;
    }
    request.userId = decoded.userId;
    next();
  } catch (e) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }
};
