const bcrypt = require('bcrypt');
const pool = require('./models/db'); // Adjust the path to your database connection file

const updatePasswords = async () => {
  try {
    // Fetch all users
    const users = await pool.query('SELECT email, password FROM users');

    for (let user of users.rows) {
      const { email, password } = user;

      // Hash the plain-text password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password in the database
      await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

      console.log(`Password for user ID ${email} has been updated.`);
    }
    console.log('All passwords have been updated.');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    pool.end(); // Close the database connection
  }
};

updatePasswords();
