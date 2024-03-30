const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/***********************
 * Registration Data Validation Rules
 ***********************/
validate.registrationRules = () => {
    return [
        body("account_firstname").trim().notEmpty().isLength({ min: 1 }).withMessage("Please provide a first name."),
        body("account_lastname").trim().notEmpty().isLength({ min: 2 }).withMessage("Please provide a last name."),
        body("account_email").trim().notEmpty().isEmail().normalizeEmail().withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (emailExists) {
                    throw new Error("Email already exists. Please log in or use a different email address.");
                }
            }),
        body("account_password").trim().notEmpty().isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }).withMessage("Password does not meet requirements."),
    ];
};

/***********************
 * Check data and return errors or continue to registration
 ***********************/
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        });
        return;
    }
    next();
};

/***********************
 * Login validation
 ***********************/
validate.loginRules = () => {
    return [
        body("account_email").trim().notEmpty().isEmail().normalizeEmail().withMessage("Please enter a valid email address"),
        body("account_password").trim().notEmpty().withMessage("Password is required")
    ];
};

/***********************
 * Check data before processing login
 ***********************/
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        });
        return;
    }
    next();
};

/*  **********************************
 *  Update Validation Rules
 * ********************************* */
validate.accountUpdateRules = () => {
    return [
        body("account_firstname").trim().escape().notEmpty().isLength({ min: 1 }).withMessage("Please provide a first name."),
        body("account_lastname").trim().escape().notEmpty().isLength({ min: 2 }).withMessage("Please provide a last name."),
        body("account_email").trim().escape().notEmpty().isEmail().normalizeEmail().withMessage("A valid email is required.")
        .custom(async (account_email, {req}) => {
            const emailExists = await accountModel.checkExistingEmail(account_email, req.body.old_email);
            if (emailExists) {
                throw new Error("Email already exists. Please log in or use a different email address.");
            }
        })
    ];
};

/* ******************************
 * Check data and return errors or continue to update account
 * ***************************** */
validate.checkAccountUpdateData = async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/update", {
            errors,
            title: "Update " + account_firstname,
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        });
        return;
    }
    next();
};

/*  **********************************
 *  Update Password Validation Rules
 * ********************************* */
validate.passwordRules = () => {
    return [
        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),

    ];
};


module.exports = validate;
