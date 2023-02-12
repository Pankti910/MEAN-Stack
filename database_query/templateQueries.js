const con = require("../config/db_config");

function templateAdd(templateData, htmlData) {
  try {
    con.connect((err) => {
      if (err) {
        throw err;
      } else {
        var query = `INSERT INTO templates (template_id,template_data,html_data) VALUES(NULL,${
          "'" + templateData + "'"
        },${"'" + htmlData + "'"})`;
        // "INSERT INTO templates (template_id,template_data,html_data) VALUES(NULL," +
        // eval("`" + templateData + "`") +
        // ',"HTML DATA")';
        con.query(query, (err, data) => {
          if (err) console.error(err);
          else console.log("added");
        });
      }
    });
  } catch (err) {
    console.log(err);
    // add insert query to add in error_log
  }
}

module.exports = { templateAdd };
