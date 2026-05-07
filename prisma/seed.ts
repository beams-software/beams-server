import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
require('dotenv').config()

async function main() {
await prisma.tokens.upsert({
    where:{
        token: process.env.INIT_TOKEN as string
    },
    update: {},
    create: {
        token: process.env.INIT_TOKEN as string
    }
})
}

main()
  .then(() => {
    console.log('Seeding complete.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
