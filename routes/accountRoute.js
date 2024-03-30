// Required modules
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process the login attempt
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin));

// Route for default accounts
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to register new account to database
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

// Route to build update view
router.get("/update/:account_id", utilities.handleErrors(accountController.buildUpdate));

// Route to update an existing account information in the database
router.post("/update-account", regValidate.accountUpdateRules(), regValidate.checkAccountUpdateData, utilities.handleErrors(accountController.updateAccountInfo));

// Route to update an existing account password in the database
router.post("/change-password", regValidate.passwordRules(), regValidate.checkAccountUpdateData, utilities.handleErrors(accountController.updateAccountPassword));

// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.logout));

module.exports = router;
