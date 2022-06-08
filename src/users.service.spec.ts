import { UsersController } from './users/users.controller';
import { UpdateUserDto } from './users/dto/update-user.dto';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UsersService } from './users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as admin from 'firebase-admin';
import { BadRequestException } from '@nestjs/common';

const mockId = 'alan';
const docData = {
  name: 'test data',
  age: 15,
  createdAt: 'Jun 6, 2022',
  updatedAt: 'Jun 6, 2022',
};
const arrayData = [docData, docData, docData];

const docResult = {
  exists: true,
  id: mockId,
  data: () => docData,
  forEach: jest.fn(),
};
const mockArrayResult = {
  exists: true,
  id: mockId,
  data: () => arrayData,
  forEach: jest.fn(),
};
const notExistResult = {
  exists: false,
  id: mockId,
  data: () => null,
  forEach: jest.fn(),
};

const mockedSet = {
  set: jest.fn(),
  // set: jest.fn((object, merge) => {
  //   if(merge.merge) {
  //     return {
  //       ...docData,
  //       ...object,
  //     };
  //   }
  // }),
};
const mockedGet = {
  get: jest.fn(() => Promise.resolve(docResult)),
};
jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      orderBy: jest.fn(() => ({
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            where: jest.fn(() => ({
              get: mockedGet.get,
            })),
          })),
        })),
      })),
      doc: jest.fn((param) => ({
        // get: jest.fn(),
        get: mockedGet.get,
        set: mockedSet.set,
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: jest.fn(),
            get: mockedGet.get,
            delete: jest.fn(),
          })),
          add: jest.fn(() => ({
            get: mockedGet.get,
          })),
          get: mockedGet.get,
        })),
        delete: jest.fn(),
      })),
      add: jest.fn(() => ({
        collection: jest.fn(() => ({
          add: jest.fn(() => ({
            get: mockedGet.get,
          })),
        })),
      })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          where: jest.fn(() => ({
            where: jest.fn(() => ({
              get: mockedGet.get,
            })),
          })),
        })),
        get: mockedGet.get,
      })),
    })),
  })),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
}));

describe('UserService', () => {
  let usersService: UsersService;
  let usersController: UsersController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);
  });

  describe('findOne', () => {
    it('user service should be called ', async () => {
      const spy = jest.spyOn(usersService, 'findOne');
      const result = await usersService.findOne('Uk9GxnKpJ2OJH9CQEOCq');

      expect(spy).toBeCalled();
    });
    it('should return error', async () => {
      mockedGet.get.mockResolvedValueOnce(notExistResult);
      const res = await usersService.findOne('a');
      expect(res.statusCode).toBe(404);
    });
    it('it should return docData', async () => {
      // mockedGet.get.mockResolvedValueOnce(docResult);
      const res = await usersService.findOne('alan');
      expect(res).toBe(docResult.data());
    });
  });
  describe('create', () => {
    it('user should be create', async () => {
      const mockResult = {
        name: 'string',
        age: 0,
      };
      const spy = jest.spyOn(usersService, 'create');
      const result = await usersService.create({
        name: 'string',
        age: 0,
      });
      expect(spy).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
    it('should be error when pass age < 0', async () => {
      const result2 = await usersService.create({
        name: 'string',
        age: -1,
      });
      expect(result2.statusCode).toBe(400);
    });
  });
  describe('update', () => {
    it('should throw NotFoundException if id incorrect', async () => {
      mockedGet.get.mockResolvedValueOnce(notExistResult);
      const res = await usersService.update('aan', { age: 13 });
      expect(res.statusCode).toBe(404);
    });
    it('update successfully', async () => {
      // mockedGet.get.mockReturnValueOnce(docResult);
      const res = await usersService.update('alan', { age: 13 });
      expect(res).toBe('Update user id: alan successfully.');
    });
  });
  describe('delete', () => {
    it('should delete successfully', async () => {
      const res = await usersService.remove('alan');
      expect(res).toBe(`This action removes a #alan user`);
    });
    it('should throw not found user', async () => {
      mockedGet.get.mockResolvedValueOnce(notExistResult);
      const res = await usersService.remove('abc');
      expect(res.error).toBe('Not Found');
    });
  });
  // describe('findAll', () => {
  //   it('should return an array', async () => {
  //     mockedGet.get.mockResolvedValueOnce(mockArrayResult);
  //     const res = await usersService.findAll({ page: 1, limit: 1 });
  //     // expect(res).toEqual(
  //     //   expect.arrayContaining([
  //     //     expect.objectContaining({})
  //     //   ])
  //     // );
  //   });
  // });
});
