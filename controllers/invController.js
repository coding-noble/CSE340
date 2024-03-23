const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/*****************
 * Build Inventory by Classification View
 ***********************/
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", { title: className + " vehicles", nav, grid, });
};

/******************************
 * Build Vehicle Detail View
 * *************************/
invCont.buildVehicleDetail = async function (req, res, next) {
    const inv_id = await req.params.invId;
    const data = await invModel.getInventoryDetailByInvId(inv_id);
    const details = await utilities.buildVehicleDetail(data);
    let nav = await utilities.getNav();
    const vehicleYear = data[0].inv_year;
    const vehicleMake = data[0].inv_make;
    const vehicleModel = data[0].inv_model;
    res.render("./inventory/details", { title: `${vehicleYear} ${vehicleMake} ${vehicleModel} Details`, nav, details, });
};

/*************************************
 * Build Management View
 ***************************************/
invCont.buildManagement = async function (req, res, next) {
    const nav = await utilities.getNav();
    res.render("./inventory/management", { title: "Management", nav, });
};

/*******************
 * Build Add-Classification View
 **********************/
invCont.buildAddClassificationView = async function (req, res, next) {
    const nav = await utilities.getNav();
    res.render("./inventory/add-classification", { title: "Add Classification", nav, errors: null });
};

/*********************
 * Add New Classification
 *************************/
invCont.addClassification = async function (req, res) {
    let nav = await utilities.getNav();
    const { classification_name } = req.body;
    const addClass = await invModel.addClassification(classification_name);
    if (addClass) {
        req.flash(
            "notice",
            `${classification_name} has now been added as a new type`
        );
        res.status(201).render("inventory/management", {
            title: "Management",
            nav,
            errors: null,
        });
    } else {
        req.flash("notice", "Sorry, the new class addition was not successful.");
        res.status(501).render("inventory/management", {
            title: "Management",
            nav,
            errors: null,
        });
    }
};
/*****************************************
 * Build New Inventory View
 **************************************/
invCont.buildAddInventoryView = async function (req, res, next) {
    const nav = await utilities.getNav();
    const { classification_id } = req.body;
    const invClass = await utilities.buildClassificationList(classification_id);
    res.render("./inventory/add-inventory", { title: "Add New Inventory", nav, invClass, errors: null });
};

/************************************
 * Add New Vehicle Inventory to the Database
 **********************************/
invCont.addNewInventory = async (req, res) => {
    const nav = await utilities.getNav();
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, } = req.body;
    const addInventory = await invModel.addNewInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
    if (addInventory) {
        req.flash(
            "notice",
            `${inv_make} ${inv_model} has been added to the inventory database`
        );
        res.status(201).render("inventory/management", {
            title: "Management",
            nav,
            errors: null,
        });
    } else {
        req.flash(
            "notice",
            "Sorry, the new item was not successfully added to the database"
        );
        res.status(501).render("inventory/management", {
            title: "Management",
            nav,
            errors: null,
        });
    }
};

/*****************************
 * Demonstrate Internal Server Error
 *************************/
invCont.intentionalError = async function (req, res, next) {
    let nav = await utilities.getNav();
    let data = await invModel.getMembers();
    let list = await utilities.buildMemberList(data);
    res.render("./inventory/details", { title: "Members", nav, list });
};

module.exports = invCont;