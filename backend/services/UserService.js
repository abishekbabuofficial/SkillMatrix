import { AppDataSource } from "../config/dataSource.js";
import { User } from "../entities/User.js";

const userRepo = AppDataSource.getRepository(User);

const UserService = {
  // General user operations
  getUserById: async (id) => {
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error("User not found");
    return user;
  },

  getAllUsers: async (filter = {}) => {
    const where = {};
    console.log(filter);

    if (filter.role) where.role = filter.role;
    if (filter.position) where.position = filter.position;
    if (filter.teamName) where.teamName = filter.teamName;

    return await userRepo.find({ where });
  },

  // Hr CRUD Operations
  createUser: async (data) => {
    const newUser = userRepo.create(data);
    const savedUser = await userRepo.save(newUser);

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

    userRepo.merge(user, data); // accepts only the valid fields for update
    const updatedUser = await userRepo.save(user);

    // If leadId was updated, ensure the lead has the 'lead' role
    if (leadIdChanged) {
      await UserService.ensureLeadRole(data.leadId);
    }

    return updatedUser;
  },

  // Helper method to ensure a user has the 'lead' role
  ensureLeadRole: async (userId) => {
    const lead = await userRepo.findOneBy({ id: userId });
    if (!lead) throw new Error("Lead user not found");

    // If the user is not already a lead, update their role
    if (lead.role !== "lead") {
      lead.role = "lead";
      await userRepo.save(lead);
      console.log(`User ${userId} role updated to 'lead'`);
    }
  },

  deleteUser: async (id) => {
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error("User not found");
    return await userRepo.remove(user);
  },

  getSkillMatrixByTeam: async (teamName) => {
    const users = await userRepo.find({
      where: {
        teamName: teamName,
      },
      select: ["id", "name", "role", "teamName", "position", "skills"],
    });
    return users;
  },

  getFullSkillMatrix: async () => {
    return await userRepo.find({
      select: ["id", "name", "role", "teamName", "position", "skills"],
    });
  },
};

export default UserService;
