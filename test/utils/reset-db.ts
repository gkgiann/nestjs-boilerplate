import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export async function resetDatabase() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  });

  const prisma = new PrismaClient({ adapter });

  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$disconnect();
}
