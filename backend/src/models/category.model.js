const  {query } = require('../config/db');

const CategoryModel = {
  create: async ({ userId, name, color, icon }) => {
    const result = await query(
      `INSERT INTO categories (user_id, name, color, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, color || '#6366f1', icon || 'tag']
    );
    return result.rows[0];
  },

  findAll: async (userId) => {
    const result = await query(
      `SELECT c.*,
        COUNT(e.id) AS expense_count,
        COALESCE(SUM(e.amount), 0) AS total_spent
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.name ASC`,
      [userId]
    );
    return result.rows;
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

  update: async (id, userId, { name, color, icon }) => {
    const result = await query(
      `UPDATE categories
       SET
         name  = COALESCE($1, name),
         color = COALESCE($2, color),
         icon  = COALESCE($3, icon)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, color, icon, id, userId]
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