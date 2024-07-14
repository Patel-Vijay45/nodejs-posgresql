const express = require("express");
const router = express.Router();
const statements = require("../services/statements");
const upload = require("../services/fileUpload");
const ExcelJS = require("exceljs");
const fs = require("fs");
const { checkBank } = require("../services/banks");
/* get statement */
router.get("/", async function (req, res, nect) {
  try {
    res.json(await statements.getStatement(req.query.page));
  } catch (err) {
    console.error(`Error while getting statements `, err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

/* POST statements */
router.post("/", async function (req, res, next) {
  try {
    res.json(await statements.create(req.body));
  } catch (err) {
    console.error(`Error while posting statements `, err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});
/* POST upload statements */
router.post("/upload", async function (req, res, next) {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ errorMessage: err.message });
    }

    if (!req.file) {
      return res.status(500).json({ message: "Error: No File Selected!" });
    }

    const excelData = [];
    let bankData = {};

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);

      workbook.eachSheet((worksheet, sheetId) => {
        worksheet.eachRow((row, rowNumber) => {
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const data = cell.value?.toString().trim() || "";

            // const data = cell?.value?.toString().replace(/\s+/g, "") || "";
            const columnName = String.fromCharCode(64 + colNumber);

            if (rowNumber <= 17) {
              const stringExists = containsKeywords(data);
              if (stringExists) {
                bankData[stringExists] = data;
              }
            } else {
              if (data && columnName == "B") {
                rowData["transaction_date"] = convertDate(data);
              } else if (data && columnName == "D") {
                rowData["particulars"] = data;
              } else if (data && columnName == "E") {
                rowData["amount"] = data;
                rowData["transaction_type"] = "D";
              } else if (data && columnName == "F") {
                rowData["amount"] = data;
                rowData["transaction_type"] = "C";
              } else if (data && columnName == "G") {
                rowData["balance"] = data;
              }
            }
          });

          if (rowNumber > 17) {
            if (Object.keys(rowData).length === 0) {
              throw new Error("Break loop");
            } else excelData.push(rowData);
          }
        });
      });
    } catch (error) {}
    const newbank = await checkBank({ bankData });
    const insertedData = await statements.bulkCreate(excelData, newbank);
    return res.status(200).json({ sdbmessage: insertedData });

    // Process bank data and other operations if needed

    // Example: Writing Excel data to JSON file
    fs.writeFile(
      "uploads/output.json", // Adjust path as needed
      JSON.stringify(excelData, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing JSON file:", err);
        } else {
          console.log("JSON file written successfully.");
        }
      }
    );
    res.json({
      message: `File Uploaded: ${req.file.originalname}`,
      data: excelData, // Send the processed Excel data as part of the response
    });
  });
});
function convertDate(dateStr) {
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`; // Converts DD-MM-YYYY to YYYY-MM-DD
}

function containsKeywords(str) {
  const keywords = ["Name", "Mobile", "Customer", "IFSC"];
  // Convert the input string to lower case
  const lowerStr = str.toLowerCase();

  // Check for each keyword
  for (const keyword of keywords) {
    if (lowerStr.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }

  return false;
}

// Example route to read `output.json`
router.get("/output", async function (req, res, next) {
  try {
    const filePath = "uploads/output.json"; // Adjust path as per your setup
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(jsonData);
    res.json(data); // Send JSON data from output.json
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
