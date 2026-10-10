import { DailyBounty } from '../types/game';

export function getDailyBountyForToday(): DailyBounty {
  const today = new Date().toISOString().split('T')[0];
  // Hash the date string to pick a deterministic challenge
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) % 5;
  }

  const pool: DailyBounty[] = [
    {
      date: today,
      title: 'Daily Bounty: The Vault Overflow Audit',
      scenario: 'Citadel bankers notice anomalous high-volume transactions in orders. Identify all orders with a total_amount greater than 500 gold coins that were paid using "Mana Crystals".',
      objective: 'Filter `orders` where `total_amount > 500` AND `payment_method = \'Mana Crystals\'`.',
      starterSql: `SELECT order_id, customer_id, total_amount, payment_method
FROM orders
WHERE total_amount > 500 AND payment_method = 'Mana Crystals'
LIMIT 10;`,
      xpReward: 250,
      validate: (rows) => {
        if (!rows || rows.length === 0) return { passed: false, message: 'No records found matching criteria.' };
        const valid = rows.every(r => Number(r.total_amount) > 500 && r.payment_method === 'Mana Crystals');
        return valid
          ? { passed: true, message: 'Daily Vault bounty claimed! Streak protected!' }
          : { passed: false, message: 'Make sure total_amount > 500 and payment_method = \'Mana Crystals\'.' };
      },
    },
    {
      date: today,
      title: 'Daily Bounty: The Inactive Citizen Census',
      scenario: 'Guild magistrates want to see all customers whose lifetime_value is strictly less than 100 gold coins to prepare a revival promotional scroll.',
      objective: 'Select `customer_id`, `name`, `tier`, `lifetime_value` from `customers` WHERE `lifetime_value < 100`.',
      starterSql: `SELECT customer_id, name, tier, lifetime_value
FROM customers
WHERE lifetime_value < 100;`,
      xpReward: 250,
      validate: (rows) => {
        if (!rows || rows.length === 0) return { passed: false, message: 'No rows returned.' };
        const valid = rows.every(r => Number(r.lifetime_value) < 100);
        return valid
          ? { passed: true, message: 'Inactive citizen census logged! Daily quest complete!' }
          : { passed: false, message: 'Check your condition: lifetime_value < 100.' };
      },
    },
    {
      date: today,
      title: 'Daily Bounty: Armory Stock Shortage',
      scenario: 'The blacksmith reports critical shortages of weapons and relics. Find all products in `products` where `stock_level < 15`.',
      objective: 'Retrieve `product_name`, `category`, and `stock_level` from `products` WHERE `stock_level < 15` ORDER BY `stock_level ASC`.',
      starterSql: `SELECT product_name, category, stock_level
FROM products
WHERE stock_level < 15
ORDER BY stock_level ASC;`,
      xpReward: 250,
      validate: (rows) => {
        if (!rows || rows.length === 0) return { passed: false, message: 'No rows returned.' };
        const valid = rows.every(r => Number(r.stock_level) < 15);
        return valid
          ? { passed: true, message: 'Armory shortages prioritized! Daily bounty cleared!' }
          : { passed: false, message: 'Ensure stock_level < 15 and sorted ascending.' };
      },
    },
    {
      date: today,
      title: 'Daily Bounty: Regional Guild Revenue',
      scenario: 'The Emperor requests a summary of customers by realm. Count how many adventurers are registered in each `country`.',
      objective: 'SELECT `country`, COUNT(*) AS `adventurer_count` FROM `customers` GROUP BY `country` ORDER BY `adventurer_count DESC`.',
      starterSql: `SELECT country, COUNT(*) AS adventurer_count
FROM customers
GROUP BY country
ORDER BY adventurer_count DESC;`,
      xpReward: 250,
      validate: (rows) => {
        if (!rows || rows.length === 0) return { passed: false, message: 'No grouped rows returned.' };
        const hasCols = rows.every(r => r.country && r.adventurer_count !== undefined);
        return hasCols
          ? { passed: true, message: 'Demographic balance certified! Daily bounty conquered!' }
          : { passed: false, message: 'Group by country and count adventurers.' };
      },
    },
    {
      date: today,
      title: 'Daily Bounty: The Top Spenders Roster',
      scenario: 'Identify the top 5 highest spending customers across all kingdoms to invite them to the Grand Banquet.',
      objective: 'SELECT `name`, `country`, `lifetime_value` FROM `customers` ORDER BY `lifetime_value DESC` LIMIT 5.',
      starterSql: `SELECT name, country, lifetime_value
FROM customers
ORDER BY lifetime_value DESC
LIMIT 5;`,
      xpReward: 250,
      validate: (rows) => {
        if (!rows || rows.length !== 5) return { passed: false, message: 'Must return exactly 5 rows.' };
        const sorted = rows.every((r, i) => i === 0 || Number(rows[i - 1].lifetime_value) >= Number(r.lifetime_value));
        return sorted
          ? { passed: true, message: 'Grand Banquet invitations inscribed! Daily bounty finished!' }
          : { passed: false, message: 'Ensure ORDER BY lifetime_value DESC LIMIT 5.' };
      },
    },
  ];

  return pool[hash];
}
