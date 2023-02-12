const express = require("express");
const util = require("util");
let ejs = require("ejs");

const app = express();
const PORT = 9080;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const con = require("./config/db_config");
var templateQueries = require("./database_query/templateQueries");
const makeFile = util.promisify(fs.writeFile);
let pdf = require("html-pdf");

app.set("view engine", "ejs");
require("./config/db_config");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

var storageAssign = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./html/");
  },
  filename: function (req, file, cb) {
    filename = file.originalname;

    cb(null, filename);
  },
});

var uploadFile = multer({
  storage: storageAssign,
}).single("file");
app.post("/", (req, res) => {
  //   var dataHTML='';
  uploadFile(req, res, async (err) => {
    if (err) console.log(err);
    var htmlPath = path.join(__dirname, ".", "html", req.file.originalname);
    fs.readFile(htmlPath, "utf8", (err, data) => {
      var htmlData = data;
      var tableData = data;
      var tbody = tableData.match(/(<tbody)+((.|\r\n)*)(<\/tbody>)+/gim);
      var trs = tbody[0].match(/(<tr>)+((.|\r\n)*?)(<\/tr>)+/gim);
      var firstTr = trs[0];
      firstTr = firstTr
        .replace(
          "<tr>",
          "<tr>\r\n<% for(var i=0; i<JSON.stringify(result).length; i++) {%>"
        )
        .replace("</tr>", "\r\n<%}%>\r\n</tr>");

      for (var match of firstTr.matchAll(/@[a-zA-Z0-9._-]+/gi)) {
        var reg = new RegExp(match[0], "gi");
        firstTr = firstTr.replaceAll(
          reg,
          "<%=result[i]." + match[0].replace("@", "") + "%>"
        );
      }
      trs[0] = firstTr;
      tbody = "<tbody>\r\n" + trs.join("\r\n") + "\r\n</tbody>\r\n";
      tableData = tableData.replace(
        /(<tbody)+((.|\r\n)*)(<\/tbody>)+/gim,
        tbody
      );
      data = data
        .match(/(<table)+((.|\r\n)*)(<\/table>)+/im)[0]
        .replace(/(<table)+((.|\r\n)*)(<\/table>)+/im, tableData);

      for (var match of data.matchAll(/@[a-zA-Z0-9._-]+/gi)) {
        var reg = new RegExp(match[0], "gi");
        data = data.replaceAll(reg, "<%=" + match[0].replace("@", "") + "%>");
      }
      var templateData = "";
      templateData = data;
      templateQueries.templateAdd(templateData, htmlData);
      //res.send(data);
    });

    //res.send(data);
  });
});

app.get("/", (req, res) => {
  try {
    con.connect((err) => {
      if (err) {
        throw err;
      } else {
        var query = `SELECT * FROM templates WHERE template_id=9`;
        con.query(query, (err, data) => {
          if (err) console.error(err);
          var tempData = eval("`" + data[0].template_data + "`");
          var jsonData = {
            universityname: "VNSGU",
            address1: "ADD1",
            adress2: "ADD2",
            cellno: "0987654321",
            rollno: "12",
            date: "09-10-2022",
            email: "abc@gmail.com",
            studname: "Pankti",
            studAdd: "SURAT",
            studcellno: "1234567890",
            result: [
              {
                subject: "Eng",
                mark: 90,
                per: 90,
                grade: "A",
              },
              {
                subject: "Guj",
                mark: 90,
                per: 90,
                grade: "A",
              },
            ],
            total: 180,
            practical: 48,
            grandtotal: 100,
            status: "PASS",
            grade: "A",
          };
          // makeFile("./views/temp.ejs", data[0].template_data)
          //   .then((dateta) => {
          //fs.appendFile("./views/");
          // res.render("temp", jsonData);
          ejs.renderFile(
            path.join(__dirname, "./views/", "temp.ejs"),
            jsonData,
            (err, fileData) => {
              if (err) {
                res.send(err);
              } else {
                let options = {
                  // height: "11.25in",
                  // width: "8.5in",
                  // header: {
                  //   height: "20mm",
                  // },
                  // footer: {
                  //   height: "20mm",
                  // },
                };
                pdf
                  .create(fileData, options)
                  .toFile("report.pdf", function (err, data) {
                    if (err) {
                      res.send(err);
                    } else {
                      res.send("File created successfully");
                    }
                  });
              }
            }
          );
          //})
          // .catch((e) => {
          //   res.send(e.message);
          // });
        });
      }
    });
  } catch (err) {
    console.log(err);
    console.log("HELLO");
  }
});
s;
