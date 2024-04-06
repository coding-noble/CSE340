const invModel = require("../models/inventory-model");
const messageModel = require("../models/messaging-model")
const Util = {};
const jwt = require("jsonwebtoken")
require("dotenv").config()

/***************
 * Constructs the nav HTML unordered list
 ***************/
Util.getNav = async function (req, res, next) {
    const data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';

    data.rows.forEach((row) => {
        list += `
            <li>
                <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">
                    ${row.classification_name}
                </a>
            </li>`;
    });

    list += "</ul>";
    return list;
};

/*************************
 * Build the classification view HTML
 ************************/
Util.buildClassificationGrid = async function (data) {
    let grid = "";

    if (data.length > 0) {
        const items = data.map(vehicle => `
            <li>
                <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                    <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
                </a>
                <div class="namePrice">
                    <hr />
                    <h2>
                        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                            ${vehicle.inv_make} ${vehicle.inv_model}
                        </a>
                    </h2>
                    <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
                </div>
            </li>`
        );

        grid = `<ul id="inv-display">${items.join('')}</ul>`;
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }

    return grid;
};

/************************
 * Build the Vehicle view HTML
 ********************/
Util.buildVehicleDetail = async function (data) {
    const formattedPrice = new Intl.NumberFormat("en-US").format(data.inv_price);
    const formattedMiles = new Intl.NumberFormat("en-US").format(data.inv_miles);

    return `
        <div id="details-view">
            <div id="image-box">
                <img src="${data.inv_image}" alt="Image of ${data.inv_year} ${data.inv_make} ${data.inv_model}"/>
            </div>
            <div id="info-box">
                <h2>Details of ${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
                <p><strong>Price:</strong> $${formattedPrice}</p>
                <p><strong>Description:</strong> ${data.inv_description}</p>
                <p><strong>Color:</strong> ${data.inv_color}</p>
                <p><strong>Miles:</strong> ${formattedMiles}</p>
            </div>
        </div>
    `;
};

/*********************
 * Build list for Intentional Error
 ****************************/
Util.buildErrorList = async function (data) {
    let errorList = '<ol id="error-list">';
    data.forEach((problem) => {
        errorList += `<li>${problem.id} ${problem.value}</li>`;
    });
    errorList += "</ul>";
    return errorList;
};

/*********************
 * Build a select list from classification
 ****************************/
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications();
    let classificationList = `
        <select name="classification_id" id="classificationList" required>
            <option value="">Choose a Classification</option>
    `;
    data.rows.forEach((row) => {
        classificationList += `
            <option value="${row.classification_id}" ${classification_id != null && row.classification_id == classification_id ? "selected" : ""}>
                ${row.classification_name}
            </option>
        `;
    });
    classificationList += `</select>`;
    return classificationList;
};

/*****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/*****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else next();
}

/*****************************************
 *  Check Login
 *****************************************/
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

Util.restrictAccess = (req, res, next) => {
    const allowedTypes = ["Employee", "Admin"];
    const accountType = res.locals.accountData.account_type;
    if (allowedTypes.includes(accountType)) {
        next();
    } else {
        req.flash("notice", "Access Denied.");
        return res.redirect("/account/");
    }
}

/*********************
 * Build a select list for message recipient
 ****************************/
Util.buildRecipientList = async function (recipient_id = null) {
    const data = await messageModel.getRecipients();
    let recipientsList = `
    <select name="new_message_recipient" id="new_message_recipient" required>
            <option value="">Select a Recipient</option>`;
    data.rows.forEach((row) => {
        recipientsList += `
            <option value="${row.account_id}" ${recipient_id != null && row.account_id == recipient_id ? "selected" : ""}>
                ${row.account_firstname} ${row.account_lastname}
            </option>`;
    });
    recipientsList += `</select>`;
    return recipientsList;
};


/*************************************************
 * Build Inbox/Archive Inbox HTML By Account ID
 *************************************************/
Util.buildMessageTable = async function (account_id, showArchived = false) {
    const messageData = await messageModel.getInboxByAccountId(account_id);
    let inboxTable = `
        <table>
            <thead>
                <tr>
                    <th><strong>Received</strong></th>
                    <th><strong>Subject</strong></th>
                    <th><strong>From</strong></th>
                    <th><strong>Read</strong></th>
                </tr>
            </thead>
            <tbody>`;
    messageData.rows.forEach((row) => {
        if (row.message_archived == showArchived) {
            inboxTable += `
            <tr>
                <td>${row.message_created}</td>
                <td><a href="/message/reading/${row.message_id}">${row.message_subject}</a></td>
                <td>${row.account_firstname} ${row.account_lastname}</td>
                <td>${row.message_read ? "Yes" : "No"}</td>
            </tr>`;
        }
    });
    inboxTable += "</tbody></table>";
    return inboxTable;
}

module.exports = Util;