const { query } = require('../config/db');

const ExpenseModel = {
  create: async ({ userId, categoryId, title, amount, type, date, notes }) => {
    const result = await query(
      `INSERT INTO expenses (user_id, category_id, title, amount, type, date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, categoryId || null, title, amount, type, date, notes || null]
    );
    return result.rows[0];
  },

  findAll: async (userId, filters = {}) => {
    const conditions = ['e.user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.type) {
      conditions.push(`e.type = $${index}`);
      values.push(filters.type);
      index++;
    }

    if (filters.categoryId) {
      conditions.push(`e.category_id = $${index}`);
      values.push(filters.categoryId);
      index++;
    }

    if (filters.startDate) {
      conditions.push(`e.date >= $${index}`);
      values.push(filters.startDate);
      index++;
    }

    if (filters.endDate) {
      conditions.push(`e.date <= $${index}`);
      values.push(filters.endDate);
      index++;
    }

    if (filters.search) {
      conditions.push(`e.title ILIKE $${index}`);
      values.push(`%${filters.search}%`);
      index++;
    }

    // Pagination
    const limit = parseInt(filters.limit) || 10;
    const page = parseInt(filters.page) || 1;
    const offset = (page - 1) * limit;

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT
         e.*,
         c.name AS category_name,
         c.color AS category_color,
         c.icon AS category_icon
       FROM expenses e
       LEFT JOIN categories c ON c.id = e.category_id
       WHERE ${whereClause}
       ORDER BY e.date DESC, e.created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) FROM expenses e WHERE ${whereClause}`,
      values
    );

    return {
      expenses: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  },

  findById: async (id, userId) => {
    const result = await query(
      `SELECT
         e.*,
         c.name AS category_name,
         c.color AS category_color,
         c.icon AS category_icon
       FROM expenses e
       LEFT JOIN categories c ON c.id = e.category_id
       WHERE e.id = $1 AND e.user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  update: async (id, userId, { categoryId, title, amount, type, date, notes }) => {
    const result = await query(
      `UPDATE expenses SET
         category_id = COALESCE($1, category_id),
         title       = COALESCE($2, title),
         amount      = COALESCE($3, amount),
         type        = COALESCE($4, type),
         date        = COALESCE($5, date),
         notes       = COALESCE($6, notes)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [categoryId, title, amount, type, date, notes, id, userId]
    );
    return result.rows[0] || null;
  },

  delete: async (id, userId) => {
    const result = await query(
      `DELETE FROM expenses
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  getSummary: async (userId, startDate, endDate) => {
    const result = await query(
      `SELECT
         type,
         COUNT(*) AS count,
         SUM(amount) AS total
       FROM expenses
       WHERE user_id = $1
         AND date BETWEEN $2 AND $3
       GROUP BY type`,
      [userId, startDate, endDate]
    );

    const summary = { income: 0, expense: 0, balance: 0, count: 0 };

    result.rows.forEach((row) => {
      if (row.type === 'income') summary.income = parseFloat(row.total);
      if (row.type === 'expense') summary.expense = parseFloat(row.total);
      summary.count += parseInt(row.count);
    });

    summary.balance = summary.income - summary.expense;
    return summary;
  },
};

module.exports = ExpenseModel;