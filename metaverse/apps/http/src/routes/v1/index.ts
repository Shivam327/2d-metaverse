import client from "@repo/db/client";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config";
import { compare, hash } from "../../scrypt";
import { SigninSchema, SignupSchema } from "../../types";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { userRouter } from "./user";

export const router = Router();

router.post("/signup", async (request: Request, response: Response) => {
  // check the user
  const parsedData = SignupSchema.safeParse(request.body);
  if (!parsedData.success) {
    response.status(400).json({ message: "Validation failed" });
    return;
  }

  const hashedPassword = await hash(parsedData.data.password);

  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });
    response.json({
      userId: user.id,
    });
  } catch (e) {
    response.status(400).json({ message: "User already exists" });
  }
});

router.post("/signin", async (request: Request, response: Response) => {
  const parsedData = SigninSchema.safeParse(request.body);
  if (!parsedData.success) {
    response.status(403).json({ message: "Validation failed" });
    return;
  }

  try {
    const user = await client.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!user) {
      response.status(403).json({ message: "User not found" });
      return;
    }
    const isValid = await compare(parsedData.data.password, user.password);

    if (!isValid) {
      response.status(403).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_PASSWORD
    );

    response.json({
      token,
    });
  } catch (e) {
    response.status(400).json({ message: "Internal server error" });
  }
});

router.get("/elements", async (request: Request, response: Response) => {
  const elements = await client.element.findMany();

  response.json({
    elements: elements.map((e) => ({
      id: e.id,
      imageUrl: e.imageUrl,
      width: e.width,
      height: e.height,
      static: e.static,
    })),
  });
});

router.get("/avatars", async (request: Request, response: Response) => {
  const avatars = await client.avatar.findMany();
  response.json({
    avatars: avatars.map((x) => ({
      id: x.id,
      imageUrl: x.imageUrl,
      name: x.name,
    })),
  });
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
