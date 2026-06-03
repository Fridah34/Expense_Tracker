const { query } = require('../config/db');

const CategoryModel = {
  create: async ({ userId, name, color, icon, budget, budgetPeriod, monthlyOverrides }) => {
    const overridesJson = monthlyOverrides && Object.keys(monthlyOverrides).length > 0 
      ? JSON.stringify(monthlyOverrides) 
      : null;
    
    const result = await query(
      `INSERT INTO categories (user_id, name, color, icon, budget, budget_period, monthly_overrides)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, name, color || '#6366f1', icon || 'tag',
       budget || null, budgetPeriod || 'monthly', overridesJson]
    );
    return result.rows[0];
  },

  findAll: async (userId, { startDate, endDate } = {}) => {
    const result = await query(
      `SELECT c.*,
        COUNT(e.id) AS expense_count,
        COALESCE(SUM(e.amount), 0) AS total_spent
       FROM categories c
       LEFT JOIN expenses e 
         ON e.category_id = c.id
         AND e.type = 'expense'
         AND ($2::date IS NULL OR e.date >= $2::date)   
         AND ($3::date IS NULL OR e.date <= $3::date)   
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.name ASC`,
      [userId, startDate || null, endDate || null]
    );
    
    // Safe JSON parse - don't crash if column is missing or null
    return result.rows.map(row => {
      let parsedOverrides = {};
      if (row.monthly_overrides) {
        if (typeof row.monthly_overrides === 'object' && row.monthly_overrides !== null) {
          // Already parsed by pg - use as-is
          parsedOverrides = row.monthly_overrides;
        } else if (typeof row.monthly_overrides === 'string') {
          // Not yet parsed - parse it
          try {
            parsedOverrides = JSON.parse(row.monthly_overrides);
          } catch (e) {
            parsedOverrides = {};
          }
        }
            }
      return { ...row, monthly_overrides: parsedOverrides };
    });
  },

  findById: async (id, userId) => {
    const result = await query(
      `SELECT * FROM categories
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  findByName: async (name, userId) => {
    const result = await query(
      `SELECT * FROM categories
       WHERE LOWER(name) = LOWER($1) AND user_id = $2`,
      [name, userId]
    );
    return result.rows[0] || null;
  },

  update: async (id, userId, { name, color, icon, budget, budgetPeriod, monthlyOverrides, categoryType }) => {
    let overridesJson = null;
    if (monthlyOverrides && Object.keys(monthlyOverrides).length > 0) {
      overridesJson = JSON.stringify(monthlyOverrides);
    }
    
    const result = await query(
      `UPDATE categories
       SET
         name = COALESCE($1, name),
         color = COALESCE($2, color),
         icon = COALESCE($3, icon),
         budget = COALESCE($4, budget),
         budget_period = COALESCE($5, budget_period),
         monthly_overrides = $6,
         type = COALESCE( $7, type),
         updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, color, icon, budget, budgetPeriod, overridesJson,categoryType, id, userId]
    );
    return result.rows[0] || null;
  },

  delete: async (id, userId) => {
    const result = await query(
      `DELETE FROM categories
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
    return result.rows[0] || null;
  },
};

module.exports = CategoryModel;