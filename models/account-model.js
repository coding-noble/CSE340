const pool = require("../database/");

/***********************
 * Register new account
 ***********************/
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account(account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    return error.message;
  }
}

/***********************
 * Check for existing email
 ***********************/
async function checkExistingEmail(account_email, account_id = null) {
  try {
    let sql;
    let params;

    if (account_id) {
      const oldEmail = await pool.query("SELECT account_email FROM account WHERE account_id = $1", [account_id]);
      sql = `SELECT * FROM account WHERE account_email = $1 AND account_email != $2`;
      params = [account_email, oldEmail.rows[0].account_email];
    } else {
      sql = `SELECT * FROM account WHERE account_email = $1`;
      params = [account_email];
    }

    const email = await pool.query(sql, params);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/***********************
 * Get account details by id
 ************************/
async function getAccountDetailsById(account_id) {
  try {
    const sql = "SELECT * FROM account WHERE account_id = $1 LIMIT 1";
    const details = await pool.query(sql, [account_id]);
    return details.rows[0];
  } catch (error) {
    throw new Error("Error retrieving account details: " + error.message);
  }
}

/**************************
 * Update account details
 **************************/
async function updateAccountInformation(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error updating account: " + error.message);
  }
}

/**************************
 * Update account password
 **************************/
async function updateAccountPassword(account_id, account_password) {
  try {
    const sql = "UPDATE account SET account_password = $2 WHERE account_id = $1 RETURNING *";
    const data = await pool.query(sql, [account_id, account_password]);
    return data.rows[0];
  } catch (error) {
    throw new Error("Error updating password: " + error.message);
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountDetailsById, updateAccountInformation, updateAccountPassword };
