const db = require("./db");
const helper = require("../helper");
const config = require("../config");
async function getStatement(id = null) {
  let rows;
  if (id) {
    rows = await db.query("SELECT * FROM bankstatements where $id", [id]);
  } else {
    rows = await db.query("SELECT * FROM bankstatements");
  }

  const data = helper.emptyOrRows(rows);
  return {
    data,
  };
}

function validateCreate(data) {
  let messages = [];
  if (!data) {
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
const bulkCreate = async (statements, bankId) => {
  try {
    const query = `
      INSERT INTO statements (transaction_date, particulars, amount, transaction_type, balance, bank_id)
      VALUES
      ${transactions
        .map(
          (_, i) =>
            `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${
              i * 6 + 5
            }, $${i * 6 + 6})`
        )
        .join(", ")}
      RETURNING id
    `;

    const values = transactions.flatMap(
      ({
        transaction_date,
        particulars,
        amount,
        transaction_type,
        balance,
      }) => [
        transaction_date,
        particulars,
        amount,
        transaction_type,
        balance,
        bankId,
      ]
    );

    const result = await db.query(query, values);
    return result.rows;
    // console.log(result.rows); // Contains the inserted row IDs
  } catch (err) {
    return ("Error inserting transactions:", err);
  } finally {
    // client.release();
  }
};
module.exports = {
  getStatement,
  create,
  bulkCreate
};
