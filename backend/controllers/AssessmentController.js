import AssessmentService from "../services/AssessmentService.js";
import Boom from "@hapi/boom";

const AssessmentController = {
  // Create a new assessment
  createAssessment: async (req, h) => {
    try {
      const { skillAssessments } = req.payload;
      const userId = req.payload.userId;
      const comments = req.payload.comments;
      const createdBy = req.auth.credentials.user.id || null;

      const assessment = await AssessmentService.createAssessment(
        userId,
        comments,
        skillAssessments,
        createdBy
      );

      return h
        .response({
          success: true,
          message: "Assessment created successfully",
          data: assessment,
        })
        .code(201);
    } catch (error) {
      console.error("Error creating assessment:", error);
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(409);
        }
  },

  // Get assessment by ID
  getAssessmentById: async (req, h) => {
    try {
      const { id } = req.params;
      const assessment = await AssessmentService.getAssessmentById(
        parseInt(id)
      );

      return h
        .response({
          success: true,
          data: assessment,
        })
        .code(200);
    } catch (error) {
      console.error("Error getting assessment:", error);
      if (error.message.includes("not found")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(404);
      }
      return h
        .response({
          success: false,
          error: "Failed to retrieve assessment",
        })
        .code(500);
    }
  },

  // Get current user's assessments
  getUserAssessments: async (req, h) => {
    try {
      const userId = req.auth.credentials.id;
      const assessments = await AssessmentService.getUserAssessments(userId);

      return h
        .response({
          success: true,
          data: assessments,
        })
        .code(200);
    } catch (error) {
      console.error("Error getting user assessments:", error);
      if (error.message.includes("not found")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(404);
      }
      return h
        .response({
          success: false,
          error: "Failed to retrieve user assessments",
        })
        .code(500);
    }
  },

  // Get assessments for a specific user (by ID)
  getAssessmentsForUser: async (req, h) => {
    try {
      const { userId } = req.params;
      const assessments = await AssessmentService.getUserAssessments(
        parseInt(userId)
      );

      return h
        .response({
          success: true,
          data: assessments,
        })
        .code(200);
    } catch (error) {
      console.error("Error getting assessments for user:", error);
      if (error.message.includes("not found")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(404);
      }
      return h
        .response({
          success: false,
          error: "Failed to retrieve assessments for user",
        })
        .code(500);
    }
  },

  // Get all assessments (admin/lead only)
  getAllAssessments: async (req, h) => {
    try {
      const assessments = await AssessmentService.getAllAssessments();

      return h
        .response({
          success: true,
          data: assessments,
        })
        .code(200);
    } catch (error) {
      console.error("Error getting all assessments:", error);
      return h
        .response({
          success: false,
          error: "Failed to retrieve all assessments",
        })
        .code(500);
    }
  },

  // Get pending assessments (admin/lead only)
  getPendingAssessments: async (req, h) => {
    try {
      const assessments = await AssessmentService.getPendingAssessments();

      return h
        .response({
          success: true,
          data: assessments,
        })
        .code(200);
    } catch (error) {
      console.error("Error getting pending assessments:", error);
      return h
        .response({
          success: false,
          error: "Failed to retrieve pending assessments",
        })
        .code(500);
    }
  },

  // Review an assessment (admin/lead only)
  reviewAssessment: async (req, h) => {
    try {
      const { assessmentId } = req.params;
      const reviewData = req.payload;
      const currentUserId = req.auth.credentials.user.id;

      const assessment = await AssessmentService.reviewAssessment(
        parseInt(assessmentId),
        reviewData,
        currentUserId
      );

      return h
        .response({
          success: true,
          message: "Assessment reviewed successfully",
          data: assessment,
        })
        .code(200);
    } catch (error) {
      console.error("Error reviewing assessment:", error);
      if (error.message.includes("not found")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(404);
      }
      if (error.message.includes("not in a reviewable state")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(400);
      }
      if (error.message.includes("not authorized")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(403);
      }
      if (error.message.includes("Invalid lead score")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(400);
      }
      if (error.message.includes("HR can only approve")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(400);
      }
      return h
        .response({
          success: false,
          error: error.message,
        })
        .code(500);
    }
  },

  // Cancel an assessment
  cancelAssessment: async (req, h) => {
    try {
      const { assessmentId } = req.params;
      const result = await AssessmentService.cancelAssessment(
        parseInt(assessmentId)
      );

      return h
        .response({
          success: true,
          message: "Assessment cancelled successfully",
          data: result,
        })
        .code(200);
    } catch (error) {
      console.error("Error cancelling assessment:", error);
      if (error.message.includes("not found")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(404);
      }
      if (error.message.includes("Cannot cancel")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(400);
      }
      return h
        .response({
          success: false,
          error: "Failed to cancel assessment",
        })
        .code(500);
    }
  },

  // Get user's latest approved scores
  getUserLatestApprovedScores: async (req, h) => {
    try {
      const userId = req.auth.credentials.id;
      const scores = await AssessmentService.getUserLatestApprovedScores(
        userId
      );

      return h
        .response({
          success: true,
          data: scores,
        })
        .code(200);
    } catch (error) {
      console.error("Error getting user's latest approved scores:", error);
      if (error.message.includes("not found")) {
        return h
          .response({
            success: false,
            error: error.message,
          })
          .code(404);
      }
      return h
        .response({
          success: false,
          error: "Failed to retrieve latest approved scores",
        })
        .code(500);
    }
  },


  // Get assessments assigned to current reviewer
  getMyAssignedAssessments: async (req, h) => {
    try {
      const currentUserId = req.auth.credentials.user.id;

      const assessments = await AssessmentService.getAssessmentsForReviewer(
        currentUserId
      );

      return h
        .response({
          success: true,
          data: assessments,
        })
        .code(200);
    } catch (error) {
      console.error("Error getting assigned assessments:", error);
      return h
        .response({
          success: false,
          error: "Failed to retrieve assigned assessments",
        })
        .code(500);
    }
  },
};

export default AssessmentController;
