import { AppDataSource } from '../config/dataSource.js';
import { User } from '../entities/User.js';

const userRepo = AppDataSource.getRepository(User);

const UserService = {
    // General user operations
  getUserById: async (id) => {
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error('User not found');
    return user;
  },

  getAllUsers: async (filter = {}) => {
    const where = {};
    
    if (filter.role) where.role = filter.role;
    if (filter.position) where.position = filter.position;
    if (filter.teamName) where.teamName = filter.teamName;

    return await userRepo.find({ where });
  },

  // Hr CRUD Operations
  createUser: async (data) => {
    const newUser = userRepo.create(data);
    return await userRepo.save(newUser);
  },

  updateUser: async (data) => {
    const id = data.id;
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error('User not found');
    userRepo.merge(user, data); // accepts only the valid fields for update
    return await userRepo.save(user);
  },

  deleteUser: async (id) => {
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error('User not found');
    return await userRepo.remove(user);
  },

  getSkillMatrixByTeam: async (teamName) =>{
    const users = await userRepo.find({
        where:{
            teamName:teamName,
        },
        select:['id','name','role','teamName','position','skills'],
    });
    return users;
  },

  getFullSkillMatrix: async () =>{
    return await userRepo.find({
        select:['id','name','role','teamName','position','skills']
    });
  },

};

export default UserService;
