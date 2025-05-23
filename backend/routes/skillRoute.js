import SkillController from "../controllers/SkillController.js";

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
        handler: SkillController.getAllSkills,
      },
      {
        method: "POST",
        path: "/create",
        handler: SkillController.createSkill,
      },
      {
        method: "DELETE",
        path: "/delete/{id}",
        handler: SkillController.deleteSkillById,
      },
      {
        method: "GET",
        path: "/position/{position}",
        handler: SkillController.getSkillByPosition,
      },
    ]);
  },
};

export default skillRoutes;
