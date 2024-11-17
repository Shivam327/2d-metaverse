import { Router } from "express";

export const userRouter = Router();

userRouter.post("metadata", (request, response) => {});

userRouter.post("/metadata/bulk", (request, response) => {});
