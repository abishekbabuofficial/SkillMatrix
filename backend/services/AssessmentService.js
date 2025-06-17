import { In } from "typeorm";
import { AppDataSource } from "../config/dataSource.js";
import { AssessmentRequest } from "../entities/AssessmentRequest.js";
import { Score } from "../entities/Score.js";
import { User } from "../entities/User.js";
import { Skill } from "../entities/Skill.js";
import { Audit } from "../entities/Audit.js";

const assessmentRequestRepo = AppDataSource.getRepository(AssessmentRequest);
const scoreRepo = AppDataSource.getRepository(Score);
const userRepo = AppDataSource.getRepository(User);
const skillRepo = AppDataSource.getRepository(Skill);
const auditRepo = AppDataSource.getRepository(Audit);

const AssessmentService = {
  createAssessment: async (
    userId,
    comments = "",
    skillAssessments = []
    // createdBy
  ) => {
    try {
      // Validate user exists
      const user = await userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new Error("User not found");
      }

      // if (createdBy !== user.id && createdBy !== user.leadId) {
      //   throw new Error("Unauthorized to create assessment");
      // }

      if (skillAssessments.length === 0) {
        throw new Error("No skill assessments provided");
      }
      // If createdBy is provided, validate that user exists
      // let creator = null;
      // if (createdBy) {
      //   creator = await userRepo.findOneBy({ id: createdBy });
      //   if (!creator) {
      //     throw new Error("Creator user not found");
      //   }
      // }

      // Check for existing pending assessments
      const existingAssessment = await assessmentRequestRepo.findOne({
        where: {
          userId: userId,
          status: In(["Pending"]),
        },
      });

      let savedAssessment;
      if (existingAssessment) {
        throw new Error("User already has a pending assessment");
        // savedAssessment = existingAssessment;
      } else {
        // Create assessment request
        const assessment = assessmentRequestRepo.create({
          userId: userId,
          nextApprover: user.leadId || user.hrId,
        });
        savedAssessment = await assessmentRequestRepo.save(assessment);
      }

      // Create scores for each skill assessment
      if (skillAssessments && skillAssessments.length > 0) {
        await AssessmentService.addSkillScores(
          savedAssessment.id,
          skillAssessments,
          userId
          // createdBy
        );
      }
      if (savedAssessment) {
        await auditRepo.save({
          assessmentId: savedAssessment.id,
          auditType: "Create",
          editorId: userId,
          comments: comments,
        });
      }
      return await AssessmentService.getAssessmentById(savedAssessment.id);
    } catch (error) {
      throw new Error(`Failed to create assessment: ${error.message}`);
    }
  },

  addSkillScores: async (
    assessmentId,
    skillAssessments,
    userId
    // createdBy = null
  ) => {
    try {
      const assessment = await assessmentRequestRepo.findOneBy({
        id: assessmentId,
      });
      if (!assessment) {
        throw new Error("Assessment not found");
      }

      const user = await userRepo.findOneBy({ id: userId });

      const scores = [];

      for (const skillAssessment of skillAssessments) {
        // Validate skill exists
        const skill = await skillRepo.findOneBy({
          id: skillAssessment.skillId,
        });
        if (!skill) {
          throw new Error(`Skill with ID ${skillAssessment.skillId} not found`);
        }

        // Determine who is creating the score and validate accordingly
        // const isCreatedByUser = !createdBy || createdBy === userId;
        const scoreValue = skillAssessment.score;

        // Check if score already exists for AssessmentService assessment and skill
        let existingScore = await scoreRepo.findOne({
          where: {
            assessmentId: assessmentId,
            skillId: skillAssessment.skillId,
          },
        });

        // if (existingScore) {
        //   // Update existing score
        //   if (isCreatedByUser) {
        //     existingScore.selfScore = scoreValue;
        //   } else {
        //     existingScore.leadScore = scoreValue;
        //   }
        //   scores.push(await scoreRepo.save(existingScore));
        // } else {
        // Determine where to store the score based on who created it
        let selfScore = null;
        let leadScore = null;

        // if (isCreatedByUser) {
        // User is creating their own assessment
        if(!user.leadId){
          selfScore = scoreValue;
          leadScore = scoreValue;
        } else{
        selfScore = scoreValue;
        leadScore = null;}
        // } else {
        //   // Lead is creating assessment for the user
        //   selfScore = null;
        //   leadScore = scoreValue;
        // }

        const score = scoreRepo.create({
          assessmentId: assessmentId,
          skillId: skillAssessment.skillId,
          selfScore: selfScore,
          leadScore: leadScore,
        });

        scores.push(await scoreRepo.save(score));
      }

      return scores;
    } catch (error) {
      throw new Error(`Failed to add skill scores: ${error.message}`);
    }
  },

  getAssessmentById: async (id) => {
    try {
      const assessment = await assessmentRequestRepo.findOne({
        where: { id },
        relations: ["user"],
      });
      if (!assessment) {
        throw new Error("Assessment not found");
      }

      // Get detailed scores with skill information
      const scores = await scoreRepo.find({
        where: { assessmentId: id },
        relations: ["Skill"],
      });

      return {
        ...assessment,
        detailedScores: scores,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve assessment: ${error}`);
    }
  },

  getUserAssessments: async (userId) => {
    try {
      const user = await userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new Error("User not found");
      }

      const assessments = await assessmentRequestRepo.find({
        where: { userId },
        relations: ["Score"],
        order: { requestedAt: "DESC" },
      });

      // Get detailed information for each assessment
      const detailedAssessments = [];
      for (const assessment of assessments) {
        const scores = await scoreRepo.find({
          where: { assessmentId: assessment.id },
          relations: ["Skill"],
        });

        detailedAssessments.push({
          ...assessment,
          detailedScores: scores,
        });
      }

      return detailedAssessments;
    } catch (error) {
      throw new Error(`Failed to retrieve user assessments: ${error.message}`);
    }
  },

  getAllAssessments: async () => {
    try {
      return await assessmentRequestRepo.find({
        relations: ["user", "Score"],
        order: { requestedAt: "DESC" },
      });
    } catch (error) {
      throw new Error(`Failed to retrieve all assessments: ${error.message}`);
    }
  },
  cancelAssessment: async (assessmentId) => {
    try {
      const assessment = await assessmentRequestRepo.findOneBy({
        id: assessmentId,
      });
      if (!assessment) {
        throw new Error("Assessment not found");
      }

      if (
        assessment.status === "Approved" ||
        assessment.status === "Forwarded"
      ) {
        throw new Error("Cannot cancel an approved or forwarded assessment");
      }

      assessment.status = "Cancelled";
      await scoreRepo?.delete({ assessmentId: assessmentId });
      // Reset sequence for scores
      await AppDataSource.query(`
          SELECT setval(
            pg_get_serial_sequence('scores', 'id'),
            (SELECT COALESCE(MAX(id), 0) FROM scores)
          )
        `);
      return await assessmentRequestRepo.save(assessment);
    } catch (error) {
      throw new Error(`Failed to cancel assessment: ${error.message}`);
    }
  },

  reviewAssessment: async (assessmentId, reviewData, currentUserId) => {
    try {
      const assessment = await assessmentRequestRepo.findOne({
        where: { id: assessmentId },
        relations: ["user", "Score"],
      });
      if (!assessment) {
        throw new Error("Assessment not found");
      }

      if (
        assessment.status !== "Pending" &&
        assessment.status !== "Forwarded"
      ) {
        throw new Error("Assessment is not in a reviewable state");
      }

      const hrId = assessment.user.hrId;

      if (currentUserId !== assessment.nextApprover) {
        throw new Error("You are not authorized to review this assessment");
      }

      // Update lead scores if provided
      if (reviewData.scoreUpdates && Array.isArray(reviewData.scoreUpdates)) {
        for (const scoreUpdate of reviewData.scoreUpdates) {
          const score = await scoreRepo.findOneBy({
            skillId: scoreUpdate.skillId,
            assessmentId: assessmentId,
          });

          if (score) {
            if (scoreUpdate.score < 1 || scoreUpdate.score > 4) {
              throw new Error(`Invalid lead score. Must be between 1 and 4`);
            }
            score.leadScore = scoreUpdate.score;
            await scoreRepo.save(score);
          }
        }
      }

      if (reviewData.status === "Forwarded") {
        // Only non-HR users can forward
        if (currentUserId === hrId) {
          throw new Error("HR can only approve assessments, not forward them");
        }
        assessment.status = "Forwarded";
      } else if (reviewData.status === "Approved") {
        if (currentUserId !== hrId) {
          throw new Error("Only HR can approve assessments");
        }
        assessment.status = "Approved";
      } else {
        assessment.status = "Forwarded";
      }
      // const nextApproverId = await AssessmentService.getNextApprover(
      //   assessment.nextApprover,
      //   hrId
      // );
      // assessment.nextApprover = nextApproverId;
      assessment.nextApprover = hrId;
      if (currentUserId === hrId) {
        assessment.nextApprover = null;
      }
      const reviewed = await assessmentRequestRepo.save(assessment);
      await auditRepo.save({
        assessmentId: reviewed.id,
        auditType: "Review",
        editorId: currentUserId,
        comments: reviewData.comments,
      });
    } catch (error) {
      throw new Error(`Failed to review assessment: ${error.message}`);
    }
  },

  getUserLatestApprovedScores: async (userId) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const user = await userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new Error("User not found");
      }

      const approvedAssessments = await assessmentRequestRepo.find({
        where: {
          userId: userId,
          status: "Approved",
        },
        order: { requestedAt: "DESC" },
        relations: ["Score", "Score.Skill"],
      });

      if (!approvedAssessments || approvedAssessments.length === 0) {
        return [];
      }

      // Create a map to store the latest score for each skill
      const latestScoresMap = new Map();

      for (const assessment of approvedAssessments) {
        if (assessment.Score && assessment.Score.length > 0) {
          for (const score of assessment.Score) {
            const skillId = score.skillId;

            // If we haven't seen this skill yet, or this assessment is newer
            if (!latestScoresMap.has(skillId)) {
              latestScoresMap.set(skillId, {
                id: score.id,
                self_score: score.selfScore,
                lead_score: score.leadScore,
                updated_at: score.updatedAt,
                skill_name: score.Skill?.name,
                skill_id: skillId,
                requestedAt: assessment.requestedAt,
              });
            }
          }
        }
      }

      // Convert map to array
      const latestScores = Array.from(latestScoresMap.values());

      return latestScores;
    } catch (error) {
      throw new Error(
        `Failed to get user's latest approved scores: ${error.message}`
      );
    }
  },
  getNextApprover: async (id, hrId) => {
    try {
      const user = await userRepo.findOne({
        where: { id: id },
      });
      if (!user) {
        throw new Error("User Not Found");
      }

      let nextApprover = user.leadId;
      if (!nextApprover) {
        nextApprover = hrId;
      }

      return nextApprover;
    } catch (error) {
      throw new Error(`Failed to get next approver: ${error.message}`);
    }
  },

  getAssessmentsForReviewer: async (reviewerId) => {
    try {
      // Get all pending and forwarded assessments
      const allPendingAssessments = await assessmentRequestRepo.find({
        where: { status: In(["Pending", "Forwarded"]) },
        relations: ["user"],
        order: { requestedAt: "ASC" },
      });

      // Filter assessments that should be reviewed by this reviewer
      const assessmentsForReviewer = [];
      for (const assessment of allPendingAssessments) {
        // If this reviewer is the next approver, include the assessment
        if (assessment.nextApprover === reviewerId) {
          const scores = await scoreRepo.find({
            where: { assessmentId: assessment.id },
            relations: ["Skill"],
          });

          assessmentsForReviewer.push({
            ...assessment,
            detailedScores: scores,
          });
        }
      }

      return assessmentsForReviewer;
    } catch (error) {
      throw new Error(
        `Failed to get assessments for reviewer: ${error.message}`
      );
    }
  },
};

export default AssessmentService;
