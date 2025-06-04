import { AppDataSource } from "../config/dataSource.js";
import { Position } from "../entities/Position.js";
import { Skill } from "../entities/Skill.js";

const skillRepo = AppDataSource.getRepository(Skill);

const SkillService = {
  createSkill: async (skillData) => {
    try {
      // Reset sequence to ensure proper ID generation
      await AppDataSource.query(`
        SELECT setval(
          pg_get_serial_sequence('skills', 'id'),
          (SELECT COALESCE(MAX(id), 0) FROM skills)
        )
      `);

      // Check if skill already exists
      const existingSkill = await skillRepo.findOneBy({ name: skillData.name });
      if (existingSkill) {
        throw new Error("Skill already exists");
      }

      // Create and save new skill
      const newSkill = skillRepo.create(skillData);
      return await skillRepo.save(newSkill);
    } catch (error) {
      throw new Error(`Failed to create skill: ${error.message}`);
    }
  },

  updateSkill: async (updateData) => {
    try {
      const { id } = updateData;
      const skill = await skillRepo.findOneBy({ id });
      if (!skill) {
        throw new Error("Skill not found");
      }

      // Check if name is being updated and if it conflicts with existing skill
      if (updateData.name && updateData.name !== skill.name) {
        const existingSkill = await skillRepo.findOneBy({
          name: updateData.name,
        });
        if (existingSkill) {
          throw new Error("Skill name already exists");
        }
      }

      // Merge and save updates
      skillRepo.merge(skill, updateData);
      return await skillRepo.save(skill);
    } catch (error) {
      throw new Error(`Failed to update skill: ${error.message}`);
    }
  },

  deleteSkillById: async (id) => {
    try {
      const skill = await skillRepo.findOneBy({ id });
      if (!skill) {
        throw new Error("Skill not found");
      }

      return await skillRepo.remove(skill);
    } catch (error) {
      throw new Error(`Failed to delete skill: ${error.message}`);
    }
  },

  getAllSkills: async () => {
    try {
      return await skillRepo.find({
        order: { id: "ASC" },
      });
    } catch (error) {
      throw new Error(`Failed to retrieve skills: ${error.message}`);
    }
  },

  getSkillById: async (id) => {
    try {
      const skill = await skillRepo.findOneBy({ id });
      if (!skill) {
        throw new Error("Skill not found");
      }
      return skill;
    } catch (error) {
      throw new Error(`Failed to retrieve skill: ${error.message}`);
    }
  },

  getSkillByPosition: async (position) => {
    try {
      const skills = await skillRepo
        .createQueryBuilder("skill")
        .where(":position = ANY(skill.position)", { position })
        .orderBy("skill.id", "ASC")
        .getMany()

      if (!skills.length) {
        throw new Error("No skills found for this position");
      }
      return skills;
    } catch (error) {
      throw new Error(
        `Failed to retrieve skills by position: ${error.message}`
      );
    }
  },

  getSkillsWithUpgradeGuides: async () => {
    try {
      return await skillRepo.find({
        relations: ["upgradeGuides"],
        order: { name: "ASC" },
      });
    } catch (error) {
      throw new Error(
        `Failed to retrieve skills with upgrade guides: ${error.message}`
      );
    }
  },

  searchSkills: async (searchTerm) => {
    try {
      return await skillRepo
        .createQueryBuilder("skill")
        .where("skill.name ILIKE :searchTerm", {
          searchTerm: `%${searchTerm}%`,
        })
        .orderBy("skill.name", "ASC")
        .getMany();
    } catch (error) {
      throw new Error(`Failed to search skills: ${error.message}`);
    }
  },
};

export default SkillService;
