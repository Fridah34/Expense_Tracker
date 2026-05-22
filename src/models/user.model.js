const  { query } = require ('../config/db');

const UserModel = {
    create: async ({ email, firstName, lastName, password }) => {
        const result = await query(
            `INSERT INTO users(email, first_name, last_name, password)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, first_name, last_name, is_active, created_at`,
            [email, firstName, lastName, password]
        );
        return result.rows[0];
    },

    findByEmail: async (email) => {
        const result =await query(
            `SELECT id, email, first_name, last_name,password, is_active
            FROM users
            WHERE email =$1`,
            [email]
        );
        return result.rows[0] || null;
    },

    findById: async (id) => {
        const result =await query(
            `SELECT id, email, first_name, last_name,password, is_active
            FROM users
            WHERE id =$1`,
            [id]
        );
        return result.rows[0] || null;
    },

    update: async (id, { firstName, lastName }) => {
    const result = await query(
      `UPDATE users SET
         first_name = COALESCE($1, first_name),
         last_name  = COALESCE($2, last_name)
       WHERE id = $3
       RETURNING id, email, first_name, last_name, is_active, updated_at`,
      [firstName, lastName, id]
      );
      return result.rows[0] || null;
    },

    updatePassword: async (id, hashedpassword) => {
        const result =await query(
            `UPDATE users SET password = $1 WHERE id = $2
            RETURNING id,email, first_name,last_name`,
            [hashedpassword, id]
        );
        return result.rows[0];
    },

     delete: async (id) => {
    const result = await query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = UserModel