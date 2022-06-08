import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import * as FireStore from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  private db = admin.firestore();
  async create(createUserDto: CreateUserDto) {
    try {
      // const db = FireStore.getFirestore();
      const { name, age } = createUserDto;
      const newUser = { name, age };

      const date = new Date();

      await this.db.collection('users').add({
        ...newUser,
        createdAt: date,
        updatedAt: date,
      });
      if (age < 0 || age %1 != 0) throw new BadRequestException();
      return newUser;
    } catch (error) {
      // throw new BadRequestException();
      return error.response;
    }
  }

  async findAll(query: GetUserDto) {
    try {
      const { limit, page } = query;
      // const db = FireStore.getFirestore();
      // console.log(db);
      const res = await this.db.collection('users').orderBy('createdAt').get();
      const users = [];
      res.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      const start = (page - 1) * limit;
      const end = start + Number(limit);

      const result = users.slice(start, end);
      return result;
      // return users;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findOne(id: string) {
    try {
      // const db = FireStore.getFirestore();
      const res = await this.db.collection('users').doc(`${id}`).get();
      if (!res.exists) {
        throw new NotFoundException('Not found this user.');
      }
      return res.data();
    } catch (error) {
      return error.response;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // const db = FireStore.getFirestore();
      const res = await this.db.collection('users').doc(id).get();
      
      if (!res.exists) {
        throw new NotFoundException('Not found this user.');
      }
      const date = new Date();
      await this.db
        .collection('users')
        .doc(`${id}`)
        .set(
          {
            ...updateUserDto,
            updatedAt: date,
          },
          { merge: true },
        );
      return `Update user id: ${id} successfully.`;
    } catch (error) {
      return error.response;
    }
  }

  async remove(id: string) {
    try {
      // const db = FireStore.getFirestore();
      const res = await this.db.collection('users').doc(`${id}`).get();
      if (res.exists) {
        await this.db.collection('users').doc(`${id}`).delete();
        return `This action removes a #${id} user`;
      } else {
        throw new NotFoundException('Not found this user.');
      }
    } catch (error) {
      return error.response;
    }
  }
}
