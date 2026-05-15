

# libraries
- npm install @clerk/nextjs


# prisma
- npm install prisma tsx @types/pg --save-dev
- npm install @prisma/client @prisma/adapter-pg dotenv pg
- npx prisma init --output ../app/generated/prisma
- npx prisma migrate dev --name init
- npx prisma generate
- npx prisma studio
// add "postinstall": "prisma generate", in json/scripts

- npx prisma db push
- npx prisma generate
- npx prisma db seed

# shadcn
- npx shadcn@latest init --preset [CODE] --template next
- npx shadcn@latest add button
- npx shadcn@latest add dropdown-menu

# dark mode
- npm install next-themes