import { Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller('/api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getUsers() {
    return this.userService.getUsers()
  }

  @Get()
  getUser() {
    return this.userService.getUser()
  }

  @Post()
  insertUser() {
    return this.userService.insertUser()
  }

  @Put()
  updateUser() {
    return this.userService.updateUser()
  }

  @Delete()
  removeUser() {
    return this.userService.removeUser()
  }


}
