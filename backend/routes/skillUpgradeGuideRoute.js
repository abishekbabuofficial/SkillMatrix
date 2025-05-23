import SkillUpgradeGuideController from "../controllers/SkillUpgradeGuideController.js";

const guideRoutes = {
  name: "skillupgrade-routes",
  register: async function (server, options) {
    server.route([
      {
        method: "POST",
        path: "/get",
        handler: SkillUpgradeGuideController.getGuide,
      },
      {
        method: "GET",
        path: "/skill/{id}",
        handler: SkillUpgradeGuideController.getAllGuidesBySkillId,
      },
      {
        method: "POST",
        path: "/create",
        handler: SkillUpgradeGuideController.createGuide,
      },
      {
        method: "POST",
        path: "/update",
        handler: SkillUpgradeGuideController.updateGuide,
      },
    ]);
  },
};

export default guideRoutes;
