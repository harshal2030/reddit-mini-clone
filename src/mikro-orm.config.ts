import { Post } from './entities/Post'
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import { User } from './entities/User';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: 'reddit',
  user: 'postgres',
  password: 'AJHK@221133',
  debug: !__prod__,
  type: 'postgresql',
  entities: [Post, User],
} as Parameters<typeof MikroORM.init>[0];
