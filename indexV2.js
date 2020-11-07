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
          userName: 'peter',
          password: process.env.SQL_Password
      }
  },
  options: {
      database: 'Urk-Farma',
      validateBulkLoadParameters: true
  }
};
function mail_me(err) {
  console.error(err);
}

var connection = new Connection(config);

connection.connect(function(err) {
  if (err) {
    mail_me('----- Got a connection error \n\n', err);
}});

function requestDone(rowCount, more) {
  console.log(rowCount + ' rows requestDone');
}

app.get('/api/urk/top', async (req, res) => {
    var columnp = '[';
    let limit = 0
    res.header('Access-Control-Allow-Origin','*');
    function statementComplete(err, rowCount) {
      if (err) {
        console.log('Statement failed: ' + err);
        res.status(500).send('------ Statement failed try again ------ \n\n'+err+"\n");
      } else {
        console.log(rowCount + ' rows statementComplete');
         res.header('Access-Control-Allow-Origin','*');
         res.status(200).send(columnp.slice(0, -1)+']');
      }
    }
    if (req.query.limit) {
        limit = parseInt(req.query.limit);
    } else {
        limit = 30;
    }
    request = new Request("SELECT TOP "+limit+" Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar,\"Foto Nr\" From [dbo].[Beeldbank Urk];", function(err, rowCount) {
      if (err) {
        console.error(err);
        res.status(500).send('------ Statement failed try again ------ \n\n'+err+"\n");
      } else {
         console.log("Send "+rowCount+" Rows.");
         res.status(200).send(columnp.slice(0, -1)+']');
      }
    });


    request.on('row', function(columns) {
        columnp += JSON.stringify(columns).replace("[","").replace("]", ",");
    });
    request.on('done', requestDone);
    connection.execSql(request);

})

app.get('/api/urk/name', async (req, res) => {
          var columnp = '[';

          request = new Request("SELECT TOP 30 Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar,\"Foto Nr\" From [dbo].[Beeldbank Urk] WHERE Omschrijving LIKE %@Name%;", statementComplete)
          if (req.query.name) {
            request.addParameter('Name', TYPES.NVarChar, req.query.name);
          } else {
            res.status(400).send("vul een naam in alsutublieft");
          }
          request.on('row', function(columns) {
              columnp += JSON.stringify(columns).replace("[","").replace("]", ",");
          });
          request.on('done', requestDone);
          connection.execSql(request);
          function statementComplete(err, rowCount) {
            if (err) {
              console.error(err);
              res.status(500).send('----- Statement failed try again ----- \n\n'+err+"\n");
            } else {
              console.log(rowCount + ' rows statementComplete');
               res.header('Access-Control-Allow-Origin','*');
               res.status(200).send(columnp.slice(0, -1)+']');
            }
          }
})
app.get('/api/urk/change/', async (req, res) => {
          var columnp = '[';
          request = new Request("INSERT Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar,\"Foto Nr\" From [dbo].[Beeldbank Urk]", statementComplete)
          request.addParameter('qr', TYPES.VarChar, req.url.split('=')[1]);
          request.on('row', function(columns) {
              columnp += JSON.stringify(columns).replace("[","").replace("]", ",");
          });
          request.on('done', requestDone);
          connection.execSql(request);
          function statementComplete(err, rowCount) {
            if (err) {
              console.log('Statement failed: ' + err);
              res.status(500).send('----- Statement failed try again ----- \n\n', err);
            } else {
              console.log(rowCount + ' rows statementComplete');
               res.header('Access-Control-Allow-Origin','*');
               res.status(200).send(columnp.slice(0, -1)+']');
            }
          }
})

app.get('/api/urk/test/', async (req, res) => {
  request = new Request(
      'SELECT TOP 30 @name FROM From [dbo].[Beeldbank Urk];',
      function(err, rowCount, rows) {
      if (err) {
          console.error(err);
      } else {
          console.log(rowCount + ' row(s)');
          console.log(rows);
      }
      });
  request.addParameter('name', TYPES.VarChar, "Plank");


  connection.execSql(request);
})

app.get('/api/urk/add/row', async (req, res) => {
          var columnp = '[';
          let body = req.body
          request = new Request("INSERT TOP 30 Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar,\"Foto Nr\" From [dbo].[Beeldbank Urk] WHERE Omschrijving LIKE %@qr%;", statementComplete)
          request.addParameter('qr', TYPES.VarChar, req.url.split('=')[1]);
          request.on('row', function(columns) {
              columnp += JSON.stringify(columns).replace("[","").replace("]", ",");
          });
          request.on('done', requestDone);
          connection.execSql(request);
          function statementComplete(err, rowCount) {
            if (err) {
              console.log('Statement failed: ' + err);
              res.status(500).send('----- Statement failed try again ----- \n\n', err);
            } else {
              console.log(rowCount + ' rows statementComplete');
               res.header('Access-Control-Allow-Origin','*');
               res.status(200).send(columnp.slice(0, -1)+']');
            }
          }
})
app.get('/api/urk/version', (req, res) => { res.status(200).send("{\"version\": 2.0}") })
app.get('/api/urk/status', (req, res) => { res.status(200).send("OK i guess.") })
app.listen(process.env.PORT, () => {
  console.log(`urk api listening at http://localhost:${process.env.PORT}`)
})
