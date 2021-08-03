import { RoleEnum } from "../utils/RoleEnum";

export class CreateUserDto {
  login: string;
  name: string;
  password: string;
  roles: number[];
}
