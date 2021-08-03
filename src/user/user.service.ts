import { HttpException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RemoveUserDto } from "./dto/remove-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Role } from "./entities/role.entity";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>,
              @InjectRepository(Role) private rolesRepository: Repository<Role>) {
    rolesRepository.findOne(1).then(res => {
      if (!res) {
        this.initDb()
        console.log("init")
      }
    })
  }
  async getUsers() {
    return await this.usersRepository.find({select: ["login", "name"], relations: ["roles"]})
  }

  async getUser(login: string) {
    return await this.usersRepository.findOne({select: ["login", "name"], relations: ["roles"], where: {login}}) || "User is not found"
  }

  async insertUser(createUserDto: CreateUserDto) {
    if (!await this.usersRepository.findOne({ login: createUserDto.login })) {
      const user = this.usersRepository.create({ ...createUserDto, roles: [] })
      for (const role of createUserDto.roles) {
        const currentRole = await this.rolesRepository.findOne(role)
        if (currentRole)
          user.roles.push(currentRole)
        else throw new HttpException({success: false, errors: ["Invalid user's role"]}, 400)
      }
      await this.usersRepository.save(user)
      return {success: true}
    }
    throw new HttpException({success: false, errors: ["User is already exist"]}, 400)
  }


  async updateUser(updateUserDto: UpdateUserDto) {

  }

  async removeUser(removeUserDto: RemoveUserDto) {
  }


  async initDb() {
    await this.rolesRepository.save([{name: "ADMIN"}, {name: "OPERATOR"}, {name: "ANALYST"}])
  }
}
