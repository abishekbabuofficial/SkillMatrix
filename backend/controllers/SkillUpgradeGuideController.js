import SkillUpgradeGuideService from '../services/SkillUpgradeGuideService.js';

const SkillUpgradeGuideController = {
  getGuide: async (req, h) => {
    try {
      const { skillId, fromLevel, toLevel } = req.payload;
      const guide = await SkillUpgradeGuideService.getGuide(skillId, fromLevel, toLevel);
      if (!guide) return h.response({ error: 'Guide not found' }).code(404);
      return h.response(guide).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  createGuide: async (req, h) => {
    try {
        if (!req.payload.skillId || !req.payload.fromLevel || !req.payload.toLevel)
        return h.response({error: 'Skill Id, fromLevel and toLevel are required'}).code(400);
      const newGuide = await SkillUpgradeGuideService.createGuide(req.payload);
      return h.response("New Guide Created successfully!").code(201);
    } catch (err) {
      return h.response({ error: err.message }).code(400);
    }
  },

  updateGuide: async (req, h) => {
    try {
      const updated = await SkillUpgradeGuideService.updateGuide(req.payload);
      return h.response(updated).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(404);
    }
  },

  getAllGuidesBySkillId: async (req, h) => {
    try {
      const guides = await SkillUpgradeGuideService.getAllGuidesBySkillId(req.params.skillId);
      return h.response(guides).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  }
};

export default SkillUpgradeGuideController;
