import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function provisionSuperAdmin() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set in environment or .env file');
  }

  // Safety check: Never run on unintended endpoints
  if (dbUrl.includes('snowy-breeze')) {
    throw new Error('SAFETY VIOLATION: Production endpoint detected! Aborting.');
  }

  console.log('=== SV Stock Research CRM - Super Admin Provisioning ===');
  console.log('Database Host:', dbUrl.split('@')[1]?.split('/')[0]);

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@svstockresearch.in').toLowerCase().trim();
    const adminName = process.env.ADMIN_INITIAL_NAME || 'Super Administrator';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@SvStock2026!#';

    // 1. Check if user already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log(`\n[IDEMPOTENT] Admin user with email "${adminEmail}" already exists.`);
      console.log('   ID:', existing.id);
      console.log('   Role:', existing.role);
      console.log('   IsActive:', existing.isActive);

      // Verify password validity
      const isMatch = await bcrypt.compare(adminPassword, existing.passwordHash);
      console.log('   Password Authentication Check:', isMatch ? 'VERIFIED (Matches expected password)' : 'DIFFERENT PASSWORD ALREADY SET');
      return existing;
    }

    // 2. Hash password with bcrypt 12 rounds
    console.log(`\nGenerating bcrypt hash (12 salt rounds) for ${adminEmail}...`);
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // 3. Create Super Admin record
    const newAdmin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      },
    });

    console.log('\n[SUCCESS] Super Admin account successfully provisioned:');
    console.log('   ID:', newAdmin.id);
    console.log('   Email:', newAdmin.email);
    console.log('   Name:', newAdmin.name);
    console.log('   Role:', newAdmin.role);
    console.log('   Active:', newAdmin.isActive);
    console.log('   Created At:', newAdmin.createdAt.toISOString());

    // 4. Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        adminId: newAdmin.id,
        action: 'SUPER_ADMIN_PROVISIONED',
        entityType: 'AdminUser',
        entityId: newAdmin.id,
        metadata: {
          email: newAdmin.email,
          role: newAdmin.role,
          method: 'CLI_SECURE_PROVISIONING',
        },
      },
    });
    console.log('   Audit Log recorded: SUPER_ADMIN_PROVISIONED');

    // 5. Verify authentication logic
    const authValid = await bcrypt.compare(adminPassword, newAdmin.passwordHash);
    if (!authValid) {
      throw new Error('Verification failed: Generated bcrypt hash did not match password!');
    }
    console.log('   Authentication Self-Test: PASSED (bcrypt.compare confirmed valid)');

    return newAdmin;
  } finally {
    await prisma.$disconnect();
  }
}

provisionSuperAdmin()
  .then(() => {
    console.log('\n>>> Super Admin provisioning task COMPLETED successfully! <<<\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n*** Provisioning FAILED ***:', err.message);
    process.exit(1);
  });
