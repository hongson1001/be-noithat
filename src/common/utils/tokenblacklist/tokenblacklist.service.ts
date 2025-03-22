import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TokenBlacklist,
  TokenBlacklistDocument,
} from '../../models/schema/tokenblacklist.schema.ts';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectModel(TokenBlacklist.name)
    private readonly tbModel: Model<TokenBlacklistDocument>,
  ) {}

  async addTokenToBlacklist(token: string, expiresIn: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await new this.tbModel({ token, expiresAt }).save();
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenDocs = await this.tbModel.findOne({ token }).exec();

    return !!tokenDocs;
  }
}
