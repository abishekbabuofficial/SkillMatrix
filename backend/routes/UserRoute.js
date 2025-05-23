import UserController from "../controllers/UserController.js";

const userRoutes = {
  name: "user-routes",
  register: async function (server, options) {
    server.route([
      {
        method: "GET",
        path: "/{id}",
        handler: UserController.getUserById,
      },
      {
        method: "POST",
        path: "/all-users",
        handler: UserController.getAllUsers,
      },
      {
        method: "POST",
        path: "/create",
        handler: UserController.createUser,
      },
      {
        method: "POST",
        path: "/update",
        handler: UserController.updateUser,
      },
      {
        method: "DELETE",
        path: "/delete/{id}",
        handler: UserController.deleteUser,
      },
      {
        method: "GET",
        path: "/matrix/team/{teamName}",
        handler: UserController.getTeamMatrix,
      },
      {
        method: "GET",
        path: "/matrix/full",
        handler: UserController.getFullMatrix,
      },
    ]);
  },
};

export default userRoutes;
