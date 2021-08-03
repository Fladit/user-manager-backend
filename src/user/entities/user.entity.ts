import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Role } from "./role.entity";

@Entity()
export class User {

  @PrimaryColumn()
  login: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @ManyToMany(type => Role)
  @JoinTable()
  roles: Role[];
}
