import { IsNotEmpty, IsString } from "class-validator";
import { PickType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";

export class RemoveUserDto extends PickType(CreateUserDto, ["login", "password"]) {}
