import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User.js";
import { Skill } from "../entities/Skill.js";
import { AssessmentRequest } from "../entities/AssessmentRequest.js";
import { SkillUpgradeGuide } from "../entities/SkillUpgradeGuide.js";
import { Role } from "../entities/Role.js";
import { Score } from "../entities/Score.js";
import { Team } from "../entities/Team.js";
import { Position } from "../entities/Position.js";
import { Auth } from "../entities/Auth.js";
import { Audit } from "../entities/Audit.js";

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
    Auth,
    Skill,
    AssessmentRequest,
    SkillUpgradeGuide,
    Role,
    Score,
    Team,
    Position,
    User,
    Audit
  ],
});
