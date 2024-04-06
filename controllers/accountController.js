const { route } = require("../routes/static");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const messageModel = require("../models/message-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Build View
*  Renders the specified template with common data like navigation and title.
*  Handles errors gracefully.
* *************************************** */
async function buildView(req, res, next, template, title) {
  try {
    const nav = await utilities.getNav();
    res.render(`account/${template}`, { title, nav, errors: null });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) { await buildView(req, res, next, "login", "Login"); }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) { await buildView(req, res, next, "register", "Register"); }

/* ****************************************
*  Deliver Account Management view
* *************************************** */
async function buildAccountManagement(req, res, next) { 
  const nav = await utilities.getNav();
  const unreadCount = await messageModel.getUnreadCount(res.locals.accountData.account_id);
  res.render("account/management", {
    title: "Account Management",
    unreadCount,
    nav,
    errors: null,
  });
}

/* ****************************************
*  Deliver Update Account view
* *************************************** */
async function buildUpdate(req, res) {
  const nav = await utilities.getNav();
  const accountData = await accountModel.getAccountDetailsById(parseInt(req.params.account_id));
  res.render("account/update", {
    title: "Update " + accountData.account_firstname,
    nav,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    errors: null,
  });
}

/* ****************************************
*  Process registration request
* *************************************** */
async function registerAccount(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hashSync(account_password, 10);
    const nav = await utilities.getNav();
    const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword);

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      res.status(201).render("account/login", { title: "Login", nav });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", { title: "Registration", nav });
    }
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", { title: "Registration", nav: await utilities.getNav(), errors: null });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
}

/* ****************************************
*  Process update account information request
* *************************************** */
async function updateAccountInfo(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;

  const updateResult = await accountModel.updateAccountInformation(account_firstname, account_lastname, account_email, account_id);

  if (updateResult) {
    req.flash("notice", `Congratulations, your account has been updated!`);
  } else {
    req.flash("notice", "Sorry, the account update failed.");
  }
  return res.redirect("/account/")
}

/* ****************************************
*  Process update account information request
* *************************************** */
async function updateAccountPassword(req, res, next) {
  const { account_password, account_id } = req.body;
  const hashedPassword = await bcrypt.hashSync(account_password, 10);
  const nav = await utilities.getNav();
  const updatePasswordResult = await accountModel.updateAccountPassword(account_id, hashedPassword);
  
  if (updatePasswordResult) {
    req.flash("notice", `Congratulations, your account password has been updated!`);
  } else {
    req.flash("notice", "Sorry, the account update failed.");
  }
  res.render("account/management", { title: "Account Management", nav, errors: null });
}

/* ****************************************
 *  Logout function
 * ************************************ */
async function logout(req, res) {
  try {
    res.clearCookie('jwt');
    res.redirect('/');
  } catch (error) {
    console.error('Error logging out:', error);
    return new Error('Bad Logout')
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdate, updateAccountInfo, updateAccountPassword, logout };
