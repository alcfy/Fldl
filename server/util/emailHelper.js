const rp = require("request-promise");

//get email of store to know who to send to
async function getStoreEmail(dbIn, store) {
  db = dbIn;
  myRef = db.collection("store").doc(store.toLowerCase());
  let query = await myRef.get();
  const email = query._fieldsProto.email.stringValue;
  return email;
}

//send email about the status of their items to customer of each processed order
async function sendUpdateEmail(email, acceptedList, rejectedList) {
  const headers = {};
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = "Bearer " + process.env.SENDGRID;
  let message = "";
  message +=
    "Thank you for submitting your return. Your order has been processed. ";
  if (acceptedList.length > 0) {
    message += "The following items have been accepted:";
    message += "\n\n";
    for (var i = 0; i < acceptedList.length; i++) {
      message +=
        i +
        1 +
        ": " +
        acceptedList[i].oldItem.mapValue.fields.OLDname.stringValue +
        " - " +
        acceptedList[i].oldItem.mapValue.fields.OLDvariantid.stringValue;
      message += "\n\n";
    }
  }
  if (rejectedList.length > 0) {
    message +=
      "The following items have been rejected. You may pick them up from X within the next 7 days. ";
    message += "\n\n";
    for (var i = 0; i < rejectedList.length; i++) {
      message +=
        i +
        1 +
        ": " +
        rejectedList[i].oldItem.mapValue.fields.OLDname.stringValue +
        " - " +
        rejectedList[i].oldItem.mapValue.fields.OLDvariantid.stringValue;
      message += "\n\n";
      message += "\n\n";
    }
  }
  message += "\n";
  message += "Thank you.";
  const option = {
    method: "POST",
    url: "https://api.sendgrid.com/v3/mail/send",
    headers: headers,
    json: true,
    body: {
      personalizations: [
        {
          to: [
            {
              email: "booleafs17@yahoo.ca" //change to EMAIL once live
            }
          ],
          subject: "Status Update"
        }
      ],
      from: {
        name: "Status Update",
        email: "no-reply@sender.com"
      },
      content: [
        {
          type: "text/plain",
          value: message
        }
      ]
    }
  };
  await rp(option);
}

//send email to store about items that were received that day
async function sendItemEmail(itemList, email) {
  const headers = {};
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = "Bearer " + process.env.SENDGRID;
  let message = "";
  if (itemList.length > 0) {
    message +=
      "The following return items have been accepted in the last X hours, will be added to the store in the morning.";
    message += "\n\n";
    for (var i = 0; i < itemList.length; i++) {
      message +=
        i +
        1 +
        ": " +
        itemList[i].name.stringValue +
        " - " +
        itemList[i].variantid.stringValue +
        " ... Quantity: " +
        itemList[i].quantity;
      message += "\n\n";
    }
  }
  const option = {
    method: "POST",
    url: "https://api.sendgrid.com/v3/mail/send",
    headers: headers,
    json: true,
    body: {
      personalizations: [
        {
          to: [
            {
              email: email //change to EMAIL once live
            }
          ],
          subject: "Daily Report - Items Received"
        }
      ],
      from: {
        name: "Daily Report",
        email: "no-reply@sender.com"
      },
      content: [
        {
          type: "text/plain",
          value: message
        }
      ]
    }
  };
  await rp(option);
}

//send email to store about orders that need to be refunded
async function sendRefundEmail(orderList, email) {
  const headers = {};
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = "Bearer " + process.env.SENDGRID;
  let message = "";
  if (orderList.length > 0) {
    message += "The following orders have items that should be refunded.";
    message += "\n\n";
    for (var i = 0; i < orderList.length; i++) {
      message += "Order Number " + orderList[i].orderNum + ": ";
      for (var j = 0; j < orderList[i].refundItems.length; j++) {
        message += "\n";
        message += "\t";
        message +=
          orderList[i].refundItems[j].oldItem.mapValue.fields.OLDname
            .stringValue +
          " ... " +
          orderList[i].refundItems[j].oldItem.mapValue.fields.OLDvariantid
            .stringValue;
      }
      message += "\n\n";
    }
  }

  const option = {
    method: "POST",
    url: "https://api.sendgrid.com/v3/mail/send",
    headers: headers,
    json: true,
    body: {
      personalizations: [
        {
          to: [
            {
              email: email //change to EMAIL once live
            }
          ],
          subject: "Daily Report - Refunds Necessary"
        }
      ],
      from: {
        name: "Daily Report",
        email: "no-reply@sender.com"
      },
      content: [
        {
          type: "text/plain",
          value: message
        }
      ]
    }
  };
  await rp(option);
}

module.exports = {
  getStoreEmail,
  sendItemEmail,
  sendRefundEmail,
  sendUpdateEmail
};
