import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";

export const router = Router();

router.get("/signup", (request, response) => {
  response.json({
    message: "signup",
  });
});

router.get("/signin", (request, response) => {
  response.json({
    message: "signin",
  });
});

router.get("/elements", (request, response) => {});

router.get("/avatars", (request, response) => {});

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
