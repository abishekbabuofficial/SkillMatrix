import {EntitySchema} from "typeorm";

export const Skill = new EntitySchema({
  name: "Skill",
  tableName: "skills",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      unique: true,
    },
    description: {
      type: "json",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    createdBy: {
      type: "varchar",
      nullable: true,
    },
    position:{
      type: "varchar",
      array:true,
      nullable: true,
    }
  },
  relations: {
    upgradeGuides: {
      target: "SkillUpgradeGuide",
      type: "one-to-many",
      inverseSide: "skill",
    },
  },
});
