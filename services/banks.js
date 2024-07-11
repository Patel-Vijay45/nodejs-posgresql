const { db } = require("../config");

const helper = require("../helper");
async function getBanks(id = null) {
  if (id) {
    const rows = await db.query("SELECT * from banks where id=$id", [id]);
  } else {
    const rows = await db.query("SELECT * from banks");
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

module.exports = {
  getBanks,
  create,
};
