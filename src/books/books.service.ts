import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import * as admin from 'firebase-admin';
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

      const date = new Date();
      const author = getUser.data().name;
      const res = await this.db
        // .collection('users')
        // .doc(userId)
        .collection('books')
        .add({
          name,
          author,
          createdAt: date,
          updatedAt: date,
        });
      return { name, author };
    } catch (error) {
      return error.response;
    }
  }

  async findAll() {
    return `This action returns all books`;
  }

  async findOne(id: string) {
    try {
      // const res = await this.db.collection('users').;
      // .doc(id).get();
      // .where(this.db.getAll, '==', `${id}`))
      // .where(admin.firestore.FieldPath.documentId(), '==', id)
      const users = await this.db
        .collection('users')
        .listDocuments()
        
      // console.log(users);
      users.forEach( async doc => {
        const result =await  doc.collection('books')
        // .doc(`${id}`)
        // .where('id', '==', id)
        .get();
        // console.log(result.docs.forEach());
      });
      // const usersId = [];
      // res.forEach((doc) => {
      //   usersId.push(doc.listCollections());
      // });
      // console.log( usersId );
      return `This action returns a #${id} book`;
    } catch (error) {
      return error.response;
    }
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: string) {
    return `This action removes a #${id} book`;
  }
}
