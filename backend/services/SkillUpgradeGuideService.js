import { AppDataSource } from "../config/dataSource.js";
import { SkillUpgradeGuide } from "../entities/SkillUpgradeGuide.js";

const skillUpgradeGuideRepo = AppDataSource.getRepository(SkillUpgradeGuide);

const SkillUpgradeGuideService = {
  getGuide: async (skillId, fromLevel, toLevel) =>{
    return await skillUpgradeGuideRepo.findOne({
      where: { skillId: skillId, fromLevel: fromLevel, toLevel: toLevel },
    });
  },
  createGuide: async (data) => {
    await AppDataSource.query(`
  SELECT setval(
    pg_get_serial_sequence('skill_upgrade_guide', 'id'),
    (SELECT COALESCE(MAX(id), 0) FROM skill_upgrade_guide)
  )
`);

    if(await skillUpgradeGuideRepo.findOne({where:data})){
        throw new Error("Guide already exists");
    }
    const newGuide = skillUpgradeGuideRepo.create(data)
    return await skillUpgradeGuideRepo.save(newGuide);
  },
  updateGuide: async (data) =>{
    const guideId = data.id;
    const guide = await skillUpgradeGuideRepo.findOne({where:{ id:guideId }})
    if(!guide){
        throw new Error("No guide found")
    }
    skillUpgradeGuideRepo.merge(guide,data);
    return await skillUpgradeGuideRepo.save(guide);
  },
  getAllGuidesBySkillId: async(skill_id)=>{
    const guides = await skillUpgradeGuideRepo.find({where:{skillId: skill_id}});
    if(!guides){
      throw new Error(`No guide found for skill Id: ${skill_id}`);
    }
    return guides;
  }

};

export default SkillUpgradeGuideService;