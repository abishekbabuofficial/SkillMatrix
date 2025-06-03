import { AppDataSource } from "../config/dataSource.js";
import { SkillUpgradeGuide } from "../entities/SkillUpgradeGuide.js";
import { Skill } from "../entities/Skill.js";

const skillUpgradeGuideRepo = AppDataSource.getRepository(SkillUpgradeGuide);
const skillRepo = AppDataSource.getRepository(Skill);

const SkillUpgradeGuideService = {
  getGuide: async (skillId, fromLevel, toLevel) => {
    try {
      const guide = await skillUpgradeGuideRepo.findOne({
        where: { skillId: skillId, fromLevel: fromLevel, toLevel: toLevel },
        relations: ["skill"],
      });

      if (!guide) {
        throw new Error("Guide not found");
      }

      return guide;
    } catch (error) {
      throw new Error(`Failed to retrieve guide: ${error.message}`);
    }
  },

  createGuide: async (data) => {
    try {
      await AppDataSource.query(`
        SELECT setval(
          pg_get_serial_sequence('skill_upgrade_guide', 'id'),
          (SELECT COALESCE(MAX(id), 0) FROM skill_upgrade_guide)
        )
      `);

      // Validate that the skill exists
      const skill = await skillRepo.findOneBy({ id: data.skillId });
      if (!skill) {
        throw new Error("Skill not found");
      }

      // Check if guide already exists for this skill and level combination
      const existingGuide = await skillUpgradeGuideRepo.findOne({
        where: {
          skillId: data.skillId,
          fromLevel: data.fromLevel,
          toLevel: data.toLevel,
        },
      });

      if (existingGuide) {
        throw new Error(
          "Guide already exists for this skill and level combination"
        );
      }

      // Validate level progression
      if (data.fromLevel >= data.toLevel) {
        throw new Error("From level must be less than to level");
      }

      const newGuide = skillUpgradeGuideRepo.create(data);
      return await skillUpgradeGuideRepo.save(newGuide);
    } catch (error) {
      throw new Error(`Failed to create guide: ${error.message}`);
    }
  },

  updateGuide: async (id, updateData) => {
    try {
      const guide = await skillUpgradeGuideRepo.findOne({
        where: { id },
        relations: ["skill"],
      });

      if (!guide) {
        throw new Error("Guide not found");
      }

      // If updating skill ID, validate the new skill exists
      if (updateData.skillId && updateData.skillId !== guide.skillId) {
        const skill = await skillRepo.findOneBy({ id: updateData.skillId });
        if (!skill) {
          throw new Error("New skill not found");
        }
      }

      // Validate level progression if levels are being updated
      const fromLevel = updateData.fromLevel || guide.fromLevel;
      const toLevel = updateData.toLevel || guide.toLevel;

      if (fromLevel >= toLevel) {
        throw new Error("From level must be less than to level");
      }

      // Check for conflicts if key fields are being updated
      if (updateData.skillId || updateData.fromLevel || updateData.toLevel) {
        const conflictGuide = await skillUpgradeGuideRepo.findOne({
          where: {
            skillId: updateData.skillId || guide.skillId,
            fromLevel: updateData.fromLevel || guide.fromLevel,
            toLevel: updateData.toLevel || guide.toLevel,
          },
        });

        if (conflictGuide && conflictGuide.id !== id) {
          throw new Error(
            "Another guide already exists for this skill and level combination"
          );
        }
      }

      skillUpgradeGuideRepo.merge(guide, updateData);
      return await skillUpgradeGuideRepo.save(guide);
    } catch (error) {
      throw new Error(`Failed to update guide: ${error.message}`);
    }
  },

  deleteGuide: async (id) => {
    try {
      const guide = await skillUpgradeGuideRepo.findOneBy({ id });
      if (!guide) {
        throw new Error("Guide not found");
      }

      return await skillUpgradeGuideRepo.remove(guide);
    } catch (error) {
      throw new Error(`Failed to delete guide: ${error.message}`);
    }
  },

  getAllGuidesBySkillId: async (skillId) => {
    try {
      // Validate that the skill exists
      const skill = await skillRepo.findOneBy({ id: skillId });
      if (!skill) {
        throw new Error("Skill not found");
      }

      const guides = await skillUpgradeGuideRepo.find({
        where: { skillId: skillId },
        relations: ["skill"],
        order: { fromLevel: "ASC", toLevel: "ASC" },
      });

      return guides;
    } catch (error) {
      throw new Error(`Failed to retrieve guides for skill: ${error.message}`);
    }
  },

  getAllGuides: async () => {
    try {
      return await skillUpgradeGuideRepo.find({
        relations: ["skill"],
        order: { skillId: "ASC", fromLevel: "ASC", toLevel: "ASC" },
      });
    } catch (error) {
      throw new Error(`Failed to retrieve all guides: ${error.message}`);
    }
  },

  getGuidesByLevelRange: async (skillId, currentLevel) => {
    try {
      const skill = await skillRepo.findOneBy({ id: skillId });
      if (!skill) {
        throw new Error("Skill not found");
      }

      const guides = await skillUpgradeGuideRepo.find({
        where: { skillId: skillId, fromLevel: currentLevel },
        relations: ["skill"],
        order: { toLevel: "ASC" },
      });

      return guides;
    } catch (error) {
      throw new Error(
        `Failed to retrieve guides for level range: ${error.message}`
      );
    }
  },

  getGuideById: async (id) => {
    try {
      const guide = await skillUpgradeGuideRepo.findOne({
        where: { id },
        relations: ["skill"],
      });

      if (!guide) {
        throw new Error("Guide not found");
      }

      return guide;
    } catch (error) {
      throw new Error(`Failed to retrieve guide: ${error.message}`);
    }
  },
};

export default SkillUpgradeGuideService;
