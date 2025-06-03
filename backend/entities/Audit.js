import { EntitySchema } from "typeorm";

export const Audit = new EntitySchema({
  name: "Audit",
  tableName: "audit",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    assessmentId: {
      type: "int",
    },
    auditType: {
      type: "varchar",
      nullable: true,
    },
    editorId: {
      type: "int",
    },
    auditedAt: {
      type: "timestamp",
      createDate: true,
    },
    comments: {
      type: "text",
      nullable: true,
    }
  },
  relations: {
    User: {
      target: "User",
      type: "many-to-one",
      joinColumn:{
        name:"editorId"
      }
    },
    assessmentRequest: {
      target: "AssessmentRequest",
      type: "many-to-one",
      joinColumn:{
        name:"assessmentId"
      }
    }
  },
});
