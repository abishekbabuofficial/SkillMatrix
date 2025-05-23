import SkillUpdateRequestService from '../services/SkillUpdateRequestService.js';
import { AppDataSource } from '../config/dataSource.js';
import { User } from '../entities/User.js';

const userRepo = AppDataSource.getRepository(User);

const SkillUpdateRequestController = {
  createRequest: async (req, h) => {
    try {
      const { userId, skillScore } = req.payload;

      const user = await userRepo.findOneBy({ id: userId });
      if (!user) return h.response({ error: 'User not found' }).code(404);

      const reviewChain = [];
      if (user.leadId) reviewChain.push(user.leadId);
      if (user.hrId) reviewChain.push(user.hrId);

      const request = await SkillUpdateRequestService.createRequest(skillScore, userId, reviewChain, reviewChain[0]);
      return h.response(request).code(201);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getRequestById: async (req, h) => {
    try {
      const request = await SkillUpdateRequestService.getRequestById(req.params.id);
      if (!request) return h.response({ error: 'Request not found' }).code(404);
      return h.response(request).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getRequest: async (req, h) => {
    try {
      const requests = await SkillUpdateRequestService.getRequest(req.query.userId);
      return h.response(requests).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getPendingRequests: async (req, h) => {
    try {
      const reviewerId = req.params.id;
      if (!reviewerId) return h.response({ error: "Missing reviewerId" }).code(400);
      const requests = await SkillUpdateRequestService.getPendingRequests(reviewerId);
      return h.response(requests).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  cancelRequest: async (req, h) => {
    try {
      await SkillUpdateRequestService.cancelRequest(req.params.id);
      return h.response({ message: 'Request cancelled' }).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(400);
    }
  },

  updateRequestStatus: async (req, h) => {
    try {
      const { status, reviewedBy, editedSkillScore, comments } = req.payload;
      const updated = await SkillUpdateRequestService.updateRequestStatus(
        req.params.id,
        status,
        reviewedBy,
        editedSkillScore,
        comments
      );
      return h.response(updated).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(400);
    }
  }
};

export default SkillUpdateRequestController;
