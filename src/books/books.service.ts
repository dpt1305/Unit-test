import { GetBookDto } from './dto/get-book.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
@Injectable()
export class BooksService {
  private db = admin.firestore();
  async create(createBookDto: CreateBookDto) {
    try {
      const { userId, name } = createBookDto;

      const getUser = await this.db.collection('users').doc(`${userId}`).get();
      if (!getUser.exists) {
        throw new NotFoundException('Not found this author.');
      }
      const author = getUser.data().name;
      const newBook = {
        name,
        author,
        userId,
        createdAt: +moment.utc().format('x'),
        updatedAt: +moment.utc().format('x'),
      };
      await this.db.collection('books').add(newBook);

      return newBook;
    } catch (error) {
      return error.response;
    }
  }

  async findAll(query: GetBookDto) {
    try {
      const { limit, startAfter } = query;

      let quertSnapshot;
      if (!startAfter) {
        quertSnapshot = await this.db
          .collection('books')
          .orderBy('createdAt')
          .limit(+limit)
          .get();
      }
      if (startAfter) {
        quertSnapshot = await this.db
          .collection('books')
          .orderBy('createdAt')
          .limit(+limit)
          .startAfter(+startAfter)
          .get();
      }
      // if (!quertSnapshot) {
      //   throw new BadRequestException();
      // }
      const users = quertSnapshot.docs.map((doc) => {
        return { bookId: doc.id, ...doc.data() };
      });
      return users;
    } catch (error) {
      return error.response;
    }
  }

  async findOne(id: string) {
    try {
      const getBook = await this.db.collection('books').doc(id).get();
      if (!getBook.exists) {
        throw new NotFoundException('Not found book.');
      }
      return { bookId: id, ...getBook.data() };
    } catch (error) {
      return error.response;
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    try {
      const getBook = await this.db.collection('books').doc(id).get();

      if (!getBook.exists) {
        throw new NotFoundException('Not found book.');
      }
      const request = await this.db
        .collection('books')
        .doc(id)
        .set(
          {
            ...updateBookDto,
            updatedAt: +moment.utc().format('x'),
          },
          { merge: true },
        );
      return `This action updates a #${id} book`;
    } catch (error) {
      return error.response;
    }
  }

  async remove(id: string) {
    try {
      const getBook = await this.db.collection('books').doc(id).get();

      if (!getBook.exists) {
        throw new NotFoundException('Not found book.');
      }
      const querySnapshot = await this.db.collection('books').doc(id).delete();
      return `This action removes a #${id} book`;
    } catch (error) {
      return error.response;
    }
  }
}
