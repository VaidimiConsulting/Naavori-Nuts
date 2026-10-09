import pool from '../config/db.js';
import dotenv from 'dotenv';
import { hashPassword } from '../utils/auth.js';
import { seedAdminUser } from '../repositories/userRepository.js';

dotenv.config();

async function runSeed() {
  try {
    console.log('Starting seeder...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@naavorinuts.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Seed Admin User
    const hashedPw = await hashPassword(adminPassword);
    await seedAdminUser(adminEmail, hashedPw);
    
    console.log('Admin user seeding completed.');

    // Note: Product & Category seeding will be added next.

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

runSeed();
