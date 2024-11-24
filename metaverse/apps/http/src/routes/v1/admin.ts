import client from "@repo/db/client";
import { Request, Response, Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "../../types";

export const adminRouter = Router();

adminRouter.use(adminMiddleware);

adminRouter.post("/element", async (request: Request, response: Response) => {
  const parsedData = CreateElementSchema.safeParse(request.body);
  if (!parsedData.success) {
    response.status(400).json({ message: "Validation failed" });
    return;
  }

  const element = await client.element.create({
    data: {
      width: parsedData.data.width,
      height: parsedData.data.height,
      static: parsedData.data.static,
      imageUrl: parsedData.data.imageUrl,
    },
  });

  response.json({
    id: element.id,
  });
});

adminRouter.put(
  "/element/:elementId",
  (request: Request, response: Response) => {
    const parsedData = UpdateElementSchema.safeParse(request.body);
    if (!parsedData.success) {
      response.status(400).json({ message: "Validation failed" });
      return;
    }
    client.element.update({
      where: {
        id: request.params.elementId,
      },
      data: {
        imageUrl: parsedData.data.imageUrl,
      },
    });
    response.json({ message: "Element updated" });
  }
);

adminRouter.post("/avatar", async (request: Request, response: Response) => {
  const parsedData = CreateAvatarSchema.safeParse(request.body);
  if (!parsedData.success) {
    response.status(400).json({ message: "Validation failed" });
    return;
  }
  const avatar = await client.avatar.create({
    data: {
      name: parsedData.data.name,
      imageUrl: parsedData.data.imageUrl,
    },
  });
  response.json({ avatarId: avatar.id });
});

adminRouter.post("/map", async (request: Request, response: Response) => {
  const parsedData = CreateMapSchema.safeParse(request.body);
  if (!parsedData.success) {
    response.status(400).json({ message: "Validation failed" });
    return;
  }
  const map = await client.map.create({
    data: {
      name: parsedData.data.name,
      width: parseInt(parsedData.data.dimensions.split("x")[0]),
      height: parseInt(parsedData.data.dimensions.split("x")[1]),
      thumbnail: parsedData.data.thumbnail,
      mapElements: {
        create: parsedData.data.defaultElements.map((e) => ({
          elementId: e.elementId,
          x: e.x,
          y: e.y,
        })),
      },
    },
  });

  response.json({
    id: map.id,
  });
});
