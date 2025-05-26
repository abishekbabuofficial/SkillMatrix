import SkillController from "../controllers/SkillController.js";
import { role } from "../entities/User.js";
import authorizeRoles from "../middlewares/authorizeRole.js";

const skillRoutes = {
  name: "skill-routes",
  register: async function (server, options) {
    server.route([
      {
        method: "GET",
        path: "/{id}",
        handler: SkillController.getSkillById,
      },
      {
        method: "GET",
        path: "/all-skills",
        options: authorizeRoles([role.HR]),
        handler: SkillController.getAllSkills,
      },
      {
        method: "POST",
        path: "/create",
        options: authorizeRoles([role.HR]),
        handler: SkillController.createSkill,
      },
      {
        method: "DELETE",
        path: "/delete/{id}",
        options: authorizeRoles([role.HR]),
        handler: SkillController.deleteSkillById,
      },
      {
        method: "GET",
        path: "/position/{position}",
        options: authorizeRoles([role.LEAD, role.HR]),
        handler: SkillController.getSkillByPosition,
      },
    ]);
  },
};

export default skillRoutes;
