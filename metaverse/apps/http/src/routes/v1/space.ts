import { Router } from "express";

export const spaceRouter = Router();

spaceRouter.post("/", (request, response) => {});

spaceRouter.delete("/:spaceId", (request, response) => {});

spaceRouter.get("/all", (request, response) => {});

spaceRouter.post("/element", (request, response) => {});

spaceRouter.delete("/element", (request, response) => {});

spaceRouter.get("/:spaceId", (request, response) => {});
