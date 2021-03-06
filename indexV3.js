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
               userName: 'peter', // update me
               password: process.env.SQL_Password // update me
           }
       },
       options: {
           database: 'Urk-Farma',
           validateBulkLoadParameters: true
       }
     };

     var connection = new Connection(config);
     function mail_me(err) {
       console.error('----- Got a connection error \n\n',err);
       process.exit(1)
     }
     connection.connect(function(err) {
       if (err) {
         mail_me('----- Got a connection error \n\n', err);
     } else {
        console.log('Connected');
     }});


app.get('/api/urk/top', async (req, res) => {
       count = 0
       request = new Request("SELECT TOP 30 Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar, FotoNr From [dbo].[Beeldbank Urk];", function(err, rowCount, data) {
         if (err) {
           console.log(err);
         } else {
           console.log(rowCount + ' rows');
           complete(data);
         }
       });

       var data = [];
       il = 0;
       let first = true;
       const id = '{"userType":0,"flags":16,"type":{"id":56,"type":"INT4","name":"Int"},"colName":"Id"}';
       request.on('row', function(columns) {
            for (var i = 0; i < columns.length; i++) {
              if (first) {
                data[il] = "";
                console.log('[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
                data[il] = '[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
                first = false;
              } else {
               if (columns[i].value === null) {
                 if (JSON.stringify(columns[i].metadata) == id) {
                   data[il] = data[il].substring(0, data[il].length - 2)+ '}';
                   il++;
                   console.log('},{"'+columns[i].metadata.colName+'":"null"');
                   data[il] = '},{"'+columns[i].metadata.colName+'":"null"';
                 } else if (JSON.stringify(columns[i].metadata.colName) == '"FotoNr"') {
                     console.log(',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"}');
                     data[il] += ',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"}';
                 } else {
                   console.log(',"'+columns[i].metadata.colName+'":"null"');
                    data[il] += ',"'+columns[i].metadata.colName+'":"null"';
                 }
              } else {
                if (JSON.stringify(columns[i].metadata) == id) {
                  il++;
                  data[il] = "";
                  console.log('},{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
                  data[il] = '{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
                } else if (JSON.stringify(columns[i].metadata.colName) == '"FotoNr"') {
                    console.log(',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"}');
                    data[il] += ',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"}';
                } else {
                  console.log(',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
                  data[il] += ',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
                }
               }
            }
          }
       });

        function complete(rowCount, more) {
           console.log("complete, alles van sql server is binnen en de .on(row) function is dus ook klaar en nu stuur ik dit: ");
           console.log(String(data)+"]");
           res.header('Access-Control-Allow-Origin','*');
           res.header('Content-Type','application/json');
           res.status(200).send(String(data)+"]");
         }

       connection.execSql(request);
   });

app.get('/api/urk/name', async (req, res) => {
        console.log("The qeury: "+req.query.name);
        let qeury = "";
        if (req.query.name) {
          console.log("true");
          qeury = req.query.name;
        } else {
          qeury = "";
          res.status(400).send('{"error":"vul een naam in alsutublieft"}');
        }
       request = new Request("SELECT TOP 30 Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar, FotoNr From [dbo].[Beeldbank Urk] WHERE Omschrijving LIKE '%{}%';".replace("{}", qeury), function(err, rowCount, data) {
         if (err) {
           console.log(err);
         } else {
           console.log(rowCount + ' rows');
           complete(data);
         }
       });
       //request.addParameter('qr', TYPES.VarChar, qeury);
       var data = [];
       il = 0;
       let first = true;
       const id = '{"userType":0,"flags":16,"type":{"id":56,"type":"INT4","name":"Int"},"colName":"Id"}';
       request.on('row', function(columns) {
            for (var i = 0; i < columns.length; i++) {
              if (first) {
                data[il] = "";
                console.log('[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
                data[il] = '[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
                first = false;
              } else {
               if (columns[i].value === null) {
                 if (JSON.stringify(columns[i].metadata) == id) {
                   data[il] = data[il].substring(0, data[il].length - 2)+ '}';
                   il++;
                   console.log('},{"'+columns[i].metadata.colName+'":"null"');
                   data[il] = '},{"'+columns[i].metadata.colName+'":"null"';
                 } else if (JSON.stringify(columns[i].metadata.colName) == '"FotoNr"') {
                    
                     console.log(',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"}');
                     data[il] += ',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"}';
                 } else {
                   console.log(',"'+columns[i].metadata.colName+'":"null"');
                    data[il] += ',"'+columns[i].metadata.colName+'":"null"';
                 }
              } else {
                if (JSON.stringify(columns[i].metadata) == id) {
                  il++;
                  data[il] = "";
                  console.log('},{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
                  data[il] = '{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
                } else if (JSON.stringify(columns[i].metadata.colName) == '"FotoNr"') {
                    console.log(',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"}');
                    data[il] += ',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"}';
                } else {
                  console.log(',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
                  data[il] += ',"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
                }
               }
            }
          }
       });

        function complete(rowCount, more) {
           console.log("complete, alles van sql server is binnen en de .on(row) function is dus ook klaar en nu stuur ik dit: ");
           console.log(String(data)+"]");
           res.header('Access-Control-Allow-Origin','*');
           res.header('Content-Type','application/json');
           res.status(200).send(String(data)+"]");
         }

       connection.execSql(request);
})

app.get('/api/urk/version', (req, res) => { res.status(200).send("{\"version\": 2.0}") })
app.get('/api/urk/status', (req, res) => { res.status(200).send("{\"status\": 200}") })
app.listen(process.env.PORT, () => {
  console.log(`Urk API listening at http://localhost:${process.env.PORT}`)
})
