import { AppDataSource } from "../config/dataSource.js";
import { User } from "../entities/User.js";
import { Role } from "../entities/Role.js";
import { Position } from "../entities/Position.js";
import { Team } from "../entities/Team.js";
import { Auth } from "../entities/Auth.js";
import { AssessmentRequest } from "../entities/AssessmentRequest.js";
import { Score } from "../entities/Score.js";
import { Skill } from "../entities/Skill.js";

const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);
const positionRepo = AppDataSource.getRepository(Position);
const teamRepo = AppDataSource.getRepository(Team);
const authRepo = AppDataSource.getRepository(Auth);
const assessmentRequestRepo = AppDataSource.getRepository(AssessmentRequest);
const scoreRepo = AppDataSource.getRepository(Score);
const skillRepo = AppDataSource.getRepository(Skill);

const UserService = {

  // General user operations
  getUserById: async (id) => {
    const user = await userRepo.findOne({
      where: { id },
      relations: ["role", "position", "Team"],
    });
    if (!user) throw new Error("User not found");
    return user;
  },

  getAllUsers: async (filter = {}) => {
    const where = {};
    console.log(filter);

    // Handle filtering by related entities
    if (filter.role) {
      const role = await roleRepo.findOneBy({ name: filter.role });
      if (role) where.roleId = role.id;
    }
    if (filter.position) {
      const position = await positionRepo.findOneBy({ name: filter.position });
      if (position) where.positionId = position.id;
    }
    if (filter.teamName) {
      const team = await teamRepo.findOneBy({ name: filter.teamName });
      if (team) where.teamId = team.id;
    }

    return await userRepo.find({
      where,
      relations: ["role", "position", "Team"],
    });
  },

  // Hr CRUD Operations
  createUser: async (data) => {
    await AppDataSource.query(`
  SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    (SELECT COALESCE(MAX(id), 0) FROM users)
    )`);
    await AppDataSource.query(`
  SELECT setval(
    pg_get_serial_sequence('auths', 'id'),
    (SELECT COALESCE(MAX(id), 0) FROM auths)
    )`);

    // Convert role, position, and team names to IDs if provided as names
    const userData = { ...data };

    if (data.role && typeof data.role === "string") {
      const role = await roleRepo.findOneBy({ name: data.role });
      if (role) userData.roleId = role.id;
      delete userData.role;
    }

    if (data.position && typeof data.position === "string") {
      const position = await positionRepo.findOneBy({ name: data.position });
      if (position) userData.positionId = position.id;
      delete userData.position;
    }

    if (data.teamName && typeof data.teamName === "string") {
      const team = await teamRepo.findOneBy({ name: data.teamName });
      if (team) userData.teamId = team.id;
      delete userData.teamName;
    }

    const newUser = userRepo.create(userData);
    const savedUser = await userRepo.save(newUser);
    const authDetails = authRepo.create({
      email: userData.email,
      passwordHash: userData.password ? userData.password : null,
    });
    await authRepo.save(authDetails);

    // If this user is assigned as a lead to someone, update their role to 'lead'
    if (data.leadId) {
      await UserService.ensureLeadRole(data.leadId);
    }

    return savedUser;
  },

  updateUser: async (data) => {
    const id = data.id;
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error("User not found");

    // Check if leadId is being updated
    const leadIdChanged = data.leadId && data.leadId !== user.leadId;

    // Convert role, position, and team names to IDs if provided as names
    const userData = { ...data };

    if (data.role && typeof data.role === "string") {
      const role = await roleRepo.findOneBy({ name: data.role });
      if (role) userData.roleId = role.id;
      delete userData.role;
    }

    if (data.position && typeof data.position === "string") {
      const position = await positionRepo.findOneBy({ name: data.position });
      if (position) userData.positionId = position.id;
      delete userData.position;
    }

    if (data.teamName && typeof data.teamName === "string") {
      const team = await teamRepo.findOneBy({ name: data.teamName });
      if (team) userData.teamId = team.id;
      delete userData.teamName;
    }

    userRepo.merge(user, userData); // accepts only the valid fields for update
    const updatedUser = await userRepo.save(user);

    // If leadId was updated, ensure the lead has the 'lead' role
    if (leadIdChanged) {
      await UserService.ensureLeadRole(data.leadId);
    }

    return updatedUser;
  },

  // Helper method to ensure a user has the 'lead' role
  ensureLeadRole: async (userId) => {
    const lead = await userRepo.findOne({
      where: { id: userId },
      relations: ["role"],
    });
    if (!lead) throw new Error("Lead user not found");

    // Get the 'lead' role from the roles table
    const leadRole = await roleRepo.findOneBy({ name: "lead" });
    if (!leadRole) throw new Error("Lead role not found in database");

    // If the user is not already a lead, update their role
    if (!lead.role || lead.role.name !== "lead") {
      lead.roleId = leadRole.id;
      await userRepo.save(lead);
      console.log(`User ${userId} role updated to 'lead'`);
    }
  },

  deleteUser: async (id) => {
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error("User not found");
    return await userRepo.remove(user);
  },

    getMostRecentApprovedScores: async (userId) => {
    try {
      // Get the most recent approved assessment for the user
      const latestApprovedAssessment = await assessmentRequestRepo.findOne({
        where: {
          userId: userId,
          status: "Approved",
        },
        order: {
          requestedAt: "DESC",
        },
      });

      if (!latestApprovedAssessment) {
        return [];
      }

      // Get all scores for this assessment with skill details
      const scores = await scoreRepo.find({
        where: {
          assessmentId: latestApprovedAssessment.id,
        },
        relations: ["Skill"],
      });

      return scores.map((score) => ({
        skillId: score.skillId,
        skillName: score.Skill.name,
        Score: score.leadScore
      }));
    } catch (error) {
      console.error(`Error getting recent scores for user ${userId}:`, error);
      return [];
    }
  },

  getSkillMatrixByTeam: async (teamName) => {
    try {
      // Find the team by name first
      const team = await teamRepo.findOneBy({ name: teamName });
      if (!team) throw new Error("Team not found");

      const users = await userRepo.find({
        where: {
          teamId: team.id,
        },
        select: ["id","userId","name"],
        relations: ["role", "position", "Team"],
      });

      // Get the most recent approved assessment scores for each user
      const usersWithScores = await Promise.all(
        users.map(async (user) => {
          const recentScores = await UserService.getMostRecentApprovedScores(
            user.id
          );
          return {
            ...user,
            mostRecentAssessmentScores: recentScores,
            hasRecentAssessment: recentScores.length > 0,
          };
        })
      );

      return usersWithScores;
    } catch (error) {
      throw new Error(`Failed to get skill matrix by team: ${error.message}`);
    }
  },

  getFullSkillMatrix: async () => {
    try {
      const users = await userRepo.find({
        select: ["id","userId","name"],
        relations: ["role", "position", "Team"],
      });

      // Get the most recent approved assessment scores for each user
      const usersWithScores = await Promise.all(
        users.map(async (user) => {
          const recentScores = await UserService.getMostRecentApprovedScores(
            user.id
          );
          return {
            ...user,
            mostRecentAssessmentScores: recentScores,
            hasRecentAssessment: recentScores.length > 0,
          };
        })
      );

      return usersWithScores;
    } catch (error) {
      throw new Error(`Failed to get full skill matrix: ${error.message}`);
    }
  },
};

export default UserService;
