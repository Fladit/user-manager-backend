import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RemoveUserDto } from "./dto/remove-user.dto";

@Controller('/api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getUsers() {
    return this.userService.getUsers()
  }

  @Get(':login')
  getUser(@Param('login') login: string) {
    return this.userService.getUser(login)
  }

  @Post()
  insertUser(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto)
    return this.userService.insertUser(createUserDto)
  }

  @Put()
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(updateUserDto)
  }

  @Delete()
  removeUser(@Body() removeUserDto: RemoveUserDto) {
    return this.userService.removeUser(removeUserDto)
  }


}
