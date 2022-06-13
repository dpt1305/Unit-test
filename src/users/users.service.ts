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
import * as moment from 'moment';

@Injectable()
export class UsersService {
  private db = admin.firestore();
  async create(createUserDto: CreateUserDto) {
    try {
      const { age } = createUserDto;
      if (age < 0 || age % 1 != 0) {
        throw new BadRequestException();
      } else {
        const newUser = { ...createUserDto };

        await this.db.collection('users').add({
          ...createUserDto,
          createdAt: +moment.utc().format('x'),
          updatedAt: +moment.utc().format('x'),
        });
        return newUser;
      }
    } catch (error) {
      return error.response;
    }
  }

  async findAll(query: GetUserDto) {
    const { limit, page } = query;
    let querySnapshot;

    if (page) {
      querySnapshot = await this.db
        .collection('users')
        .orderBy('createdAt')
        .limit(+limit)
        .startAfter(+page)
        .get();
    }
    if (!page) {
      querySnapshot = await this.db
        .collection('users')
        .orderBy('createdAt')
        .limit(+limit)
        .get();
    }

    const users = querySnapshot.docs.map((doc) => {
      return { userId: doc.id, ...doc.data() };
    });

    return users;
  }

  async findOne(id: string) {
    const res = await this.db.collection('users').doc(id).get();
    if (!res.exists) {
      return new NotFoundException('Not found this user.');
    }
    return res.data();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const res = await this.findOne(id);
    const res2 = await this.db
      .collection('users')
      .doc(id)
      .set(
        {
          ...updateUserDto,
          updatedAt: +moment.utc().format('x'),
        },
        { merge: true },
      );
    return `Update user id: ${id} successfully.`;
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
