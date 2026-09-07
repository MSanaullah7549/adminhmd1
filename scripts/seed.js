require('dotenv').config();
const { getPool } = require('../config/db');
const bcryptjs = require('bcryptjs');

async function seed() {
  const pool = getPool();

  if (!pool) {
    throw new Error('Database not connected');
  }

  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      status: 'active',
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'User@123',
      role: 'user',
      status: 'active',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'User@123',
      role: 'moderator',
      status: 'active',
    },
    {
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: 'User@123',
      role: 'user',
      status: 'inactive',
    },
  ];

  for (const user of users) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);

    if (existing.length === 0) {
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role, user.status]
      );
      console.log(`✓ Created user: ${user.email}`);
    } else {
      console.log(`✓ User already exists: ${user.email}`);
    }
  }

  console.log('✓ Database seeding completed!');
}

seed().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
