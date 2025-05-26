import UserService from "../services/UserService.js";

const UserController = {
  getUserById: async (req, h) => {
    try {
      const userId = req.auth.credentials.user.id;
      const user = await UserService.getUserById(userId);
      return h.response(user).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(404);
    }
  },

  getAllUsers: async (req, h) => {
    try {
      const users = await UserService.getAllUsers(req.payload);
      return h.response(users).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },
  createUser: async (req, h) => {
    try {
      const data = req.payload;
      if(!data.id || !data.name){
        return h.response({error:"Missing required fields ID and Name"}).code(400);
      }
      const created = await UserService.createUser(data);
      
      return h.response("User Added successfully!").code(201);
    } catch (err) {
      return h.response({ error: err.message }).code(400);
    }
  },

  updateUser: async (req, h) => {
    try {
      const updated = await UserService.updateUser(req.payload);
      return h.response("Updated successfully!").code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(404);
    }
  },

  deleteUser: async (req, h) => {
    try {
      const deleted = await UserService.deleteUser(req.params.id);
      return h.response("Successfully Deleted user with ID " + req.params.id + "!").code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(404);
    }
  },

  getTeamMatrix: async (req, h) => {
    try {
      const matrix = await UserService.getSkillMatrixByTeam(req.params.teamName);
      return h.response(matrix).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  },

  getFullMatrix: async (req, h) => {
    try {
      const matrix = await UserService.getFullSkillMatrix();
      return h.response(matrix).code(200);
    } catch (err) {
      return h.response({ error: err.message }).code(500);
    }
  }
};

export default UserController;
