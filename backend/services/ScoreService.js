import { AppDataSource } from "../config/dataSource.js";
import { Score } from "../entities/Score.js";
import { AssessmentRequest } from "../entities/AssessmentRequest.js";
import { Skill } from "../entities/Skill.js";

const scoreRepo = AppDataSource.getRepository(Score);
const assessmentRequestRepo = AppDataSource.getRepository(AssessmentRequest);
const skillRepo = AppDataSource.getRepository(Skill);

const ScoreService = {
  createScore: async (assessmentId, skillId, selfScore, leadScore = null) => {
    try {
      // Validate assessment request exists
      const assessmentRequest = await assessmentRequestRepo.findOneBy({
        id: assessmentId,
      });
      if (!assessmentRequest) {
        throw new Error("Assessment request not found");
      }

      // Validate skill exists
      const skill = await skillRepo.findOneBy({ id: skillId });
      if (!skill) {
        throw new Error("Skill not found");
      }

      // Validate score values
      if (selfScore < 1 || selfScore > 5) {
        throw new Error("Self score must be between 1 and 5");
      }

      if (leadScore !== null && (leadScore < 1 || leadScore > 5)) {
        throw new Error("Lead score must be between 1 and 5");
      }

      // Check if score already exists for this assessment and skill
      const existingScore = await scoreRepo.findOne({
        where: { assessmenetId: assessmentId, skillId: skillId },
      });

      if (existingScore) {
        throw new Error("Score already exists for this assessment and skill");
      }

      // Reset sequence to ensure proper ID generation
      await AppDataSource.query(`
        SELECT setval(
          pg_get_serial_sequence('scores', 'id'),
          (SELECT COALESCE(MAX(id), 0) FROM scores)
        )
      `);

      const score = scoreRepo.create({
        assessmenetId: assessmentId,
        skillId: skillId,
        selfScore: selfScore,
        leadScore: leadScore,
      });

      return await scoreRepo.save(score);
    } catch (error) {
      throw new Error(`Failed to create score: ${error.message}`);
    }
  },

  updateScore: async (id, updateData) => {
    try {
      const score = await scoreRepo.findOneBy({ id });
      if (!score) {
        throw new Error("Score not found");
      }

      // Validate score values if being updated
      if (updateData.selfScore !== undefined) {
        if (updateData.selfScore < 1 || updateData.selfScore > 5) {
          throw new Error("Self score must be between 1 and 5");
        }
      }

      if (updateData.leadScore !== undefined && updateData.leadScore !== null) {
        if (updateData.leadScore < 1 || updateData.leadScore > 5) {
          throw new Error("Lead score must be between 1 and 5");
        }
      }

      scoreRepo.merge(score, updateData);
      return await scoreRepo.save(score);
    } catch (error) {
      throw new Error(`Failed to update score: ${error.message}`);
    }
  },


  getScoresByAssessmentId: async (assessmentId) => {
    try {
      const assessmentRequest = await assessmentRequestRepo.findOneBy({
        id: assessmentId,
      });
      if (!assessmentRequest) {
        throw new Error("Assessment request not found");
      }

      return await scoreRepo.find({
        where: { assessmenetId: assessmentId },
        relations: ["Skill"],
        order: { skillId: "ASC" },
      });
    } catch (error) {
      throw new Error(
        `Failed to retrieve scores for assessment: ${error.message}`
      );
    }
  },

  deleteScore: async (id) => {
    try {
      const score = await scoreRepo.findOneBy({ id });
      if (!score) {
        throw new Error("Score not found");
      }

      return await scoreRepo.remove(score);
    } catch (error) {
      throw new Error(`Failed to delete score: ${error.message}`);
    }
  },

  getUserSkillScores: async (userId) => {
    try {
      const userScores = await AppDataSource.query(
        `
        SELECT 
          s.id,
          s.self_score,
          s.lead_score,
          s.updated_at,
          sk.name as skill_name,
          sk.id as skill_id,
          ar.status as assessment_status,
          ar.requested_at
        FROM scores s
        JOIN assessment_requests ar ON s.assessment_id = ar.id
        JOIN skills sk ON s.skill_id = sk.id
        WHERE ar."userId" = $1
        ORDER BY ar.requested_at DESC, sk.name ASC
      `,
        [userId]
      );

      return userScores;
    } catch (error) {
      throw new Error(`Failed to get user skill scores: ${error.message}`);
    }
  },

  getLatestScoresForUser: async (userId) => {
    try {
      const latestScores = await AppDataSource.query(
        `
        SELECT DISTINCT ON (s.skill_id)
          s.id,
          s.self_score,
          s.lead_score,
          s.updated_at,
          sk.name as skill_name,
          sk.id as skill_id,
          ar.status as assessment_status
        FROM scores s
        JOIN assessment_requests ar ON s.assessment_id = ar.id
        JOIN skills sk ON s.skill_id = sk.id
        WHERE ar."userId" = $1 AND ar.status = 'Approved'
        ORDER BY s.skill_id, ar.requested_at DESC
      `,
        [userId]
      );

      return latestScores;
    } catch (error) {
      throw new Error(`Failed to get latest scores for user: ${error.message}`);
    }
  },

  bulkCreateScores: async (assessmentId, scoresData) => {
    try {
      const assessmentRequest = await assessmentRequestRepo.findOneBy({
        id: assessmentId,
      });
      if (!assessmentRequest) {
        throw new Error("Assessment request not found");
      }

      const createdScores = [];

      for (const scoreData of scoresData) {
        const score = await this.createScore(
          assessmentId,
          scoreData.skillId,
          scoreData.selfScore,
          scoreData.leadScore
        );
        createdScores.push(score);
      }

      return createdScores;
    } catch (error) {
      throw new Error(`Failed to bulk create scores: ${error.message}`);
    }
  },
};

export default ScoreService;
