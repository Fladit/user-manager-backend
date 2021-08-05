import {
  ArrayMinSize,
  IsArray, IsDefined, IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import { PickType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { RoleEnum } from "../utils/RoleEnum";

export class UpdateUserDto extends PickType(CreateUserDto, ["login", "name", "password"]) {
  @IsOptional()
  @IsArray()
  @IsEnum(RoleEnum, {each: true})
  roles?: RoleEnum[];
}
