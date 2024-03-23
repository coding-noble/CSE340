const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const classValidate = require("../models/inventory-model");

/********************************
 * Add classification validation rules
 *******************************/
validate.addClassificationValidationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isAlpha()
            .isLength({ min: 3 })
            .withMessage("Classification name must be at least 3 letters long and contain no spaces")
            .custom(async (classification_name) => {
                const nameInUse = await classValidate.verifyNewClassification(classification_name);
                if (nameInUse) {
                    throw new Error(`${classification_name} is already an existing classification. Choose a different name.`);
                }
            }),
    ];
};

/***********************************************
 * Check data and return errors or continue
 * with classification addition process
 *******************************************/
validate.checkAddClassification = async (req, res, next) => {
    const { classification_name } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name,
        });
        return;
    }
    next();
};

/***************************
 * Add inventory validation rules
 ********************/
validate.addInvRules = () => {
    return [
        body("classification_id")
            .trim()
            .notEmpty()
            .withMessage("Select a classification"),

        body("inv_make", "An inventory make is required").trim().notEmpty(),
        body("inv_model", "Inventory model is required").trim().notEmpty(),
        body("inv_year")
            .trim()
            .isInt({ min: 1950, max: 2025 })
            .withMessage("A valid year between 1950 and 2025 is required"),
        body("inv_description")
            .trim()
            .isString()
            .isLength({ min: 10 })
            .withMessage("Description with at least 10 characters is required"),
        body("inv_image")
            .trim()
            .matches(/(([^\\s]+(jpe?g|png))$)/)
            .withMessage("PNG or JPG image file path is required"),
        body("inv_thumbnail")
            .trim()
            .matches(/(([^\\s]+(jpe?g|png))$)/)
            .withMessage("PNG or JPG image thumbnail file path is required"),
        body("inv_price", "A minimum price of 20 is required").trim().isInt({ min: 20 }),
        body("inv_miles", "A minimum of 0 miles is required").trim().isInt({ min: 0 }),
        body("inv_color", "Inventory color is required").trim().notEmpty(),
    ];
};

validate.checkAddInv = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;
        const invClass = await utilities.buildClassificationList(classification_id);
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            invClass,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        });
        return;
    }
    next();
};

module.exports = validate;
