import AuthController from "../controllers/authController.js";


const authRoutes = {
  name: "auth-routes",
  register: async function (server, options) {
    server.route([
  {
    method: '*',
    path: '/login',
    options: { auth: false,
    handler: AuthController.microsoftLogin
    },
  },
  {
    method: 'GET',
    path: '/start-login',
    options: { auth: false,
    handler: AuthController.startLogin
    }
  },
  {
    method: 'POST',
    path: '/legacy-login',
    options: { auth: false,
    handler: AuthController.login
    },
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
