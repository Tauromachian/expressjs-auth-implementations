import express from "express";
import cookieParser from "cookie-parser";
import createError from "http-errors";

import logger from "./middlewares/pino-http.mjs";

import { jwtRouter } from "./routes/jwt.mjs";
import { errorHandler } from "./middlewares/errorHandler.mjs";

import { config } from "dotenv";

config();

let app = express();

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/auth", jwtRouter);

// catch 404 and forward to error handler
app.use((_1, _2, next) => {
  next(createError(404));
});

app.use(errorHandler);

export default app;
