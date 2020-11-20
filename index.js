var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const bodyParser = require('body-parser');
const express = require('express')

const app = express()
app.use(bodyParser.json());
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
           encrypt: true,
           database: 'Urk-farma',
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


app.post('/api/urk/update', async (req, res) => {
  console.log("Got a reqeust at: "+new Date().toString());
  res.header('Access-Control-Allow-Origin','*');
  res.header('Content-Type','application/json');
  var sql_qeury = "";
  const prod_null = "Geen opgegeven.";
  const inhoud_null ="Niets opgegeven.";
  const GPK_null = "Niets";
  console.log("Got body: ", req.body);
    if (!!req.body) {
       req.body.forEach((item, i) => {
       console.log(item);
       let inh = item.inhoud != inhoud_null ? "'"+item.inhoud+"'" : null;
       let gp = item.GPK != GPK_null ? "'"+item.GPK+"'" : null;
       let pr = item.producent != prod_null ? "'"+item.producent+"'" : null;
       let fo = item.FotoNR != GPK_null ? item.FotoNR : null;
       let om = item.Omschrijving != null ? "'"+item.Omschrijving+"'" : null;
       let lo = item.Locatie != null ? "'"+item.Locatie+"'" : null;
       let pl = item.plank != null ? "'"+item.plank+"'" : null;
       let ca = item.categorie != null ? "'"+item.categorie+"'" : null;
       let ei = item.Eigenaar != null ? "'"+item.Eigenaar+"'" : null;
       if (item.Id === 0) {
         console.log("Zero, doing nothing, besides checking and then adding to the database.");
         const keys = ["Omschrijving", "Locatie", "plank", "categorie", "GPK", "inhoud", "producent", "eigenaar", "FotoNR"]
         for (var i = 0; i < keys.length; i++) {
           let key = keys[i];
           if (item[key] === null) {
               console.log(item[key]+", is null.");
           } else {
               console.log(item[key]+", isn't null, so we shut add this row to the database");
               console.log( "INSERT INTO [dbo].[Beeldbank Urk] (Omschrijving, Locatie, Plank, Categorie, GPK, Inhoud, Producent, Eigenaar, FotoNr) VALUES ("+om+", "+lo+", "+pl+", "+ca+", "+gp+",  "+inh+",  "+pr+", "+ei+", "+fo+");");
               sql_qeury += "INSERT INTO [dbo].[Beeldbank Urk] (Omschrijving, Locatie, Plank, Categorie, GPK, Inhoud, Producent, Eigenaar, FotoNr) VALUES ("+om+", "+lo+", "+pl+", "+ca+", "+gp+",  "+inh+",  "+pr+", "+ei+", "+fo+");";
               i = keys.length + 1;
               let addIt = true;
               console.log(addIt);
           }
         }

      } else {
        console.log(" UPDATE [dbo].[Beeldbank Urk] SET "+Object.keys(item)[1]+" =  "+om+" , "+Object.keys(item)[2]+" =  "+lo+" , "+Object.keys(item)[3]+" =  "+pl+" , "+Object.keys(item)[4]+" =   "+ca+" , "+Object.keys(item)[5]+" =  "+gp+" , "+Object.keys(item)[6]+" =  "+inh+" , "+Object.keys(item)[7]+" =  "+pr+" , "+Object.keys(item)[8]+" =  "+ei+" , FotoNr =  "+fo+" WHERE Id = '"+item.Id+"' ;");
        sql_qeury += " UPDATE [dbo].[Beeldbank Urk] SET "+Object.keys(item)[1]+" =  "+om+" , "+Object.keys(item)[2]+" =  "+lo+" , "+Object.keys(item)[3]+" =  "+pl+" , "+Object.keys(item)[4]+" =  "+ca+" , "+Object.keys(item)[5]+" =  "+gp+" , "+Object.keys(item)[6]+" =  "+inh+" , "+Object.keys(item)[7]+" =  "+pr+" , "+Object.keys(item)[8]+" =  "+ei+" , FotoNr =  "+fo+" WHERE Id = '"+item.Id+"' ;";
      }
     });
   } else {
     res.sendStatus(400);
     return false;
   }
  console.log(sql_qeury);
  var data = [];
  il = 0;
  let first = true;
  request = new Request(sql_qeury, function(err, rowCount, data) {
   if (err) {
     console.log(err);
   } else {
     console.log(rowCount + ' rows');
     complete(data);
   }
  });
  request.on('row', function(columns) {
       for (var i = 0; i < columns.length; i++) {
         if (first) {
           data[il] = "";
           console.log('[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
           data[il] = '[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
           first = false;
         } else {
          if (columns[i].value === null) {
            if (JSON.stringify(columns[i].metadata.colName) == '"Id"') {
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
           if (JSON.stringify(columns[i].metadata) == '"Id"') {
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
      console.log("complete, de sql server is geupdate. ");
      console.log("Send the response at: "+new Date().toString());
      res.sendStatus(200);
    }

  connection.execSql(request);
});

app.get('/api/urk/top', async (req, res) => {
       console.log("Got a reqeust at: "+new Date().toString());
       res.header('Access-Control-Allow-Origin','*');
       res.header('Content-Type','application/json');
       count = 0
       let limit = 30;
        if (req.query.limit) {
            console.log(req.query.limit);
            limit = parseInt(req.query.limit);
       } else {
            console.log("[LOG] Didn't enter a limit we will just use 30.");
       }
       request = new Request("SELECT TOP ("+limit+") Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar,FotoNr FROM [dbo].[Beeldbank Urk];", function(err, rowCount, data) {
           if (err) {
               console.log(err);
           } else {
                console.log(rowCount + ' rows');
                complete(data);
           }
      });

       //request = new Request("set @limit = "+parseInt(req.query.limit)+" SELECT TOP (@limit) Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar, FotoNr FROM [dbo].[Beeldbank Urk];", function(err, rowCount, data) {
       //request = new Request("SELECT TOP "+limit+" * FROM "+categorieDB+";", function(err, rowCount, data) {

       var data = [];
       il = 0;
       let first = true;
       request.on('row', function(columns) {
            for (var i = 0; i < columns.length; i++) {
              if (first) {
                data[il] = "";
                console.log('[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
                data[il] = '[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
                first = false;
              } else {
               if (columns[i].value === null) {
                 if (JSON.stringify(columns[i].metadata.colName) == '"Id"') {
                   data[il] = data[il].substring(0, data[il].length - 2)+ '}';
                   il++;
                   console.log('{"'+columns[i].metadata.colName+'": null');
                   data[il] = '{"'+columns[i].metadata.colName+'": null ';
                 } else if (JSON.stringify(columns[i].metadata.colName) == '"FotoNr"') {
                     console.log(',"'+columns[i].metadata.colName+'": null }');
                     data[il] += ',"'+columns[i].metadata.colName+'": null }';
                 } else {
                   console.log(',"'+columns[i].metadata.colName+'": null');
                    data[il] += ',"'+columns[i].metadata.colName+'": null';
                 }
              } else {
                if (JSON.stringify(columns[i].metadata.colName) == '"Id"') {
                  il++;
                  data[il] = "";
                  console.log('{"'+columns[i].metadata.colName+'": '+columns[i].value+'');
                  data[il] =  '{"'+columns[i].metadata.colName+'": '+columns[i].value+'';
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
           console.log("\x1b[32m"+request.parameters[0].value+"\x1b[0m");
           console.log("complete, alles van sql server is binnen en de .on(row) function is dus ook klaar en nu stuur ik dit: ");
           console.log(String(data)+"]");
	         console.log("Send a response at: "+new Date().toString());
           res.status(200).send(String(data)+"]");
         }

       connection.execSql(request);
   });

app.get('/api/urk/name', async (req, res) => {
  // TODO: add categorie func
        console.log("The qeury: "+req.query.name);
        let name = "";
        let categorie = "";
        if (req.query.name) {
           name = req.query.name;
         } else {
           name = "";
           console.log("[LOG] Didn't enter a name.");
         }
         if (req.query.categorie) {
           categorie = req.query.categorie;
         } else {
           categorie = "Omschrijving";
           console.log("[LOG] Didn't enter a categorie.");
         }
         console.log(name);
       request = new Request("SELECT TOP 30 Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar, FotoNr FROM [dbo].[Beeldbank Urk] WHERE "+categorie+" LIKE '%"+name+"%';", function(err, rowCount, data) {
         if (err) {
           console.log(err);
         } else {
           console.log(rowCount + ' rows');
           complete(data);
         }
       });
       var data = [];
       var empty = [];
       il = 0;
       let first = true;
       request.on('row', function(columns) {
            for (var i = 0; i < columns.length; i++) {
              if (first) {
                data[il] = "";
                console.log('[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"');
                data[il] = '[{"'+columns[i].metadata.colName+'":"'+columns[i].value+'"';
                first = false;
              } else {
               if (columns[i].value === null) {
                 if (JSON.stringify(columns[i].metadata.colName) == '"Id"') {
                   data[il] = data[il].substring(0, data[il].length - 2)+ '}';
                   il++;
                   console.log('},{"'+columns[i].metadata.colName+'": null');
                   data[il] = '},{"'+columns[i].metadata.colName+'": null ';
                 } else if (JSON.stringify(columns[i].metadata.colName) == '"FotoNr"') {
                     console.log(',"'+columns[i].metadata.colName+'": null }');
                     data[il] += ',"'+columns[i].metadata.colName+'": null }';
                 } else {
                   console.log(',"'+columns[i].metadata.colName+'": null');
                    data[il] += ',"'+columns[i].metadata.colName+'": null';
                 }
              } else {
                if (JSON.stringify(columns[i].metadata.colName) == '"Id"') {
                  il++;
                  data[il] = "";
                  console.log('},{"'+columns[i].metadata.colName+'": '+columns[i].value+'');
                  data[il] = '{"'+columns[i].metadata.colName+'":'+columns[i].value+'';
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
           console.log("complete, alles van sql server is binnen en de .on(row) function is dus ook klaar, data: \n");

           res.header('Access-Control-Allow-Origin','*');
           res.header('Content-Type','application/json');
           if (data === empty) {
             console.log("[ ]");
             res.status(200).send("[ ]");
           } else {
             console.log(String(data)+"]");
             res.status(200).send(String(data)+"]");
           }
         }

       connection.execSql(request, req.query.name);
})

app.get('/api/urk/version', (req, res) => { res.status(200).send("{\"version\": 2.0}") })
app.get('/api/urk/status', (req, res) => { res.status(200).send("{\"status\": 200}") })
app.listen(process.env.PORT, () => {
  console.log(`Urk API listening at http://localhost:${process.env.PORT}`)
})
