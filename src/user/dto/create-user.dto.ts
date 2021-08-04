import { RoleEnum } from "../utils/RoleEnum";
import {
  ArrayMinSize,
  IsArray, IsDefined, IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches
} from "class-validator";
import { Role } from "../entities/role.entity";

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/((([^ \t])*[A-Z]+([^ \t])*[\d]+([^ \t])*)|(([^ \t])*[\d]+([^ \t])*[A-Z]+([^ \t])*))/)
  password: string;

  @IsDefined()
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsEnum(RoleEnum, {each: true})
  roles: RoleEnum[];
}
