import SkillUpdateRequestController from "../controllers/SkillUpdateRequestController.js";

const requestRoutes = {
  name: "request-routes",
  register: async function (server, options) {
    server.route([
      {
        method: "POST",
        path: "/create",
        handler: SkillUpdateRequestController.createRequest,
      },
      {
        method: "GET",
        path: "/{id}",
        handler: SkillUpdateRequestController.getRequestById,
      },
      {
        method: "GET",
        path: "/get-requests",
        handler: SkillUpdateRequestController.getRequest,
      },
      {
        method: "GET",
        path: "/pending/{id}",
        handler: SkillUpdateRequestController.getPendingRequests,
      },
      {
        method: "POST",
        path: "/review/{id}",
        handler: SkillUpdateRequestController.updateRequestStatus,
      },
      {
        method: "DELETE",
        path: "/cancel/{id}",
        handler: SkillUpdateRequestController.cancelRequest,
      }
    ]);
  },
};

export default requestRoutes;
