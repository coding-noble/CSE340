const invModel = require("../models/inventory-model");
const Util = {};

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
    if (!data || !data.length) {
        return "<p>Sorry, this product is not in stock.</p>";
    }

    const invData = data[0];
    const formattedPrice = new Intl.NumberFormat("en-US").format(invData.inv_price);
    const formattedMiles = new Intl.NumberFormat("en-US").format(invData.inv_miles);

    return `
        <div id="details-view">
            <div id="image-box">
                <img src="${invData.inv_image}" alt="Image of ${invData.inv_year} ${invData.inv_make} ${invData.inv_model}"/>
            </div>
            <div id="info-box">
                <h2>Details of ${invData.inv_year} ${invData.inv_make} ${invData.inv_model}</h2>
                <p><strong>Price:</strong> $${formattedPrice}</p>
                <p><strong>Description:</strong> ${invData.inv_description}</p>
                <p><strong>Color:</strong> ${invData.inv_color}</p>
                <p><strong>Miles:</strong> ${formattedMiles}</p>
            </div>
        </div>
    `;
};

/*********************
 * Build a select list from classification
 ****************************/
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications();
    let classificationList =
      '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"';
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected ";
      }
      classificationList += ">" + row.classification_name + "</option>";
    });
    classificationList += "</select>";
    return classificationList;
  };

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;