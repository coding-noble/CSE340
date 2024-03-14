const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/*****************
 * Build inventory by classification view
 ***********************/
invCont.buildByClassificationId = async function (req, res) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: `${className} vehicles`, nav, grid
    });
};

/******************************
 * Build vehicle detail view
 * *************************/
invCont.buildVehicleDetail = async function (req, res) {
    const inv_id = req.params.invId;
    const data = await invModel.getInventoryDetailByInvId(inv_id);
    const details = await utilities.buildVehicleDetail(data);
    const nav = await utilities.getNav();
    const vehicleYear = data[0].inv_year;
    const vehicleMake = data[0].inv_make;
    const vehicleModel = data[0].inv_model;
    res.render("./inventory/details", {
        title: `${vehicleYear} ${vehicleMake} ${vehicleModel} Details`, nav, details
    });
};

/*****************************
 * 
 *************************/
invCont.intentionalError = async function (res) {
    const nav = await utilities.getNav();
    res.render("./inventory/details", {
        title: "Intentional Error", nav
    });
};

module.exports = invCont;