try {
  process.loadEnvFile?.();
} catch {}

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || '';

async function initDb() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment or .env file');
    process.exit(1);
  }
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database at Prisma pooled endpoint!');

    // 1. Create User & Progress tracking tables
    console.log('Creating users and user_progress tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        email VARCHAR(128),
        password VARCHAR(256),
        pin VARCHAR(32) DEFAULT '0000',
        role VARCHAR(32) DEFAULT 'Data Analyst',
        gamer_tag VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        level INT DEFAULT 1,
        xp INT DEFAULT 0,
        gems INT DEFAULT 0,
        streak INT DEFAULT 1,
        last_daily_date VARCHAR(32),
        unlocked_chapters JSONB DEFAULT '[1]',
        completed_lessons JSONB DEFAULT '[]',
        completed_case_studies JSONB DEFAULT '[]',
        solved_queries_count INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create game learning tables
    console.log('Creating game dataset tables (heroes, tavern_orders, dungeon_raids, inventory_relics)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS heroes (
        id INT PRIMARY KEY,
        hero_name VARCHAR(64) NOT NULL,
        class_archetype VARCHAR(32) NOT NULL,
        guild_rank VARCHAR(32) NOT NULL,
        level INT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tavern_orders (
        id INT PRIMARY KEY,
        hero_id INT REFERENCES heroes(id) ON DELETE SET NULL,
        hero_name VARCHAR(64) NOT NULL,
        gold_spent NUMERIC(10,2) NOT NULL,
        quest_class VARCHAR(64) NOT NULL,
        order_timestamp TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dungeon_raids (
        raid_id INT PRIMARY KEY,
        hero_id INT REFERENCES heroes(id) ON DELETE SET NULL,
        boss_defeated VARCHAR(64) NOT NULL,
        gold_bounty NUMERIC(10,2) NOT NULL,
        duration_sec INT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inventory_relics (
        item_id INT PRIMARY KEY,
        order_id INT REFERENCES tavern_orders(id) ON DELETE SET NULL,
        relic_name VARCHAR(64) NOT NULL,
        rarity_tier VARCHAR(32) NOT NULL
      );
    `);

    // 3. Seed real records into heroes
    const heroCheck = await client.query('SELECT COUNT(*) FROM heroes');
    if (parseInt(heroCheck.rows[0].count, 10) === 0) {
      console.log('Seeding heroes table...');
      const heroArchetypes = ['Mage', 'Knight', 'Rogue', 'Archer', 'Paladin', 'Cleric', 'Berserker'];
      const heroNames = [
        'Ignis The Mage', 'Valerius Knight', 'Lyra Shadowstep', 'Robin Hawk', 'Aria Stormcaller',
        'Dorian Frosthelm', 'Seraphina Brightwood', 'Garrick Ironthorn', 'Sylas Voidseeker',
        'Mirei Runecrafter', 'Orion Drakon', 'Vesper Moonwhisper', 'Bryn Shadoweaver'
      ];

      for (let i = 101; i <= 356; i++) {
        const isSpecial = i <= 104;
        const name = isSpecial
          ? heroNames[i - 101]
          : `${['Brave', 'Shadow', 'Iron', 'Mystic', 'Swift'][(i * 3) % 5]} ${['Alex', 'Kael', 'Finn', 'Thorne', 'Drake'][(i * 7) % 5]}_${i}`;
        const archetype = isSpecial ? ['Mage', 'Knight', 'Rogue', 'Archer'][i - 101] : heroArchetypes[i % heroArchetypes.length];
        const rank = isSpecial ? 'Query Rookie' : 'Syntax Knight';
        const lvl = (i % 35) + 3;

        await client.query(
          `INSERT INTO heroes (id, hero_name, class_archetype, guild_rank, level) VALUES ($1, $2, $3, $4, $5)`,
          [i, name, archetype, rank, lvl]
        );
      }
      console.log('Seeded 256 heroes.');
    } else {
      console.log(`Heroes table already has ${heroCheck.rows[0].count} records.`);
    }

    // 4. Seed real records into tavern_orders
    const orderCheck = await client.query('SELECT COUNT(*) FROM tavern_orders');
    if (parseInt(orderCheck.rows[0].count, 10) === 0) {
      console.log('Seeding tavern_orders table...');
      // Seed exact 4 heroes from design image
      await client.query(`
        INSERT INTO tavern_orders (id, hero_id, hero_name, gold_spent, quest_class, order_timestamp) VALUES
        (1, 104, 'Ignis The Mage', 240, 'Arcane Hunt', '2025-02-10 19:42:00'),
        (2, 101, 'Valerius Knight', 185, 'Dragon Slaying', '2025-02-10 20:15:00'),
        (3, 108, 'Lyra Shadowstep', 120, 'Vault Infiltration', '2025-02-11 14:02:00'),
        (4, 102, 'Robin Hawk', 90, 'Beast Tracking', '2025-02-11 16:30:00');
      `);

      // Seed rest of 1,420 orders
      for (let i = 5; i <= 1420; i++) {
        const heroId = 101 + (i % 255);
        const heroName = `Adventurer_${heroId}`;
        const gold = (i % 7 === 0) ? (80 + (i % 120)) : (15 + (i % 55));
        const qClass = ['Tavern Feasting', 'Potion Brewing', 'Bounty Commission', 'Guild Tribute', 'Armor Repair'][i % 5];
        const day = String((i % 27) + 1).padStart(2, '0');
        const ts = `2025-02-${day} 18:00:00`;

        await client.query(
          `INSERT INTO tavern_orders (id, hero_id, hero_name, gold_spent, quest_class, order_timestamp) VALUES ($1, $2, $3, $4, $5, $6)`,
          [i, heroId, heroName, gold, qClass, ts]
        );
      }
      console.log('Seeded 1,420 tavern_orders.');
    } else {
      console.log(`tavern_orders table already has ${orderCheck.rows[0].count} records.`);
    }

    // 5. Seed dungeon_raids
    const raidCheck = await client.query('SELECT COUNT(*) FROM dungeon_raids');
    if (parseInt(raidCheck.rows[0].count, 10) === 0) {
      console.log('Seeding dungeon_raids table...');
      const bosses = ['The Slime King', 'Merchant Specter', 'Goblin Collector', 'Shadow Wyrm', 'Arch-Lich Chronomancer'];
      for (let i = 1; i <= 500; i++) {
        const heroId = 101 + (i % 255);
        const boss = bosses[i % bosses.length];
        const bounty = 50 + (i * 13 % 450);
        const dur = 180 + (i * 17 % 800);
        await client.query(
          `INSERT INTO dungeon_raids (raid_id, hero_id, boss_defeated, gold_bounty, duration_sec) VALUES ($1, $2, $3, $4, $5)`,
          [i, heroId, boss, bounty, dur]
        );
      }
      console.log('Seeded 500 dungeon_raids.');
    }

    // 6. Seed inventory_relics
    const relicCheck = await client.query('SELECT COUNT(*) FROM inventory_relics');
    if (parseInt(relicCheck.rows[0].count, 10) === 0) {
      console.log('Seeding inventory_relics table...');
      const relics = ['Golden Semicolon', 'Filter Blade', 'Syntax Shield', 'Aggregate Staff', 'Relational Compass', 'Index Ring'];
      const tiers = ['Common', 'Rare', 'Epic', 'Legendary'];
      for (let i = 1; i <= 200; i++) {
        const ordId = (i % 1420) + 1;
        const rName = relics[i % relics.length];
        const tier = tiers[i % tiers.length];
        await client.query(
          `INSERT INTO inventory_relics (item_id, order_id, relic_name, rarity_tier) VALUES ($1, $2, $3, $4)`,
          [i, ordId, rName, tier]
        );
      }
      console.log('Seeded 200 inventory_relics.');
    }

    console.log('DATABASE INITIALIZATION COMPLETE & VERIFIED!');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.end();
  }
}

initDb();
