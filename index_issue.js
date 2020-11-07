var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const express = require('express')
const app = express()
var config = {
  server: process.env.SQL_server,
  authentication: {
      type: 'default',
      options: {
          userName: process.env.SQL_USER,
          password: process.env.SQL_Password
      }
  },
  options: {
      database: process.env.SQL_database_azure,
      validateBulkLoadParameters: true
  }
};


var connection = new Connection(config);

connection.connect(connected);
function connected(err) {
  if (err) {
    process.stdout.write("[ERROR] ");
    console.error(err);
  }
}
function requestDone(rowCount, more) {
  console.log(rowCount + ' rows requestDone');
}

app.get('/api/top', async (req, res) => {
    var columnp = '[';
    function statementComplete(err, rowCount) {
      if (err) {
        process.stdout.write("[ERROR] ");
        console.error(err);
        res.status(500).send('------ Statement failed try again ------ \n\n'+err+"\n");
      } else {
        console.log(rowCount + ' rows statementComplete');
         res.header('Access-Control-Allow-Origin','*');
         res.status(200).send(columnp.slice(0, -1)+']');
      }
    }
    request = new Request("SELECT TOP @limit * From [dbo].[Beeldbank Urk];", statementComplete);

    if (req.query.limit) {
      request.addParameter('limit', TYPES.Int, parseInt(req.query.limit));
    } else {
     console.log("[LOG] Didn't enter a limit just use 30.");
     request.addParameter('limit', TYPES.Int, 30);
    }
    request.on('row', function(columns) {
        columnp += JSON.stringify(columns).replace("[","").replace("]", ",");
    });
    request.on('done', requestDone);
    connection.execSql(request);

})

app.get('/api/name', async (req, res) => {
          var columnp = '[';
          request = new Request("SELECT TOP 30 * From [dbo].[Beeldbank Urk] WHERE Omschrijving LIKE %@Name%;", statementComplete)
          if (req.query.name) {
            request.addParameter('Name', TYPES.NVarChar, req.query.name);
          } else {
            res.status(400).send("Please enter a name");
            console.log("[LOG] Didn't enter a name.");
          }
          request.on('row', function(columns) {
              columnp += JSON.stringify(columns).replace("[","").replace("]", ",");
          });
          request.on('done', requestDone);
          connection.execSql(request);
          function statementComplete(err, rowCount) {
            if (err) {
	      process.stdout.write("[ERROR] ");
   	      console.error(err);
              res.status(500).send('----- Statement failed try again ----- \n\n'+err+"\n");
            } else {
              console.log(rowCount + ' rows statementComplete');
               res.header('Access-Control-Allow-Origin','*');
               res.status(200).send(columnp.slice(0, -1)+']');
            }
          }
})

app.listen(process.env.PORT, () => {
  console.log(`[LOG] API listening at http://localhost:${process.env.PORT}`)
})

