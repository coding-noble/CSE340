/**
 * Database Connection Module
 * Manages database connection for the application.
 * Provides a query method to interact with the database.
 */

const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */

// Connection Pool
let pool

// Determine SSL configuration based on environment
if (process.env.NODE_ENV == "development") {
    // For local development with self-signed SSL certificate
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    })

    // Added for troubleshooting queries
    // during development
    // Exporting query method for troubleshooting queries
    module.exports = {
        /**
        * Execute a SQL query with optional parameters.
        * @param {string} text - The SQL query string.
        * @param {Array} params - Optional parameters for the query.
        * @returns {Promise<Object>} - A Promise that resolves with the query result.
        */
        async query(text, params) {
            try {
                const res = await pool.query(text, params)
                console.log("executed query", { text })
                return res
            } catch (error) {
                console.error("error in query", { text })
                throw error
            }
        },
    }
} else {
    // For production environment without self-signed SSL certificate
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    })
    module.exports = pool
}