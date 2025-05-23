import SkillService from '../services/SkillService.js';

const SkillController = {
  createSkill: async (req, h) => {
    try {
        if(!req.payload.name || !req.payload.position){
            throw new Error('Name and position are required');
        }
      const createdSkill = await SkillService.createSkill(req.payload);
      return h.response(`Skill ${createdSkill.name} created successfully!`).code(201);
    } catch (err) {
      return h.response({ error: err.message }).code(400);
    }
  },

  deleteSkillById: async (req, h) => {
    try {
      const deletedSkill = await SkillService.deleteSkillById(req.params.id);
      return h.response(`Skill ${deletedSkill.name} deleted successfully!`).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(404);
    }
  },

  getAllSkills: async (req, h) => {
    try {
      const skills = await SkillService.getAllSkills();
      return h.response(skills).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getSkillById: async (req, h) => {
    try {
      const skill = await SkillService.getSkillById(req.params.id);
      if (!skill) return h.response({ error: 'Skill not found' }).code(404);
      return h.response(skill).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getSkillByPosition: async (req, h) => {
    try {
      const skill = await SkillService.getSkillByPosition(req.params.position);
      return h.response(skill).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(404);
    }
  }
};

export default SkillController;
