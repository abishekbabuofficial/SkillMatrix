import bcrypt from "bcrypt";
import Jwt from "@hapi/jwt";
import { AppDataSource } from "../config/dataSource.js";
import { User } from "../entities/User.js";
import { Auth } from "../entities/Auth.js";

const userRepo = AppDataSource.getRepository(User);
const authRepo = AppDataSource.getRepository(Auth);

const AuthController = {
  login: async (req, h) => {
    try {
      const { email, password } = req.payload;
      const auth = await authRepo
        .createQueryBuilder("auth")
        .addSelect("auth.passwordHash")
        .where("auth.email = :email", { email: email })
        .getOne();

      const user = await userRepo.findOne({
        where: { email },
        relations: ["role"],
      });

      if (!user || !auth.passwordHash) {
        return h
          .response({
            error:
              "Invalid username or password does not exist. Please sign up",
          })
          .code(401);
      }

      const isMatch = await bcrypt.compare(password, auth.passwordHash);
      if (!isMatch) {
        return h.response({ error: "Invalid credentials" }).code(401);
      }

      const token = Jwt.token.generate(
        {
          id: user.id,
          role: user.role? user.role.name : null,
          name: user.name,
        },
        { key: process.env.JWT_SECRET_KEY, algorithm: "HS256" }
      );

      return h.response({ token }).code(200);
    } catch (error) {
      return h.response({ error: "Internal Server Error" }).code(500);
    }
  },

  signup: async (req, h) => {
    try {
      const { email, password } = req.payload;

      // validation
      if (!email || !password) {
        return h
          .response({ error: "Email and Password are required fields" })
          .code(400);
      }

      const existing = await userRepo.findOneBy({ email });
      const authDetails = await authRepo.findOneBy({ email });
      if (!existing) {
        return h
          .response({
            error: "User not found for this email. Please Contact Admin",
          })
          .code(404);
      }

      if (authDetails.passwordHash) {
        return h
          .response({
            error: "Password already set for this email address. Please Login",
          })
          .code(409);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      authDetails.passwordHash = passwordHash;
      await authRepo.save(authDetails);

      return h.response({ message: "Password set successfully" }).code(201);
    } catch (error) {
      h.response({ error: "Internal Server Error" }).code(500);
    }
  },
};

export default AuthController;
