import client from "@repo/db/client";
import { Request, Response, Router } from "express";
import { userMiddleware } from "../../middleware/user";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
} from "../../types";

export const spaceRouter = Router();

spaceRouter.post(
  "/",
  userMiddleware,
  async (request: Request, response: Response) => {
    const parsedData = CreateSpaceSchema.safeParse(request.body);
    if (!parsedData.success) {
      response.status(400).json({ message: "Validation failed" });
      return;
    }

    if (!parsedData.data.mapId) {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: parseInt(parsedData.data.dimensions.split("x")[0]),
          height: parseInt(parsedData.data.dimensions.split("x")[1]),
          creatorId: request.userId!,
        },
      });
      response.json({ spaceId: space.id });
      return;
    }

    const map = await client.map.findFirst({
      where: {
        id: parsedData.data.mapId,
      },
      select: {
        mapElements: true,
        width: true,
        height: true,
      },
    });

    if (!map) {
      response.status(400).json({ message: "Map not found" });
      return;
    }

    let space = await client.$transaction(async () => {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: map.width,
          height: map.height,
          creatorId: request.userId!,
        },
      });

      await client.spaceElements.createMany({
        data: map.mapElements.map((e) => ({
          spaceId: space.id,
          elementId: e.elementId,
          x: e.x!,
          y: e.y!,
        })),
      });

      return space;
    });

    response.json({ spaceId: space.id });
  }
);

spaceRouter.delete(
  "/element",
  userMiddleware,
  async (request: Request, response: Response) => {
    const parsedData = DeleteElementSchema.safeParse(request.body);
    if (!parsedData.success) {
      response.status(400).json({ message: "Validation failed" });
      return;
    }
    const spaceElement = await client.spaceElements.findFirst({
      where: {
        id: parsedData.data.id,
      },
      include: {
        space: true,
      },
    });

    if (
      !spaceElement?.space.creatorId ||
      spaceElement.space.creatorId !== request.userId
    ) {
      response.status(403).json({ message: "Unauthorized" });
      return;
    }
    await client.spaceElements.delete({
      where: {
        id: parsedData.data.id,
      },
    });
    response.json({ message: "Element deleted" });
  }
);

spaceRouter.delete(
  "/:spaceId",
  userMiddleware,
  async (request: Request, response: Response) => {
    const space = await client.space.findUnique({
      where: {
        id: request.params.spaceId,
      },
      select: {
        creatorId: true,
      },
    });
    if (!space) {
      response.status(400).json({ message: "Space not found" });
      return;
    }

    if (space.creatorId !== request.userId) {
      response.status(403).json({ message: "Unauthorized" });
      return;
    }

    await client.space.delete({
      where: {
        id: request.params.spaceId,
      },
    });
    response.json({ message: "Space deleted" });
  }
);

spaceRouter.get(
  "/all",
  userMiddleware,
  async (request: Request, response: Response) => {
    const spaces = await client.space.findMany({
      where: {
        creatorId: request.userId!,
      },
    });

    response.json({
      spaces: spaces.map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail,
        dimensions: `${s.width}x${s.height}`,
      })),
    });
  }
);

spaceRouter.post(
  "/element",
  userMiddleware,
  async (request: Request, response: Response) => {
    const parsedData = AddElementSchema.safeParse(request.body);
    if (!parsedData.success) {
      response.status(400).json({ message: "Validation failed" });
      return;
    }
    const space = await client.space.findUnique({
      where: {
        id: request.body.spaceId,
        creatorId: request.userId!,
      },
      select: {
        width: true,
        height: true,
      },
    });

    if (
      request.body.x < 0 ||
      request.body.y < 0 ||
      request.body.x > space?.width! ||
      request.body.y > space?.height!
    ) {
      response
        .status(400)
        .json({ message: "Point is outside of the boundary" });
      return;
    }

    if (!space) {
      response.status(400).json({ message: "Space not found" });
      return;
    }
    await client.spaceElements.create({
      data: {
        spaceId: request.body.spaceId,
        elementId: request.body.elementId,
        x: request.body.x,
        y: request.body.y,
      },
    });

    response.json({ message: "Element added" });
  }
);

spaceRouter.get("/:spaceId", async (request: Request, response: Response) => {
  const space = await client.space.findUnique({
    where: {
      id: request.params.spaceId,
    },
    include: {
      elements: {
        include: {
          element: true,
        },
      },
    },
  });

  if (!space) {
    response.status(400).json({ message: "Space not found" });
    return;
  }

  response.json({
    dimensions: `${space.width}x${space.height}`,
    elements: space.elements.map((e) => ({
      id: e.id,
      element: {
        id: e.element.id,
        imageUrl: e.element.imageUrl,
        width: e.element.width,
        height: e.element.height,
        static: e.element.static,
      },
      x: e.x,
      y: e.y,
    })),
  });
});
