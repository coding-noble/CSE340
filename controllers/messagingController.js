const { route } = require("../routes/static");
const utilities = require("../utilities");
const messageModel = require("../models/messaging-model");
require("dotenv").config();

/* ****************************************
*  Deliver Message Inbox view
* ****************************************/
async function buildInbox(req, res) {
    const nav = await utilities.getNav();
    const messageInbox = await utilities.buildMessageTable(req.params.account_id);
    const archivedCount = await messageModel.getArchivedCount(req.params.account_id);
    res.render("message/inbox", {
        title: `Inbox`,
        nav,
        errors: null,
        messageInbox,
        archivedCount,
    });
}

/* ****************************************
*  Deliver Message Archive view
* ****************************************/
async function buildArchive(req, res) {
    const nav = await utilities.getNav();
    const archivedCount = await utilities.getCountById(req.params.account_id, (message) => message.message_archived);
    const archivedInbox = await utilities.buildMessageTable(req.params.account_id, true)
    res.render("message/archive", {
        title: `Archive`,
        nav,
        errors: null,
        archivedInbox,
        archivedCount,
    });
}

/* ****************************************
*  Deliver Read view
* ****************************************/
async function buildReading(req, res) {
    const nav = await utilities.getNav();
    const message_data = (await messageModel.getMessageById(req.params.message_id)).rows[0];
    res.render("message/reading", {
        title: `Message`,
        nav,
        errors: null,
        message_data
    });
}

/* ****************************************
*  Deliver New Message view
* ****************************************/
async function buildNewMessage(req, res) {
    const nav = await utilities.getNav();
    const recipientList = await utilities.buildRecipientList();
    res.render("message/new-message", {
        title: `New Message`,
        nav,
        errors: null,
        recipientList,
    });
}

/* ****************************************
*  Process for New Message
* *************************************** */
async function newMessage(req, res) {
    const { new_message_sender, new_message_recipient, new_message_subject, new_message_content } = req.body;
    try {
        const result = await messageModel.sendMessage(new_message_sender, new_message_recipient, new_message_subject, new_message_content);

        if (result) {
            req.flash("notice", `Message Sent Successfully`);
            res.redirect(`/message/inbox/${new_message_sender}`);
        } else {
            req.flash("notice", "Sorry, failed to send message.");
            res.redirect(`/message/inbox/${new_message_sender}`);
        }
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing message send request.');
        res.redirect(`/message/inbox/${new_message_sender}`);
    }
}

/* ****************************************
*  Process for Updating message_read
* *************************************** */
async function toggleRead(req, res) {
    try {
        const result = await messageModel.toggleRead(req.params.message_id)
        if (result) {
            req.flash("notice", `Message Updated`);
            res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
        } else {
            req.flash("notice", `Message Failed To Updated`);
            res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
        }
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the update on your message.');
        res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
    }
}

/* ****************************************
*  Process for Updating message_archived
* *************************************** */
async function toggleArchive(req, res) {
    try {
        const result = await messageModel.toggleArchive(req.params.message_id)
        if (result) {
            req.flash("notice", `Message Updated`);
            res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
        } else {
            req.flash("notice", `Message Failed To Updated`);
            res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
        }
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the update on your message.');
        res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
    }
}

/* ****************************************
*  Deliver Delete Confirmation view
* ****************************************/
async function buildDeleteConfirmation(req, res) {
    const nav = await utilities.getNav();
    const message_data = (await messageModel.getMessageById(req.params.message_id)).rows[0];
    res.render("message/delete", {
        title: `Delete Confirmation`,
        nav,
        errors: null,
        message_data
    });
}

/* ****************************************
*  Process for Updating message_archived
* *************************************** */
async function deleteMessage(req, res) {
    try {
        const result = await messageModel.deleteMessage(req.params.message_id)
        if (result) {
            req.flash("notice", `Message Deleted`);
            res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
        } else {
            req.flash("notice", `Message Failed To Delete`);
            res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
        }
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the update on your message.');
        res.redirect(`/message/inbox/${res.locals.accountData.account_id}`);
    }
}

/* ****************************************
*  Deliver Delete Confirmation view
* ****************************************/
async function buildReply(req, res) {
    const nav = await utilities.getNav();
    const messageData = (await messageModel.getMessageById(req.params.message_id)).rows[0];
    const recipient = `${messageData.account_firstname} ${messageData.account_lastname}`;
    const recipient_id = messageData.account_id;
    res.render("message/reply", {
        title: `Reply To ${recipient}`,
        nav,
        errors: null,
        recipient, 
        recipient_id,
    });
}


module.exports = { buildInbox, buildArchive, buildReading, buildNewMessage, buildDeleteConfirmation, buildReply, newMessage, toggleRead, toggleArchive, deleteMessage };