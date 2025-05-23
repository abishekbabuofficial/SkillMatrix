import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User.js";
import { Skill } from "../entities/Skill.js";
import { SkillUpdateRequest } from "../entities/SkillUpdateRequest.js";
import { SkillUpgradeGuide } from "../entities/SkillUpgradeGuide.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [
    User,
    Skill,
    SkillUpdateRequest,
    SkillUpgradeGuide,
  ],
});
