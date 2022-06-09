import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import * as admin from 'firebase-admin';
import { mockGet } from 'firestore-jest-mock/mocks/firestore';

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
  docs: arrayData,
  // docs: jest.fn(() => ({
  //   forEach: jest.fn(() => Promise.resolve(mockArrayResult)),
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
          get: mockedGetLimit.get,
          startAfter: jest.fn(() => ({
            get: mockedGetLimit.get,
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
      const result = res.statusCode;

      expect(result).toBe(404);
    });
    it('should return correctly', async () => {
      let result = await booksService.findOne(mockId);
      result = { userId: mockId, ...result };

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
    it('should return array of books', async () => {
      
    });
  })
});
