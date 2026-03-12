import { seedDatabase } from "./seed";

let initialized = false;

export async function initDB() {
  if (initialized) return;
  
  try {
    console.log('--- Initializing Database ---');
    await seedDatabase();
    initialized = true;
    console.log('--- Database Initialized ---');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
