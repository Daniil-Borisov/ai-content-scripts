import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Packs
  const packs = [
    { id: "try_it", name: "Try it", price: 4.99, credits: 1 },
    { id: "starter", name: "Starter", price: 14.99, credits: 5 },
    { id: "creator", name: "Creator", price: 24.99, credits: 10 },
    { id: "pro", name: "Pro", price: 49.99, credits: 25 },
  ];

  for (const pack of packs) {
    await db.pack.upsert({
      where: { id: pack.id },
      create: pack,
      update: { price: pack.price, credits: pack.credits },
    });
  }
  console.log(`  ✓ ${packs.length} packs`);

  // Demo user
  const passwordHash = await bcrypt.hash("demo1234", 12);
  const demoUser = await db.user.upsert({
    where: { email: "demo@scriptforge.ai" },
    create: {
      email: "demo@scriptforge.ai",
      name: "Demo Creator",
      passwordHash,
    },
    update: { name: "Demo Creator", passwordHash },
  });
  console.log(`  ✓ Demo user: ${demoUser.email}`);

  // Demo credits
  await db.credit.upsert({
    where: { userId: demoUser.id },
    create: { userId: demoUser.id, balance: 15, totalUsed: 0 },
    update: { balance: 15 },
  });
  console.log(`  ✓ 15 credits for demo user`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
