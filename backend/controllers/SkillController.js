import SkillService from '../services/SkillService.js';
import UserService from '../services/UserService.js';
import UserController from './UserController.js';

const SkillController = {
  createSkill: async (req, h) => {
    try {
        if(!req.payload.name || !req.payload.position){
            throw new Error('Name and position are required');
        }
      const SkillData = {
          name: req.payload.name,
          low: req.payload.low,
          medium: req.payload.medium,
          average: req.payload.average,
          high: req.payload.high,
          createdBy:req.auth.credentials.user.id,
          position:req.payload.position
      }
      const createdSkill = await SkillService.createSkill(SkillData);
      return h.response(`Skill ${createdSkill.name} created successfully!`).code(201);
    } catch (err) {
      return h.response({ error: err.message }).code(400);
    }
  },

  updateSkill: async (req, h) => {
try {
  const updatedSkill = await SkillService.updateSkill(req.payload);
  return h.response("Skill Updated Successfully!").code(200);
} catch (error) {
  return h.response({ error: error.message }).code(400);
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
      const userId = req.auth.credentials.user.id;
      const user = await UserService.getUserById(userId);
      const skill = await SkillService.getSkillByPosition(user.positionId);
      return h.response(skill).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(404);
    }
  },
  getSkillsWithUpgradeGuides: async (req, h) => {
    try {
      const skills = await SkillService.getSkillsWithUpgradeGuides();
      return h.response(skills).code(200);
    } catch (err) {
      console.error(err);
      return h.response({ error: err.message }).code(500);
    }
  }
};

export default SkillController;
