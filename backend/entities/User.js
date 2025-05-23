import {EntitySchema} from "typeorm";

export const role = {
  EMPLOYEE: 'employee',
  LEAD: 'lead',
  HR: 'hr'
};

export const position = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  TESTING: 'testing',
  HR: 'hr'
};

export const teamName = {
  INFORIVER: 'inforiver',
  INFOBRIDGE: 'infobridge',
  VALQ: 'valq'
};

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    name: {
      type: "varchar",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    passwordHash: {
      type: "varchar",
      nullable: true, 
      select: false,
    },
    role: {
      type: "enum",
      enum: Object.values(role),
    },
    position: {
      type: "enum",
      enum: Object.values(position),
      nullable: true,
    },
    teamName: {
      type: "enum",
      enum: Object.values(teamName),
      nullable: true,
    },
    leadId: {
      type: "varchar",
      nullable: true,
    },
    hrId: {
      type: "varchar",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    skills: {
      type: "json",
      nullable: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    }
  },
  relations: {
    updateRequests: {
      target: "SkillUpdateRequest",
      type: "one-to-many",
      inverseSide: "user",
    },
  },
});
    