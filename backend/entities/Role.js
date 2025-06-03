import { EntitySchema } from "typeorm";

export const role = {
  EMPLOYEE: 'employee',
  LEAD: 'lead',
  HR: 'hr'
};

export const Role = new EntitySchema({
  name: "Role",
  tableName: "roles",
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
  },
  relations: {
    user: {
      target: "User",
      type: "one-to-many",
      inverseSide: "roles",
    }
  },
});
