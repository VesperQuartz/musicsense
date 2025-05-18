import { db } from '../../lib/db';
import { UserInsert, UserSelect } from '../../types';
import { to } from 'await-to-ts';
import { usersTable } from './database/schema';
import { eq } from 'drizzle-orm';

interface IUserRepo {
  save(data: UserInsert): Promise<UserSelect>;
  findById(id: string): Promise<UserSelect | null>;
}

export class UserRepo implements IUserRepo {
  async findById(id: string): Promise<UserSelect | null> {
    const [error, user] = await to(db.select().from(usersTable).where(eq(usersTable.id, id)));
    if (error) throw new Error(error.message);
    return user[0];
  }

  async save(data: UserInsert): Promise<UserSelect> {
    const [error, user] = await to(db.insert(usersTable).values(data).returning());
    if (error) throw new Error(error.message);
    return user[0];
  }
}
