import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from "./user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from 'supertest';
import exp from "constants";
import { ValidationError } from "class-validator";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";

describe('UserService', () => {
  let app: INestApplication;
  let service: UserService;
  let userRepository: Repository<User>

  const successBody = {success: true}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'eugene',
          password: '12345d',
          database: 'user_manager_test',
          entities: [User, Role],
          synchronize: false,
          keepConnectionAlive: true,
        }),
      ]
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException({ success: false, errors: validationErrors.map((error => {
            return {property: error.property, constraints: error.constraints}})) });
      },
    }))
    app.enableCors()
    await app.init();
    service = module.get<UserService>(UserService);
    userRepository = module.get('UserRepository')

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("successful inserting a user with correct properties", async () => {
    const userForInsert = {
      login: "eugene7",
      password: "D2323$$",
      name: "Eugene",
      roles: [1, 2, 3]
    }

    expect(await userRepository.findOne({login: userForInsert.login, password: userForInsert.password})).toBeUndefined()
    const { body } = await request(app.getHttpServer())
      .post('/api/v1/users/')
      .send(userForInsert)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201);
    expect(body).toEqual(successBody)
    const insertedUser: User = await userRepository.findOne({where: {login: userForInsert.login, password: userForInsert.password}, relations: ["roles"]})
    expect(insertedUser).toBeDefined()
    expect({...insertedUser, roles: insertedUser.roles.map(role => role.id)}).toEqual(userForInsert)

  })

  it("unsuccessful inserting a user with incorrect properties", async () => {
    const userForInsert = {
      login: 415,
      password: "sd231..ds",
      roles: [4, 5, 6]
    }

    const result = {
      "success": false,
      "errors": [
        {
          "property": "login",
          "constraints": {
            "isString": "login must be a string"
          }
        },
        {
          "property": "name",
          "constraints": {
            "isNotEmpty": "name should not be empty",
            "isString": "name must be a string"
          }
        },
        {
          "property": "password",
          "constraints": {
            "matches": "password must match /((([^ \\t])*[A-Z]+([^ \\t])*[\\d]+([^ \\t])*)|(([^ \\t])*[\\d]+([^ \\t])*[A-Z]+([^ \\t])*))/ regular expression"
          }
        },
        {
          "property": "roles",
          "constraints": {
            "isEnum": "each value in roles must be a valid enum value"
          }
        }
      ]
    }

    const { body } = await request(app.getHttpServer())
      .post('/api/v1/users/')
      .send(userForInsert)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
    expect(body).toEqual(result)
    const insertedUser: User = await userRepository.findOne({where: {login: userForInsert.login, password: userForInsert.password}, relations: ["roles"]})
    expect(insertedUser).toBeUndefined()

  })

  it("successful updating the user with correct properties (not empty roles)", async () => {
    const currentUser: CreateUserDto = {
      login: "eugene7",
      password: "D2323$$",
      name: "Eugene",
      roles: [1, 2, 3]
    }

    const userForUpdate: UpdateUserDto = {
      login: "eugene7",
      password: "D2323$$",
      name: "Eug",
      roles: [1]
    }

    await successfulUserUpdate(currentUser, userForUpdate)
  })

  it("successful updating the user with correct properties (empty roles)", async () => {
    const currentUser: CreateUserDto = {
      login: "eugene7",
      password: "D2323$$",
      name: "Eugene",
      roles: [1, 2, 3]
    }

    const userForUpdate: UpdateUserDto = {
      login: "eugene7",
      password: "D2323$$",
      name: "Eug",
    }

    await successfulUserUpdate(currentUser, userForUpdate)
  })

  it("unsuccessful updating the user with incorrect properties (no required properties: name, roles)", async () => {
    const currentUser = {
      login: "eugene1",
      password: "D2323$$",
      name: "Eug",
      roles: [1, 2, 3]
    }

    const userForUpdate = {
      login: "eugene7",
      password: "D2323$$",
    }

    await service.insertUser(currentUser)
    expect(await userRepository.findOne({login: currentUser.login, password: currentUser.password})).toBeDefined()
    const { body } = await request(app.getHttpServer())
      .put('/api/v1/users/')
      .send(userForUpdate)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
    expect(body.success).toEqual(false)
  })

  it("successful removing user from database", async () => {
    const currentUser = {
      login: "eugene1",
      password: "D2323$$",
      name: "Eug",
      roles: [1, 2, 3]
    }

    await service.insertUser(currentUser)
    expect(await userRepository.findOne({login: currentUser.login, password: currentUser.password})).toBeDefined()
    const { body } = await request(app.getHttpServer())
      .delete('/api/v1/users/')
      .send({login: currentUser.login, password: currentUser.password})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(body).toEqual(successBody)
    expect(await userRepository.findOne({login: currentUser.login, password: currentUser.password})).toBeUndefined()
  })



  afterEach(async () => {
    await userRepository.query(`DELETE FROM user;`);
  });

  afterAll(async () => {
    await app.close();
  });

  async function successfulUserUpdate(currentUser: CreateUserDto, userForUpdate: UpdateUserDto) {
    await service.insertUser(currentUser)

    expect(await userRepository.findOne({login: currentUser.login, password: currentUser.password})).toBeDefined()
    const { body } = await request(app.getHttpServer())
      .put('/api/v1/users/')
      .send(userForUpdate)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(body).toEqual(successBody)
    const updatedUser: User = await userRepository.findOne({where: {login: currentUser.login, password: currentUser.password}, relations: ["roles"]})
    expect(updatedUser).toBeDefined()
    if (userForUpdate.roles)
      expect({...updatedUser, roles: updatedUser.roles.map(role => role.id)}).toEqual(userForUpdate)
    else expect(updatedUser).toEqual({...userForUpdate, roles: updatedUser.roles})
  }
});
