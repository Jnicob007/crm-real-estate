import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Allows offline schema validation/generation; database commands require a real DATABASE_URL.
    url: process.env['DATABASE_URL'] ?? '',
  },
});
