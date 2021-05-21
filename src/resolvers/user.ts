import { User } from '../entities/User';
import { MyContext } from '../types';
import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordType {
  @Field()
  username: string;

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
    const user = em.create(User, { username: options.username, password: hashedPWD });
    try {
      await em.persistAndFlush(user);
    } catch (e) {
      return {
        errors: [{
          field: 'username',
          message: 'username already taken',
        }]
      }
    }

    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordType,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
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

    const valid = await argon2.verify(user.password, options.password);

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
}
