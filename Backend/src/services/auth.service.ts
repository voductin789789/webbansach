import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth.validator';
import { HttpError } from '../utils/httpError';

export class AuthService {
  async register(data: RegisterInput) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });

      if (existingUser) {
        throw new HttpError(409, 'Email này đã được sử dụng');
      }

      const createdUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          address: data.address,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          role: true,
          loyaltyPoints: true,
          createdAt: true,
        },
      });

      await tx.cart.create({
        data: { userId: createdUser.id },
      });

      return createdUser;
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new HttpError(401, 'Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new HttpError(401, 'Email hoặc mật khẩu không chính xác');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new HttpError(404, 'Không tìm thấy người dùng');
    }

    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        loyaltyPoints: true,
        updatedAt: true,
      },
    });
  }
}

export const authService = new AuthService();

