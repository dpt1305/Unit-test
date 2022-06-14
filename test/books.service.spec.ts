import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from '../src/books/books.controller';
import { BooksService } from '../src/books/books.service';
import * as admin from 'firebase-admin';
import { mockGet } from 'firestore-jest-mock/mocks/firestore';
import { SortType } from '../src/books/dto/get-book-by-id.dto';
import { NotFoundException } from '@nestjs/common';

const mockId = 'alan';
const userId = 'Psd1apFENrqrfKRpCYE6';
const mockUser = {
  name: 'Joker',
};
const docData = {
  bookId: 'xjERLw8hAlONcBWT1AwU',
  author: 'Joker',
  updatedAt: 1654746966918,
  userId: 'Psd1apFENrqrfKRpCYE6',
  createdAt: 1654746966916,
  name: 'Orange',
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
  docs: {
    map: jest.fn(() => arrayData),
  },
  // docs: jest.fn(() => ({
  //   map: () => arrayData,
  // })),
};
const notExistResult = {
  exists: false,
  id: mockId,
  data: () => null,
  forEach: jest.fn(),
};
const mockedGetLimit = {
  get: jest.fn(() => Promise.resolve(arrayData)),
};
const mockedGetForMap = {
  get: jest.fn(() => Promise.resolve(mockArrayResult)),
};
const mockedSet = {
  set: jest.fn(),
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
        limit: jest.fn(() => ({
          get: mockedGetForMap.get,
          startAfter: jest.fn(() => ({
            get: mockedGetForMap.get,
          })),
          where: jest.fn(() => ({
            get: mockedGetForMap.get,
            startAfter: jest.fn(() => ({
              get: mockedGetForMap.get,
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
      limit: jest.fn(() => mockedGetLimit.get),
    })),
  })),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
}));

describe('Book service', () => {
  let booksService: BooksService;
  let booksController: BooksController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [BooksService],
    }).compile();

    booksService = moduleRef.get<BooksService>(BooksService);
    booksController = moduleRef.get<BooksController>(BooksController);
  });

  describe('findOne', () => {
    it('service should be called', async () => {
      const spy = jest.spyOn(booksService, 'findOne');
      await booksService.findOne('alan');
      expect(spy).toBeCalled();
    });
    it('should return error', async () => {
      mockedGet.get.mockResolvedValueOnce(notExistResult);
      const res = await booksService.findOne('a');

      expect(res.statusCode).toBe(404);
    });
    it('should return correctly', async () => {
      const result = await booksService.findOne(mockId);
      expect(result).toEqual(docData);
    });
  });
  describe('create', () => {
    it('should return not found user', async () => {
      mockedGet.get.mockResolvedValueOnce(notExistResult);
      const res = await booksService.create({
        userId: 'asdf',
        name: 'Orange',
      });
      expect(res.statusCode).toEqual(404);
    });
    it('should return a new book', async () => {
      const res = await booksService.create({ userId, name: 'Orange' });
      expect(res).toHaveProperty('name');
    });
  });
  describe('update', () => {
    it('should return not found exception', async () => {
      mockedGet.get.mockResolvedValueOnce(notExistResult);
      const res = await booksService.update('a', { name: 'asdf' });
      // console.log(res);
      expect(res.statusCode).toEqual(404);
    });
    it('should return successfully', async () => {
      const res = await booksService.update(mockId, { name: 'ABC' });

      expect(res).toEqual(`This action updates a #alan book`);
    });
  });
  describe('remove', () => {
    it('should return error', async () => {
      mockedGet.get.mockResolvedValueOnce(notExistResult);
      const res = await booksService.remove('sadfasdf');
      expect(res.statusCode).toEqual(404);
    });
    it('should return success', async () => {
      const res = await booksService.remove('adsf');
      expect(res).toEqual('This action removes a #adsf book');
    });
  });
  describe('findAll', () => {
    it('find with limit => should return array of books', async () => {
      const result = await booksService.findAll({ limit: 2 });
      expect(result).toEqual(arrayData);
    });
    it('find with limit, startAfter => should return array of books', async () => {
      const result = await booksService.findAll({
        limit: 2,
        startAfter: 12343534234,
      });
      expect(result).toEqual(arrayData);
    });
  });
  describe('findByUserId', () => {
    it('not found user => should return error', async () => {
      mockedGet.get.mockResolvedValueOnce(notExistResult);
      const res = await booksService.findByUserId('a', {
        sort: SortType.ASC,
        limit: 2,
        startAfter: 0,
      });

      expect(res.statusCode).toBe(404);
      // expect(res).toThrow(NotFoundException);
      // await expect(res).rejects.toThrow(NotFoundException);

      // expect(res.statusCode).toBe(404);
      // expect(res).rejects.toThrow(
      //   new NotFoundException('Not found this user.'),
      // );
    });
    it('should return an array of book', async () => {
      const res = await booksService.findByUserId('alan', {
        sort: SortType.ASC,
        limit: 2,
        startAfter: 0,
      });
      expect(res).toEqual(arrayData);
    });
    it('should return an array of book', async () => {
      const res = await booksService.findByUserId('alan', {
        sort: SortType.ASC,
        limit: 2,
        startAfter: 123423543,
      });
      expect(res).toEqual(arrayData);
    });
  });
});
