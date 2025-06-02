import SkillUpdateRequestService from "../services/SkillUpdateRequestService.js";
import { AppDataSource } from "../config/dataSource.js";
import { role, User } from "../entities/User.js";

const userRepo = AppDataSource.getRepository(User);

const SkillUpdateRequestController = {
  createRequest: async (req, h) => {
    try {
      const userData = req.auth.credentials.user;
      const createdBy = userData.id;
      const createrRole = userData.role;
      const { userId, editedSkillScore, skillScore } = req.payload;

      // Use the authenticated user's ID if userId is not provided
      const targetUserId = userId || createdBy;

      let reviewHistory = [];
        reviewHistory.push( {
          createrRole,
          createdBy,
          createdAt: new Date(),
        });
      
      

      const user = await userRepo.findOneBy({ id: targetUserId });
      if (!user) return h.response({ error: "User not found" }).code(404);

      const reviewChain = [];
      let id = user.id;
      while (id) {
        const record = await userRepo.findOneBy({ id: id });
        if (record && record.leadId) reviewChain.push(record.leadId);
        id = record && record.leadId ? record.leadId : null;
      }
      if (user.hrId && user.leadId) reviewChain.push(user.hrId);

      const request = await SkillUpdateRequestService.createRequest(
        skillScore,
        targetUserId,
        reviewHistory,
        editedSkillScore,
        reviewChain,
        reviewChain.length > 0 ? reviewChain[0] : null
      );

      const responseMessage = request.currentReviewer
        ? `Request created successfully by ${createdBy} and forwarded to ${request.currentReviewer}`
        : "Request created successfully";

      return h.response(responseMessage).code(201);
    } catch (err) {
      console.error("Error creating request:", err);
      return h.response({ error: err.message }).code(500);
    }
  },

  getRequestById: async (req, h) => {
    try {
      const request = await SkillUpdateRequestService.getRequestById(
        req.params.id
      );
      if (!request) return h.response({ error: "Request not found" }).code(404);
      return h.response(request).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getRequestForUser: async (req, h) => {
    try {
      const userId = req.auth.credentials.user.id;
      const requests = await SkillUpdateRequestService.getRequestForUser(
        userId
      );
      return h.response(requests).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getAllRequests: async (req, h) => {
    try {
      const requests = await SkillUpdateRequestService.getAllRequests();
      return h.response(requests).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getPendingRequests: async (req, h) => {
    try {
      const reviewerId = req.auth.credentials.user.id;
      if (!reviewerId)
        return h.response({ error: "Missing reviewerId" }).code(400);
      const requests = await SkillUpdateRequestService.getPendingRequests(
        reviewerId
      );
      return h.response(requests).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  cancelRequest: async (req, h) => {
    try {
      await SkillUpdateRequestService.cancelRequest(req.params.id);
      return h.response({ message: "Request cancelled" }).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(400);
    }
  },

  updateRequestStatus: async (req, h) => {
    try {
      const userData = req.auth.credentials.user;
      const reviewedBy = userData.id;
      const { status, editedSkillScore, comments } = req.payload;

      const user = await userRepo.findOneBy({
        id: reviewedBy,
      });
      if(!user.leadId && user.role !== 'hr' && editedSkillScore){
        return h.response({error:"You are not allowed to edit skills"}).code(403);
      }
      const updated = await SkillUpdateRequestService.updateRequestStatus(
        req.params.id,
        status,
        reviewedBy,
        editedSkillScore,
        comments
      );
      if (status === "Forwarded") {
        return h
          .response(
            "Updated successfully and forwarded to " +
              updated.currentReviewer +
              " " +
              updated
          )
          .code(200);
      } else {
        return h.response("Fully Approved" + updated).code(200);
      }
    } catch (err) {
      return h.response({ error: err.message }).code(400);
    }
  },
};

export default SkillUpdateRequestController;
