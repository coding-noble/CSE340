const pool = require("../database/");

/***********************
 * Get all classifications
 ***********************/
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/********************************
 * Get inventory items by classification_id
 **********************************/
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("Error fetching inventory by classification ID: " + error);
  }
}

/*******************
 * Get inventory details by inv_id
 *******************/
async function getInventoryDetailByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("Error fetching inventory details: " + error);
  }
}

/******************
 * Add a new classification
 **********************/
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification(classification_name) VALUES($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("Error adding new classification: " + error);
    return error.message;
  }
}

/****************
 * Add new inventory
 ****************/
async function addNewInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = "INSERT INTO public.inventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *";
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,]);
  } catch (error) {
    console.error("Error adding new inventory: " + error);
    return error.message;
  }
}

/**************************************
 * Check for existing classification
 *************************************/
async function verifyNewClassification(classification_name) {
  try {
    const sql =
      "SELECT * FROM public.classification WHERE classification_name = $1";
    const existingName = await pool.query(sql, [classification_name]);
    return existingName.rowCount;
  } catch (error) {
    console.error("Error verifying new classification: " + error);
    return error.message;
  }
}

/****************
 * Get Problems list (Intentional Error)
 ****************/
async function getProblems() {
  try {
    const data = await pool.query(`SELECT * FROM public.problems`);
    return data.rows;
  } catch (error) {
    console.error('Error in getProblems:', error);
    throw error; // Rethrow the error to propagate it upwards
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item By ID
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    console.log(data);
    return data;
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryDetailByInvId,
  getProblems,
  addClassification,
  addNewInventory,
  verifyNewClassification,
  updateInventory,
  deleteInventoryItem,
};
