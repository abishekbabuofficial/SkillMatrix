import AuthController from "../controllers/authController.js";


const authRoutes = {
  name: "auth-routes",
  register: async function (server, options) {
    server.route([
  {
    method: 'POST',
    path: '/login',
    options: { auth: false },
    handler: AuthController.login
  },
  {
    method: 'POST',
    path: '/signup',
    options: { auth: false },
    handler: AuthController.signup
  }
]);
  },
};



export default authRoutes;
