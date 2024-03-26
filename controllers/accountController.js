const { route } = require("../routes/static");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
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
*  Deliver default view
* *************************************** */
async function buildDefault(req, res, next) { await buildView(req, res, next, "default", "Default"); }

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

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildDefault };
