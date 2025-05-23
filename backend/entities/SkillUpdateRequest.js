import { EntitySchema } from "typeorm";

export const SkillUpdateRequest = new EntitySchema({
  name: "SkillUpdateRequest",
  tableName: "skill_update_requests",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    requestedAt: {
      type: "timestamp",
      createDate: true,
    },
    skillScore: {
      type: "json",
    },
    editedSkillScore: {
      type: "json",
      nullable: true,
    },
    status: {
      type: "enum",
      enum: ["Pending", "Approved", "Rejected", "Cancelled", "Forwarded"],
      default: "Pending",
    },
    reviewHistory: {
      type: "json", // [{reviewedBy, reviewedAt, comments}]
      nullable: true,
    },
    reviewChain: {
      type: "simple-array", // ['leadId', 'hrId']
      nullable: true,
    },
    currentReviewer: {
      type: "varchar",
      nullable: true,
    },
    userId: {
      type: "varchar",
    }
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: {name: "userId"},
      onDelete: "CASCADE",
    },
  },
});
