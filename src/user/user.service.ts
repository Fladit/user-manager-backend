import { HttpException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RemoveUserDto } from "./dto/remove-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Role } from "./entities/role.entity";
import { RoleEnum } from "./utils/RoleEnum";

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
      const userRoles = new Set(createUserDto.roles)
      for (const role of userRoles) {
        const currentRole = await this.rolesRepository.findOne(role)
        user.roles.push(currentRole)
      }
      await this.usersRepository.save(user)
      console.log("Inserted user: ", user)
      return {success: true}
    }
    throw new HttpException({success: false, errors: ["User is already exist"]}, 400)
  }


  async updateUser(updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: {login: updateUserDto.login, password: updateUserDto.password}, relations: ["roles"]})
    if (user) {
      const userDataChanges: {name?: string, roles?: Role[]} = {}
      const currentUserRoles: number[] = user.roles.map((role) => role.id)
      const rolesForUpdate: Set<RoleEnum> = new Set(updateUserDto.roles)

      if (updateUserDto.roles && !this.areSortedArrayEqual([...rolesForUpdate].sort(), currentUserRoles.sort())) {

        userDataChanges.roles = []
        for (const role of rolesForUpdate) {
          const currentRole = await this.rolesRepository.findOne(role)
          userDataChanges.roles.push(currentRole)
        }
      }

      if (user.name !== updateUserDto.name)
        userDataChanges.name = updateUserDto.name
      if (Object.keys(userDataChanges).length) {
        // save - Saves a given entity or array of entities. If the entity already exist in the database, it is updated.
        // If the entity does not exist in the database, it is inserted. It saves all given entities in a single transaction
        // (in the case of entity, manager is not transactional). Also supports partial updating since all undefined properties are skipped.
        await this.usersRepository.save({login: updateUserDto.login, password: updateUserDto.password, ...userDataChanges})
        console.log("User data was changed")
      }
      return {success: true}
    }
    throw new HttpException({success: false, errors: ["User is not found"]}, 400)

  }

  async removeUser(removeUserDto: RemoveUserDto) {
    console.log("User remove: ", removeUserDto)
    const user = await this.usersRepository.findOne({...removeUserDto})
    if (user) {
      await this.usersRepository.remove(user)
      return {success: true}
    }
    throw new HttpException({success: false, errors: ["User is not found"]}, 404)
  }


  async initDb() {
    await this.rolesRepository.save([{name: "ADMIN"}, {name: "OPERATOR"}, {name: "ANALYST"}])
  }

  areSortedArrayEqual(arr1: any[], arr2: any[]) {
    if (arr1.length === arr2.length) {
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}
