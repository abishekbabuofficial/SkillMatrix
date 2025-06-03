import { EntitySchema } from "typeorm";

export const position = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  TESTING: 'testing',
  HR: 'hr'
};

export const Position = new EntitySchema({
  name: "Position",
  tableName: "positions",
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
      inverseSide: "positions",
    }
  },
});
