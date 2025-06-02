import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import { AppDataSource } from "./config/dataSource.js";
import userRoutes from "./routes/UserRoute.js";
import skillRoutes from "./routes/SkillRoute.js";
import guideRoutes from "./routes/skillUpgradeGuideRoute.js";
import requestRoutes from "./routes/SkillUpdateRequestRoute.js";
import Jwt from "@hapi/jwt";
import authRoutes from "./routes/AuthRoute.js";
import cors from 'cors';

dotenv.config();


const init = async () => {
  await AppDataSource.initialize();
  console.log("Database connected");

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
    routes: {
    cors: {
      origin: ['http://localhost:8080'], 
    }
  }
  });

  await server.register(Jwt);

  
  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
    },
    validate: async (artifacts, request, h) => {
      return {
        isValid: true,
        credentials: { user: artifacts.decoded.payload },
      };
    },
  });
  
  server.auth.default("jwt");
  
  await server.register({
    plugin: userRoutes,
    options: {},
    routes: {
      prefix: "/api/users",
    },
  });
  
  await server.register({
    plugin: guideRoutes,
    options: {},
    routes: {
      prefix: "/api/guides",
    },
  });

  await server.register({
    plugin: skillRoutes,
    options: {},
    routes: {
      prefix: "/api/skills",
    },
  });

  await server.register({
    plugin: requestRoutes,
    options: {},
    routes: {
      prefix: "/api/requests",
    },
  });
  await server.register({
    plugin: authRoutes,
    options: {},
    routes: {
      prefix: "/api/auth",
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
