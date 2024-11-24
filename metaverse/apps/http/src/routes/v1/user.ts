import client from "@repo/db/client";
import { Request, Response, Router } from "express";
import { userMiddleware } from "../../middleware/user";
import { UpdateMetadataSchema } from "../../types";

export const userRouter = Router();

userRouter.post(
  "/metadata",
  userMiddleware,
  async (request: Request, response: Response) => {
    const parsedData = UpdateMetadataSchema.safeParse(request.body);
    if (!parsedData.success) {
      response.status(400).json({ message: "Validation failed" });
      return;
    }
    try {
      await client.user.update({
        where: {
          id: request.userId,
        },
        data: {
          avatarId: parsedData.data.avatarId,
        },
      });
      response.json({ message: "Metadata updated" });
    } catch (e) {
      response.status(400).json({ message: "Internal server error" });
    }
  }
);

userRouter.get(
  "/metadata/bulk",
  async (request: Request, response: Response) => {
    const userIdString = (request.query.ids ?? "[]") as string;
    const userIds = userIdString.slice(1, userIdString?.length - 1).split(",");

    const metadata = await client.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        avatar: true,
        id: true,
      },
    });

    response.json({
      avatars: metadata.map((m) => ({
        userId: m.id,
        avatarId: m.avatar?.imageUrl,
      })),
    });
  }
);
