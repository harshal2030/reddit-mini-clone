import { MikroORM } from '@mikro-orm/core';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

import config from './mikro-orm.config';
import { buildSchema } from 'type-graphql';
import { __prod__ } from './constants';

const main = async () => {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();

  const app = express();

  const redisStore = connectRedis(session);
  const redisClient = redis.createClient({
    host: '172.23.215.76',
  });

  app.use(
    session({
      name: 'qid',
      store: new redisStore({ client: redisClient, disableTouch: true }),
      secret: 'sgjhfdlgsdfgjlskdfdfgsdfgffgdfgdf',
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__,
      },
      saveUninitialized: true,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res })
  });

  apolloServer.applyMiddleware({ app });

  app.listen(3000, () => {
    console.log('server listening on localhost:3000');
  })
}

main();
