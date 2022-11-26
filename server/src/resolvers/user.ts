import { COOKIE_NAME } from './../constants';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';
import {EntityManager} from '@mikro-orm/postgresql';

@InputType()
class UsernamePasswordType {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: String;

  @Field()
  message: String;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { em }: MyContext) {
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req, em }: MyContext,
  ) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordType,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    if (!options.email.includes('@')) {
      return {
        errors: [
          {
            field: 'email',
            message: 'invalid email',
          }
        ]
      }
    }


    if (options.username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'username too short',
        }]
      }
    }

    if (options.password.length <= 3) {
      return {
        errors: [{
          field: 'password',
          message: 'password too short',
        }]
      }
    }

    const hashedPWD = await argon2.hash(options.password);
    let user;
    try {
      const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
        username: options.username,
        email: options.email,
        password: hashedPWD,
        created_at: new Date(),
        update_at: new Date(),
      }).returning('*');

      user = result[0]
    } catch (e) {
      if (e.code === '23505') {
        return {
          errors: [{
            field: 'username',
            message: 'username already taken',
          }]
        };
      }
    }

    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, usernameOrEmail.includes('@') ? 
      { email: usernameOrEmail } :
      { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username not exists',
          }
        ]
      }
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          }
        ]
      }
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() {req, res}: MyContext
  ) {
    return new Promise(resolve => req.session.destroy((err) => {
      res.clearCookie(COOKIE_NAME);

      if (err) {
        console.log(err);
        resolve(false);
        return;
      }

      resolve(true);
    })) 
  }
}
