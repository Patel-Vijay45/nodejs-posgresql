const db = require("./db");
const helper = require("../helper");
const config = require("../config");
async function getStatement(id = null) {
  let rows;
  if (data) {
    rows = await db.query("SELECT * FROM bankstatements where $id", [id]);
  } else {
    rows = await db.query("SELECT * FROM bankstatements");
  }``

  const data = helper.emptyOrRows(rows);
  return {
    data,
  };
}

function validateCreate(data) {
  let messages = {};
  if (!quote) {
    messages.push("No object is provided");
  }

  if (!data.transaction_date) {
    messages.push("Transaction Date is Required");
  }
  if (!data.particulars) {
    messages.push("Particulars is Required");
  }
  if (!data.amount) {
    messages.push("Amount is Required");
  }
  if (!data.transaction_type) {
    messages.push("Transaction Type is Required");
  }
  if (!data.balance) {
    messages.push("Balance is Required");
  }
  if (!data.bank_id) {
    messages.push("Bank Id is Required");
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
    "INSERT INTO bankstatements(transaction_date,particulars,amount,transaction_type,bank_id,balance) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *"[
      (data.transaction_date,
      data.particulars,
      data.amount,
      data.transaction_type,
      data.bank_id,
      data.balance)
    ]
  );

  let message = "Error in Creating Statement";

  if (result.length) {
    message = "Statement Created Successfully";
  }

  return { message };
}

module.exports = {
  getStatement,
  create,
};
