import Boom from "@hapi/boom";
const authorizeRoles = (allowedRoles) => {
  return {
    auth: "jwt",
    pre: [
      {
        method: (req, h) => {
          const user = req.auth.credentials.user;
          if (!user || !allowedRoles.includes(user.role)) {
            
            throw Boom.forbidden("Access Denied: Unauthorized access or insufficient permissions.")
          }

          return h.continue;
        },
      },
    ],
  };
};

export default authorizeRoles;
