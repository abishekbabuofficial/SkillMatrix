import { In } from "typeorm";
import { AppDataSource } from "../config/dataSource.js";
import { SkillUpdateRequest } from "../entities/SkillUpdateRequest.js";
import { User } from "../entities/User.js";

const requestRepo = AppDataSource.getRepository(SkillUpdateRequest);
const userRepo = AppDataSource.getRepository(User);

const SkillUpdateRequestService = {
  createRequest: async (
    skillScore,
    userId,
    reviewHistory,
    editedSkillScore = null,
    reviewChain,
    currentReviewer
  ) => {
    // Validate userId is provided
    if (!userId) {
      throw new Error("userId is required");
    }

    await AppDataSource.query(`
  SELECT setval(
    pg_get_serial_sequence('skill_update_requests', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 0) FROM skill_update_requests), 1)
  )
`);

    // Check if a request already exists for this user
    const existingRequest = await requestRepo.findOneBy({ userId });

    if (existingRequest) {
      // Update existing request
      existingRequest.skillScore = skillScore;

      // Update other fields if provided
      if (editedSkillScore) existingRequest.editedSkillScore = editedSkillScore;
      if (reviewChain) existingRequest.reviewChain = reviewChain;
      if (currentReviewer) existingRequest.currentReviewer = currentReviewer;
      if (reviewHistory) existingRequest.reviewHistory.push(reviewHistory);

      return await requestRepo.save(existingRequest);
    }

    // Create new request
    const skillRequest = requestRepo.create({
      skillScore,
      userId,
      reviewChain,
      currentReviewer,
      editedSkillScore,
      reviewHistory,
    });

    return await requestRepo.save(skillRequest);
  },
  getRequestById: async (id) => {
    return await requestRepo.findOneBy({ id });
  },
  getRequestForUser: async (userId) => {
    const requests = await requestRepo.findBy({ userId });
    if (!requests || requests.length === 0) {
      throw new Error("No requests found");
    }
    return requests;
  },

  getAllRequests: async () => {
    return await requestRepo.find();
  },
  cancelRequest: async (id) => {
    return await requestRepo.delete(id);
  },
  getPendingRequests: async (reviewerId) => {
    return await requestRepo.find({
      where: {
        currentReviewer: reviewerId,
        status: In(["Pending", "Forwarded"]),
      },
      relations: ["user"],
      order: { requestedAt: "DESC" },
    });
  },
  updateRequestStatus: async (
    id,
    status,
    reviewedBy,
    editedSkillScore,
    comments = ""
  ) => {
    const req = await requestRepo.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!req) throw new Error("Request not found");

    // reviewer check
    if (req.currentReviewer !== reviewedBy) {
      throw new Error("You are not authorized to review this request");
    }

    const history = req.reviewHistory || [];
    history.push({
      reviewedBy,
      reviewedAt: new Date(),
      comments,
    });

    if (editedSkillScore) req.editedSkillScore = editedSkillScore;
    req.reviewHistory = history;

    req.reviewChain = req.reviewChain.filter((id) => id !== reviewedBy);
    req.currentReviewer = req.reviewChain[0] || null;

    // Final approval
    if (!req.currentReviewer && status === "Approved") {
      req.status = "Approved";
      const updatedSkills = req.editedSkillScore || req.skillScore;
      req.user.skills = updatedSkills;
      req.user.updatedAt = new Date();
      await userRepo.save(req.user);
    } else {
      req.status = "Forwarded";
    }

    return await requestRepo.save(req);
  },
};

export default SkillUpdateRequestService;
