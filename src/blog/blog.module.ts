import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../common/models/schema/blog.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret:
        process.env.ADMIN_SECRET_KEY ||
        process.env.USER_SECRET_KEY ||
        'default_secret',
      signOptions: {
        expiresIn: '24h',
      },
    }),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
