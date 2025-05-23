import { AppDataSource } from "../config/dataSource.js";
import { Skill } from "../entities/Skill.js";

const skillRepo = AppDataSource.getRepository(Skill);

const SkillService = {
  createSkill: async (skill) => {
    await AppDataSource.query(`
  SELECT setval(
    pg_get_serial_sequence('skills', 'id'),
    (SELECT COALESCE(MAX(id), 0) FROM skills)
  )
`);

    if (await skillRepo.findOneBy({ name: skill.name })) {
      throw new Error("Skill already exists");
    }
    const newSkill = skillRepo.create(skill);
    return await skillRepo.save(newSkill);
  },
  deleteSkillById: async (id) => {
    const skill = await skillRepo.findOneBy({ id });
    if (!skill) throw new Error("Skill not found");
    return await skillRepo.remove(skill);
  },
  getAllSkills: async () => {
    return await skillRepo.find();
  },
  getSkillById: async (id) => {
    return await skillRepo.findOneBy({ id });
  },
  getSkillByPosition: async (position) => {
    const skill = await skillRepo
      .createQueryBuilder("skill")
      .where(":position = ANY(skill.position)", { position })
      .getMany();

    if (!skill.length) throw new Error("Skill not found");
    return skill;
  },
};

export default SkillService;
