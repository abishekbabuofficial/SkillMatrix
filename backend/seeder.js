import {AppDataSource} from "./config/dataSource.js";
import { User } from "./entities/User.js";
import { Skill } from "./entities/Skill.js";
import { SkillUpgradeGuide } from "./entities/SkillUpgradeGuide.js";
import skillData from "./data/skill.js";
import userData from "./data/user.js";
import upgradeGuideData from "./data/upgradeguide.js";
import { Role } from "./entities/Role.js";
import { Position } from "./entities/Position.js";
import { Team } from "./entities/Team.js";
import { Auth } from "./entities/Auth.js";
import role from './data/role.js';
import position from './data/position.js';
import team from './data/team.js';
import auth from './data/auth.js';

const users = userData;
const skills = skillData;
const upgradeGuides = upgradeGuideData;

export async function seedInitialData() {
  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const guideRepo = AppDataSource.getRepository(SkillUpgradeGuide);
  const roles = AppDataSource.getRepository(Role);
  const positions = AppDataSource.getRepository(Position);
  const teams = AppDataSource.getRepository(Team);
  const auths = AppDataSource.getRepository(Auth);


  // Insert users
    await userRepo.save(userRepo.create(users));

  // // Insert skills
  //   await skillRepo.save(skillRepo.create(skills));

  // // // Insert roles
  // await roles.save(roles.create(role));

  // // // Insert positions
  // await positions.save(positions.create(position));

  // // // Insert teams
  // await teams.save(teams.create(team));

  // // Insert auths
  // await auths.save(auths.create(auth));

  // // Insert upgrade guides
  //   await guideRepo.save(guideRepo.create(upgradeGuides));

  console.log("Data seeding complete!");
}
