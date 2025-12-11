import { Router } from "express";

import { authDto } from "../dtos/auth.dto.mjs";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    var { email, password } = authDto.parse(req);
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
});
