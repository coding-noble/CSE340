// Required modules
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const inventoryValidate = require("../utilities/inventory-validation");

router.use([], utilities.restrictAccess);

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle details
router.get("/detail/:invId", utilities.handleErrors(invController.buildVehicleDetail));

// Route to build management view
router.get("/", utilities.restrictAccess, utilities.handleErrors(invController.buildManagement));

// Route to build add-classification view
router.get("/add-classification", utilities.restrictAccess, utilities.handleErrors(invController.buildAddClassificationView));

// Route to post new classification to the DB
router.post("/add-classification", utilities.restrictAccess, inventoryValidate.addClassificationValidationRules(), inventoryValidate.checkAddClassification, utilities.handleErrors(invController.addclassification));

// Route to build the add-inventory view
router.get("/add-inventory", utilities.restrictAccess, utilities.handleErrors(invController.buildAddInventoryView));

// Route to post/add new inventory
router.post("/add-inventory", utilities.restrictAccess, inventoryValidate.addInvRules(), inventoryValidate.checkAddInv, utilities.handleErrors(invController.addNewInventory));

// Intentional error route
router.get("/err", utilities.handleErrors(invController.intentionalError));

// Route to getInventory
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to deliver inventory editor
router.get("/update/:inventory_id", utilities.restrictAccess, utilities.handleErrors(invController.buildUpdateInventoryView));

// Post for update inventory
router.post("/update", utilities.restrictAccess, inventoryValidate.addInvRules(), inventoryValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory));

// Deliver the delete confirmation view
router.get("/delete/:inv_id", utilities.restrictAccess, utilities.handleErrors(invController.deleteView));

// Process the delete inventory request
router.post("/delete", utilities.restrictAccess, utilities.handleErrors(invController.deleteItem));

module.exports = router;
