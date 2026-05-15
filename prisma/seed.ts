import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { riskData } from "./data/risk";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding risks...");

  // Make sure you have at least one user in DB first
  for (const risk of riskData) {
    await prisma.risk.create({ data: risk });
    console.log(`✅ Created risk ${risk.ref}`);
  }

  console.log("🚢 Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });