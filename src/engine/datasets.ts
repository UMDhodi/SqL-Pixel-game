import { TableSchema } from '../types/game';

class SeededRandom {
  private seed: number;
  constructor(seed = 1337) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min));
  }
  choice<T>(array: T[]): T {
    return array[this.range(0, array.length)];
  }
}

export function generateAllDatasets(): {
  tables: Record<string, Record<string, any>[]>;
  schemas: TableSchema[];
} {
  const rng = new SeededRandom(77889);

  // 1. Heroes Table (256 rows) - Matches Image 2 & 3
  const heroArchetypes = ['Mage', 'Knight', 'Rogue', 'Archer', 'Paladin', 'Cleric', 'Berserker'];
  const guildRanks = ['Query Rookie', 'Syntax Knight', 'Data Adept', 'Index Master', 'Archmage'];
  const heroNames = [
    'Ignis The Mage', 'Valerius Knight', 'Lyra Shadowstep', 'Robin Hawk', 'Aria Stormcaller',
    'Dorian Frosthelm', 'Seraphina Brightwood', 'Garrick Ironthorn', 'Sylas Voidseeker',
    'Mirei Runecrafter', 'Orion Drakon', 'Vesper Moonwhisper', 'Bryn Shadoweaver'
  ];

  const heroes: Record<string, any>[] = [];
  for (let i = 101; i <= 356; i++) {
    const isSpecial = i <= 104;
    const name = isSpecial
      ? heroNames[i - 101]
      : `${rng.choice(['Brave', 'Shadow', 'Iron', 'Mystic', 'Swift'])} ${rng.choice(['Alex', 'Kael', 'Finn', 'Thorne', 'Drake'])}_${i}`;

    heroes.push({
      id: i,
      hero_name: name,
      class_archetype: isSpecial ? ['Mage', 'Knight', 'Rogue', 'Archer'][i - 101] : rng.choice(heroArchetypes),
      guild_rank: isSpecial ? 'Query Rookie' : rng.choice(guildRanks),
      level: rng.range(2, 45),
    });
  }

  // 2. Tavern Orders Table (1,420 rows) - Matches Image 2 & 3
  // Must include the exact 4 heroes from Image 3:
  // 104: Ignis The Mage (240g)
  // 101: Valerius Knight (185g)
  // 108: Lyra Shadowstep (120g)
  // 102: Robin Hawk (90g)
  const tavern_orders: Record<string, any>[] = [
    { id: 1, hero_id: 104, hero_name: 'Ignis The Mage', gold_spent: 240, quest_class: 'Arcane Hunt', order_timestamp: '2025-02-10 19:42:00' },
    { id: 2, hero_id: 101, hero_name: 'Valerius Knight', gold_spent: 185, quest_class: 'Dragon Slaying', order_timestamp: '2025-02-10 20:15:00' },
    { id: 3, hero_id: 108, hero_name: 'Lyra Shadowstep', gold_spent: 120, quest_class: 'Vault Infiltration', order_timestamp: '2025-02-11 14:02:00' },
    { id: 4, hero_id: 102, hero_name: 'Robin Hawk', gold_spent: 90, quest_class: 'Beast Tracking', order_timestamp: '2025-02-11 16:30:00' },
  ];

  const questClasses = ['Tavern Feasting', 'Potion Brewing', 'Bounty Commission', 'Guild Tribute', 'Armor Repair'];
  for (let i = 5; i <= 1420; i++) {
    const hero = rng.choice(heroes);
    // Lower spending for regular orders so filtering for > 75 catches top spenders
    const gold = rng.next() > 0.85 ? rng.range(76, 220) : rng.range(10, 75);
    const day = String(rng.range(1, 28)).padStart(2, '0');
    const hour = String(rng.range(10, 23)).padStart(2, '0');
    const min = String(rng.range(10, 59)).padStart(2, '0');

    tavern_orders.push({
      id: i,
      hero_id: hero.id,
      hero_name: hero.hero_name,
      gold_spent: gold,
      quest_class: rng.choice(questClasses),
      order_timestamp: `2025-02-${day} ${hour}:${min}:00`,
    });
  }

  // 3. Dungeon Raids Table (8,910 rows) - Matches Image 2
  const bossesList = ['The Slime King', 'Merchant Specter', 'Goblin Collector', 'Shadow Wyrm', 'Arch-Lich Chronomancer'];
  const dungeon_raids: Record<string, any>[] = [];
  for (let i = 1; i <= 1200; i++) {
    const hero = rng.choice(heroes);
    dungeon_raids.push({
      raid_id: i,
      hero_id: hero.id,
      boss_defeated: rng.choice(bossesList),
      gold_bounty: parseFloat((rng.next() * 800 + 50).toFixed(2)),
      duration_sec: rng.range(120, 2400),
    });
  }

  // 4. Inventory Relics Table (640 rows) - Matches Image 2
  const relicNames = ['Golden Semicolon', 'Filter Blade', 'Syntax Shield', 'Aggregate Staff', 'Relational Compass', 'Index Ring'];
  const rarityTiers = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
  const inventory_relics: Record<string, any>[] = [];
  for (let i = 1; i <= 640; i++) {
    inventory_relics.push({
      item_id: i,
      order_id: rng.range(1, 1421),
      relic_name: rng.choice(relicNames),
      rarity_tier: rng.choice(rarityTiers),
    });
  }

  // Schemas metadata definitions
  const schemas: TableSchema[] = [
    {
      tableName: 'tavern_orders',
      category: 'Fact Orders Log',
      rowCount: tavern_orders.length,
      columnsCount: 5,
      description: 'The official ledger of the Prancing Pony & Whispering Catacombs tavern. Contains itemized receipts of gold spent by roaming heroes and mercenaries.',
      columns: [
        { name: 'id', type: 'INT', isPrimaryKey: true, description: 'Unique transaction order receipt ID.' },
        { name: 'hero_id', type: 'INT', isForeignKey: true, references: 'heroes.id', description: 'Foreign key referencing heroes registry.' },
        { name: 'hero_name', type: 'VARCHAR', description: 'Registered hero alias.' },
        { name: 'gold_spent', type: 'NUMERIC', description: 'Amount of gold coins spent in transaction.' },
        { name: 'quest_class', type: 'TEXT', description: 'Classification of tavern expedition order.' },
        { name: 'order_timestamp', type: 'DATETIME', description: 'ISO recorded date and time of order.' },
      ],
      sampleData: tavern_orders.slice(0, 5),
    },
    {
      tableName: 'heroes',
      category: 'Dimension',
      rowCount: heroes.length,
      columnsCount: 5,
      description: 'Master Adventurer Guild registry detailing hero names, classes, ranks, and levels.',
      columns: [
        { name: 'id', type: 'INT', isPrimaryKey: true, description: 'Primary key identification for the hero.' },
        { name: 'hero_name', type: 'VARCHAR', description: 'Legendary knight or mage handle.' },
        { name: 'class_archetype', type: 'TEXT', description: 'RPG class (Mage, Knight, Rogue, Archer).' },
        { name: 'guild_rank', type: 'VARCHAR', description: 'Rank badge within the SQL Guild.' },
        { name: 'level', type: 'INT', description: 'Adventurer combat mastery level.' },
      ],
      sampleData: heroes.slice(0, 5),
    },
    {
      tableName: 'dungeon_raids',
      category: 'Logs',
      rowCount: dungeon_raids.length,
      columnsCount: 5,
      description: 'Historical combat encounter logs of bosses slayed and guild bounties earned.',
      columns: [
        { name: 'raid_id', type: 'INT', isPrimaryKey: true, description: 'Raid incident index number.' },
        { name: 'hero_id', type: 'INT', isForeignKey: true, references: 'heroes.id', description: 'Hero who spearheaded the raid.' },
        { name: 'boss_defeated', type: 'VARCHAR', description: 'Name of the vanquished dungeon monster.' },
        { name: 'gold_bounty', type: 'NUMERIC', description: 'Loot reward collected from dungeon boss.' },
        { name: 'duration_sec', type: 'INT', description: 'Duration of battle in seconds.' },
      ],
      sampleData: dungeon_raids.slice(0, 5),
    },
    {
      tableName: 'inventory_relics',
      category: 'Equipment',
      rowCount: inventory_relics.length,
      columnsCount: 4,
      description: 'Enchanted loot catalog, armor relics, and magical artifacts acquired in quests.',
      columns: [
        { name: 'item_id', type: 'INT', isPrimaryKey: true, description: 'Unique relic serial number.' },
        { name: 'order_id', type: 'INT', isForeignKey: true, references: 'tavern_orders.id', description: 'Acquisition order receipt.' },
        { name: 'relic_name', type: 'VARCHAR', description: 'Artifact lore name (Filter Blade, Syntax Shield).' },
        { name: 'rarity_tier', type: 'TEXT', description: 'Classification tier (Common, Epic, Legendary).' },
      ],
      sampleData: inventory_relics.slice(0, 5),
    },
  ];

  return {
    tables: {
      tavern_orders,
      heroes,
      dungeon_raids,
      inventory_relics,
    },
    schemas,
  };
}
