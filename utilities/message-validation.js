const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

validate.addNewMessageRules = () => {
    return [
        body("new_message_sender").trim().notEmpty().withMessage("Failed to get sender."),
        body("new_message_recipient").trim().notEmpty().withMessage("Select A Recipient."),
        body("new_message_subject", "Must Enter A Subject.").trim().notEmpty(),
        body("new_message_content", "Must Fill Out Message Content.").trim().notEmpty()
    ];
};

validate.checkNewMessage = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const { new_message_sender, new_message_recipient, new_message_subject, new_message_content } = req.body;
        const recipientList = await utilities.buildRecipientList(new_message_recipient);
        res.render("message/new-message", {
            errors,
            title: "New Message",
            nav,
            recipientList,
            new_message_sender,
            new_message_recipient,
            new_message_subject,
            new_message_content
        });
        return;
    }
    next();
};

module.exports = validate;