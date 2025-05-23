import {AppDataSource} from "./config/dataSource.js";
import { User } from "./entities/User.js";
import { Skill } from "./entities/Skill.js";
import { SkillUpgradeGuide } from "./entities/SkillUpgradeGuide.js";
import skillData from "./data/skill.js";
import userData from "./data/user.js";
import upgradeGuideData from "./data/upgradeguide.js";

const users = userData;
const skills = skillData;
const upgradeGuides = upgradeGuideData;

export async function seedInitialData() {
  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const guideRepo = AppDataSource.getRepository(SkillUpgradeGuide);

  // Insert users
  for (const user of users) {
    await userRepo.save(user);
  }

  // Insert skills
  for (const skill of skills) {
    await skillRepo.save(skill);
  }

  // Insert upgrade guides
  for (const guide of upgradeGuides) {
    await guideRepo.save(guide);
  }

  console.log("Data seeding complete!");
}
