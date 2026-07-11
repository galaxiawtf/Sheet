import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "../_core/context";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.all("*", async (req, res, next) => {
  try {
    const middleware = createExpressMiddleware({
      router: appRouter,
      createContext,
    });

    // Dynamically create a sub-app with multiple mount points so that tRPC
    // can correctly extract the procedure path regardless of Vercel rewrites.
    const routerApp = express();
    routerApp.use("/api/trpc", middleware);
    routerApp.use("/api/index", middleware);
    routerApp.use("/api", middleware);
    routerApp.use("/", middleware);

    return routerApp(req, res, next);
  } catch (error: any) {
    console.error("Vercel API Gateway Error:", error);
    res.status(500).json({
      error: {
        message: "Failed to initialize serverless function",
        details: error.message || String(error),
        stack: error.stack
      }
    });
  }
});

export default app;
