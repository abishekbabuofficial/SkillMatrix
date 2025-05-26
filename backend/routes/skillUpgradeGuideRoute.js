import SkillUpgradeGuideController from "../controllers/SkillUpgradeGuideController.js";
import { role } from "../entities/User.js";
import authorizeRoles from "../middlewares/authorizeRole.js";

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
        options: authorizeRoles([role.HR]),
        handler: SkillUpgradeGuideController.createGuide,
      },
      {
        method: "POST",
        path: "/update",
        options: authorizeRoles([role.HR]),
        handler: SkillUpgradeGuideController.updateGuide,
      },
    ]);
  },
};

export default guideRoutes;
