const db = require("./db");
const helper = require("../helper");
const config = require("../config");
async function getBanks(id = null) {
  let rows;
  if (id) {
    rows = await db.query("SELECT * from banks where id=$id", [id]);
  } else {
    rows = await db.query("SELECT * from banks");
  }
  const data = helper.emptyOrRows(rows);
  return {
    data,
  };
}

function validateCreate(data) {
  let messages = [];

  console.log(data);

  if (!data) {
    messages.push("No object is Provided");
  }

  if (!data.holder_name) {
    messages.push("Holder Name is Required");
  }
  if (!data.bank_name) {
    messages.push("Bank Name is Required");
  }
  if (!data.mobile) {
    messages.push("Mobile Name is Required");
  }
  if (!data.customer_id) {
    messages.push("Customer Id Name is Required");
  }
  if (!data.account_no) {
    messages.push("Account No. Name is Required");
  }

  if (messages.length) {
    let error = new Error(messages.join());
    error.statusCode = 422;

    throw error;
  }
}

async function create(data) {
  console.error("Error writing JSON file:", data);
  validateCreate(data);
  const result = await db.query(
    "INSERT INTO banks(holder_name,bank_name,mobile,customer_id,account_no) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [
      data.holder_name,
      data.bank_name,
      data.mobile,
      data.customer_id,
      data.account_no,
    ]
  );
  let messages = "Error in creating Bank";
  if (result.length) {
    messages = "Bank Created Successfully";
  }

  return { messages };
}

async function checkBank(data) {
  const { bankData } = data;
  const { Name, Customer, IFSC, Mobile } = bankData;
  const name = Name.split(":-")[1].trim();
  const customerID = Customer.split(":-")[1].trim();
  const ifscCode = IFSC.split(":-")[1].trim();
  const mobileNo = Mobile.split(":-")[1].trim();

  // Check if the entry exists in the database
  const query = `
    SELECT id FROM bank
    WHERE  account_no = $3
  `;
  const values = [name, customerID, ifscCode, mobileNo];
  // return values;
  try {
    const rows = await db.query(
      "SELECT id FROM banks WHERE  account_no = $3",
      values
    );
    // return rows;
    if (rows.length > 0) {
      // Entry exists, return its ID
      return rows[0].id;
    } else {
      // Entry doesn't exist, insert it and return the new ID
      const insertQuery = `
        INSERT INTO banks (holder_name, customer_id, account_no, mobile,bank_name)
        VALUES ($1, $2, $3, $4,'axis')
        RETURNING id
      `;
      const insertResult = await db.query(insertQuery, values);
      return insertResult.rows[0].id;
    }
  } catch (err) {
    return err;
    return "Error executing query " + err.message;
  }
}
module.exports = {
  getBanks,
  create,
  checkBank,
};
