import { EntitySchema } from "typeorm";

export const Team = new EntitySchema({
  name: "Team",
  tableName: "teams",
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
      inverseSide: "teams",
    }
  },
});
