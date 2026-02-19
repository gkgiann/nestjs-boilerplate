import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

// Criar adaptador e instância do Prisma Client para o seed
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

/**
 * Script de seed do Prisma
 * Cria um usuário ADMIN padrão e 15 usuários regulares se não existirem
 */
async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const bcryptRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  const defaultPassword = 'User@123';

  // Hash da senha padrão para os usuários
  console.log('🔐 Fazendo hash da senha padrão...');
  const hashedPassword = await bcrypt.hash(defaultPassword, bcryptRounds);

  // ==================== CRIAR ADMIN ====================
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  console.log(`\n📧 Email do admin: ${adminEmail}`);

  // Verificar se o usuário admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Usuário ADMIN já existe.');
    console.log(`   ID: ${existingAdmin.id}`);
    console.log(`   Nome: ${existingAdmin.name}`);
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Role: ${existingAdmin.role}`);
  } else {
    // Hash da senha do admin
    const hashedAdminPassword = await bcrypt.hash(adminPassword, bcryptRounds);

    // Criar usuário admin
    console.log('👤 Criando usuário ADMIN...');
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedAdminPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log('✅ Usuário ADMIN criado com sucesso!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Ativo: ${admin.isActive}`);
  }

  // ==================== CRIAR 15 USUÁRIOS ====================
  console.log('\n👥 Criando usuários regulares...');

  const userNames = [
    'João Silva',
    'Maria Santos',
    'Pedro Oliveira',
    'Ana Costa',
    'Carlos Souza',
    'Juliana Lima',
    'Rafael Ferreira',
    'Fernanda Alves',
    'Lucas Pereira',
    'Camila Rodrigues',
    'Gabriel Martins',
    'Beatriz Carvalho',
    'Thiago Ribeiro',
    'Larissa Gomes',
    'Bruno Araújo',
  ];

  let createdCount = 0;
  let existingCount = 0;

  for (let i = 0; i < 15; i++) {
    const email = `user${i + 1}@example.com`;
    const name = userNames[i];

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      existingCount++;
      continue;
    }

    // Criar usuário
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.USER,
        isActive: true,
      },
    });

    createdCount++;
  }

  console.log(`✅ ${createdCount} usuário(s) criado(s)`);
  console.log(`ℹ️  ${existingCount} usuário(s) já existia(m)`);
  console.log('\n🎉 Seed concluído!');
  console.log(`📝 Senha padrão dos usuários: ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error('❌ Erro durante o seed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
