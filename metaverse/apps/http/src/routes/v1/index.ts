import { Router } from "express";

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
