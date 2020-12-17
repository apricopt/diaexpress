const express = require("express");
const Contact = require("../models/Contact");
const Order = require("../models/Order");
const excel = require("exceljs");
const router = express.Router();

router.get("/export/contact", (req, res) => {
  (async () => {
    try {
      const contacts = await Contact.find().lean();
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet("Contacts");
      worksheet.columns = [
        { header: "name", key: "name", width: 20 },
        { header: "email", key: "email", width: 30 },
        { header: "phone", key: "phone", width: 30 },
        { header: "message", key: "message", width: 100 },
      ];
      let count = 1;
      contacts.forEach((contact) => {
        worksheet.addRow(contact);
        console.log("yeh reha contact ", contact);
      });
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      const data = await workbook.xlsx.writeFile("contact.xlsx");
      // res.sendFile( __dirname , "contact.xlsx");

    } catch (error) {
      console.log(error);
    }
  })();
});

router.post("/export/appointment", (req, res) => {
  console.log(req.body);
});

module.exports = router;
