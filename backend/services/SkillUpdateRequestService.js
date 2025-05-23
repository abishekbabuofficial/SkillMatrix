import { In } from "typeorm";
import { AppDataSource } from "../config/dataSource.js";
import { SkillUpdateRequest } from "../entities/SkillUpdateRequest.js";
import { User } from "../entities/User.js";

const requestRepo = AppDataSource.getRepository(SkillUpdateRequest);
const userRepo = AppDataSource.getRepository(User);

const SkillUpdateRequestService = {
  createRequest: async (skillScore, userId,reviewChain, currentReviewer) => {
    await AppDataSource.query(`
  SELECT setval(
    pg_get_serial_sequence('skill_update_requests', 'id'),
    (SELECT COALESCE(MAX(id), 0) FROM skill_update_requests)
  )
`);
    const skillRequest = requestRepo.create({
      skillScore,
      userId,
      reviewChain,
      currentReviewer,
    });
    return await requestRepo.save(skillRequest);
  },
  getRequestById: async (id) => {
    return await requestRepo.findOneBy({ id });
  },
  getRequest: async (userId = null) => {
    if (userId) {
      // get by id
      return await requestRepo.findBy({ where: { userId: { userId } } });
    } else {
      // get all requests
      return await requestRepo.find();
    }
  },
  cancelRequest: async (id) => {
    return await requestRepo.delete(id);
  },
  getPendingRequests: async (reviewerId) => {
  return await requestRepo.find({
    where: {
      currentReviewer: reviewerId,
      status: In(["Pending", "Forwarded"])
    },
    relations: ["user"],
    order: { requestedAt: "DESC" }
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
