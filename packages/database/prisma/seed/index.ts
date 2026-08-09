import { PrismaClient } from '@prisma/client';
import { seedAIConsultants } from './ai-consultants';
import { consultants as humanConsultants } from './consultants';
import { users } from './users';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        wallet: {
          create: {
            balance: 1000,
            escrow: 0,
            pendingIn: 0,
            pendingOut: 0,
            blocked: 0,
          },
        },
      },
    });
  }

  // Create human consultants
  for (const data of humanConsultants) {
    let user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          name: data.name,
          role: 'HEALER',
          isVerified: true,
          wallet: {
            create: {
              balance: 0,
              escrow: 0,
              pendingIn: 0,
              pendingOut: 0,
              blocked: 0,
            },
          },
        },
      });
    }
    await prisma.consultant.upsert({
      where: { userId: user.id },
      update: {
        category: data.category,
        specialties: data.specialties,
        languages: data.languages,
        bio: data.bio,
        perMinuteRate: data.perMinuteRate,
        faith: data.faith,
        availability: data.availability,
      },
      create: {
        userId: user.id,
        category: data.category,
        specialties: data.specialties,
        languages: data.languages,
        bio: data.bio,
        perMinuteRate: data.perMinuteRate,
        faith: data.faith,
        availability: data.availability,
      },
    });
  }

  // Seed AI consultants
  await seedAIConsultants();

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
