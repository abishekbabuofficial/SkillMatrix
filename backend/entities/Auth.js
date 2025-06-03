import { EntitySchema, JoinColumn } from "typeorm";

export const Auth = new EntitySchema({
  name: "Auth",
  tableName: "auths",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    email: {
      type: "varchar",
      unique: true
    },
    passwordHash: {
      type: "varchar",
      nullable: true, 
      select: false,
    },
  },
  relations: {
  //   user: {
  //   target: "User",
  //   type: "one-to-one",
  //   joinColumn: {
  //     name: "id",
  //     referencedColumnName: "id",
  //   },
  //   onDelete: "CASCADE",
  // }
  // },
  // user: {
  //   target: "User",
  //   type: "one-to-one",
  //   joinColumn: {
  //     name: "email",
  //     referencedColumnName: "email",
  //   },
  //   onDelete: "CASCADE",
  // },
  user: {
    target: "User",
    type: "many-to-one",
    joinColumn: {
      name: "email",
      referencedColumnName: "email"
    },
    onDelete: "CASCADE",
  }
}

});
