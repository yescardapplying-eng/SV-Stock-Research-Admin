import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AdminRole } from '@sv-crm/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, admin.passwordHash);
    if (!isMatch) {
      return null;
    }

    const { passwordHash, ...result } = admin;
    return result;
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const admin = await this.validateUser(loginDto.email, loginDto.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    const accessToken = this.jwtService.sign(payload);

    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_LOGIN',
        entityType: 'AdminUser',
        entityId: admin.id,
        ipAddress: ip,
        metadata: { userAgent },
      },
    });

    return {
      admin,
      accessToken,
      expiresIn: 28800, // 8 hours in seconds
    };
  }

  async provisionInitialAdmin(name: string, email: string, pass: string) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('Admin already exists with this email');
    }
    const hash = await bcrypt.hash(pass, 12);
    return this.prisma.adminUser.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
