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
      res.status(500).json({ message: "Error: No File Selected!" });
      res.send(err);
    } else {
      if (req.file == undefined) {
        res.status(500).json({ message: "Error: No File Selected!" });
        // res.send("");
      } else {
        const excelData = [];
        let bankData = [];
        let data = [];
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.readFile("./uploads/" + req.file.filename);
          workbook.eachSheet((worksheet, sheetId) => {
            let stringExists;
            worksheet.eachRow((row, rowNumber) => {
              const rowData = {};
              row.eachCell((cell, colNumber) => {
                data = cell.toString().replace(/\s+/g, "") ?? "";

                const columnName = String.fromCharCode(64 + colNumber);
                if (rowNumber <= 17) {
                  if ((stringExists = containsKeywords(data))) {
                    bankData[stringExists] = data;
                  }
                } else {
                  if (data && columnName == "B") {
                    rowData["transaction_date"] = data;
                  } else if (data && columnName == "D") {
                    rowData["particulars"] = data;
                  } else if (data && columnName == "E") {
                    rowData["amount"] = data;
                    rowData["transaction_type"] = "D";
                  } else if (data && columnName == "F") {
                    rowData["amount"] = data;
                    rowData["transaction_type"] = "C";
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
        } catch (error) {
          res.status(200).json({ message: checkBank(bankData) });
        }
        const promises = [];
        Promise.all(promises).then(() => {
          fs.writeFile(
            "uploads/output.json",
            JSON.stringify(excelData, null, 2),
            (err) => {
              if (err) {
                console.error("Error writing JSON file:", err);
              } else {
                console.log("JSON file written successfully.");
              }
            }
          );
        });
        res.send(`File Uploaded: ${req.file.filename}`);
      }
    }
  });
  // try {
  //   res.json(await statements.create(req.body));
  // } catch (err) {
  //   console.error(`Error while posting statements `, err.message);
  //   res.status(err.statusCode || 500).json({ message: err.message });
  // }
});
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
module.exports = router;
