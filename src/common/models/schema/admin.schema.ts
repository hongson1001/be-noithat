import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class Admin {
  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop({ enum: ['mod', 'admin', 'superadmin'], default: 'admin' })
  role: string;

  @Prop({ default: 'active' })
  status: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

export type AdminDocument = Admin & Document;

AdminSchema.pre<AdminDocument>('save', async function (next) {
  const admin = this as AdminDocument;
  if (admin.isModified('password') || admin.isNew) {
    const salt = await bcrypt.genSalt();
    admin.password = await bcrypt.hash(admin.password, salt);
  }
  next();
});

AdminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};
