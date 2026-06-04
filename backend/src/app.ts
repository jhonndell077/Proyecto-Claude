import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import env from "./config/env";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

app.use("/api", routes);
app.use(errorMiddleware);

export default app;
