// Required modules
const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const messageController = require("../controllers/messagingController");

router.use("/", utilities.checkLogin);

// Route to build the account inbox
router.get("/inbox/:account_id", utilities.handleErrors(messageController.buildInbox));

router.get("/reading/:message_id", utilities.handleErrors(messageController.buildReading));

router.get("/archive/:account_id", utilities.handleErrors(messageController.buildArchive));

router.get("/new_message", utilities.handleErrors(messageController.buildNewMessage));

router.post("/new_message", utilities.handleErrors(messageController.newMessage));

router.get("/toggle_read/:message_id", utilities.handleErrors(messageController.toggleRead))

router.get("/toggle_archive/:message_id", utilities.handleErrors(messageController.toggleArchive))

router.get("/delete/:message_id", utilities.handleErrors(messageController.buildDeleteConfirmation))

router.get("/confirm_delete/:message_id", utilities.handleErrors(messageController.deleteMessage))

router.get("/reply/:message_id", utilities.handleErrors(messageController.buildReply))

module.exports = router;