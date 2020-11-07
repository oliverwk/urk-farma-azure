var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const express = require('express')
var fs = require('fs');

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

     connection.connect(function(err) {
       if (err) {
         mail_me('----- Got a connection error \n\n', err);
     }});

     connection.on('connect', function(err) {
        if (err) {
               console.error('----- Got a connection error ', err,' -------');
                res.status(500).send('----- Got a connection error \n\n', err);
        } else {
           console.log('Connected');
        }
     });

app.get('/api/urk/top', async (req, res) => {
       count = 0
       request = new Request("SELECT TOP 30 Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar,\"Foto Nr\" From [dbo].[Beeldbank Urk];", function(err, rowCount, data) {
         if (err) {
           console.log(err);
         } else {
           console.log(rowCount + ' rows');
           complete(data);
         }

         connection.close();
       });
       var data = [];
       data.push("[")

       async function fon() {
           data.push("]");
           let sdata = String(data).replace("']',","]").replace("'[',","[")
           let nes = '\"'
           var final_jsons = sdata.replace(nes,"").replace(',[{','{"').replace('},]',"}]").replace('[,{','[{"');
           console.log(final_jsons);
           var final_json = JSON.parse(final_jsons);
            var array_array = [];
            var array_json = [];
            function intin() {
              it++;
              console.log(it);
            }

            for (var it = 0; it < final_json.length; intin()) {
                if (it % 9 == 0) {
                  console.log("niew array_json");
                  console.log(JSON.stringify(final_json[it]));
                    array_json.push(JSON.stringify(final_json[it]));
                    array_json.push("},{")
                    array_array.push(array_json);
                    var array_json = [];
                    console.log("cleared json");
                    if (it == final_json.length) {
                      console.log("last");
                      console.log(array_array);
                      console.log("["+String(array_array).replace("',","")+"]");
                      res.status(200).send(String(array_array).replace("',","")+"]");
                    }
                } else {
                  console.log(final_json[it]);
                  array_json.push(JSON.stringify(final_json[it]).replace("{","").replace("}",""));
                  }
                  if (it == final_json.length) {
                    console.log("last");
                    console.log(array_array);
                    console.log("["+String(array_array).replace("',","")+"]");
                  }
                }
            console.log("\n--END newline--\n");
     }
     async function fn() {

       data.push("]");
       let sdata = String(data).replace("']',","]").replace("'[',","[")
       let nes = '\"'
       var final_jsons = sdata.replace(nes,"").replace(',[{','{"').replace('},]',"}]").replace('[,{','[{"').replace("\n","");
       console.log(final_jsons);
       var final_json = JSON.parse(final_jsons);
       let y = []
       console.log(final_json.length);
       for (var i = 0; i < parseInt(final_json.length/10); i++) {
           console.log("getting "+parseInt(i*10) + " through ", i*10+10);
           console.log(final_json.slice(i*10,  i*10+10));
           let whydo = final_json.slice(i*10, i*10+10);
           y.push(whydo);
       }
       res.header('Access-Control-Allow-Origin','*');
       res.status(200).send(y)
       return y;
     }
       request.on('row', function(columns) {
            console.log(JSON.stringify(columns[0].value), JSON.stringify(columns[0].metadata.colName));
            console.log(JSON.stringify(columns.length));
          //data.push('{"'+column.metadata.colName+'":"'+column.value+'"}');
         columns.forEach(function(column) {
             if (column.value === null) {
               console.log('NULL');
               data.push('{"'+column.metadata.colName+'":"null"}');
             } else {
               console.log('{"'+column.metadata.colName+'":"'+column.value+'"}');
              data.push('{"'+column.metadata.colName+'":"'+column.value+'"}');
              }
           count =+ 1
         });
       });
        function complete(rowCount, more) {
           console.log("--- Sending Data ---\n");
           let nes = '\"'
           var resing =  fn()
           console.log(count);
           console.log("\n--- Send The Data ---")
         }

      //request.on('done', complete);


       // In SQL Server 2000 you may need: connection.execSqlBatch(request);
       connection.execSql(request);
   });

app.get('/api/urk/name', async (req, res) => {
       let url = req.url;
       let qeury = url.split('=')[1];
       request = new Request("SELECT Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar,\"Foto Nr\" FROM [dbo].[Beeldbank Urk] WHERE Omschrijving LIKE %"+qeury+"% ;",function(err, rowCount, data) {
         if (err) {//SELECT * FROM [dbo].[Beeldbank Urk] WHERE id LIKE 340;
           console.log(err);
         } else {
           console.log(rowCount + ' rows');
           complete(data)
         }
         connection.close();
       });
       request.addParameter('qr', TYPES.VarChar, qeury);
       var data = [];
       data.push("[")

       async function fon() {
         data.push("]");
         let sdata = String(data).replace("']',","]").replace("'[',","[")
         let nes = '\"'
         var final_jsons = sdata.replace(nes,"").replace(',[{','{"').replace('},]',"}]").replace('[,{','[{"');
         console.log(final_jsons);
         var final_json = JSON.parse(final_jsons);
            var array_array = [];
            var array_json = [];
            function intin() {
              it++;


              console.log(it);
            }

            for (var it = 0; it < final_json.length; intin()) {
                if (it % 9 == 0) {
                  console.log("niew array_json");
                  console.log(JSON.stringify(final_json[it]));
                    array_json.push(JSON.stringify(final_json[it]));
                    array_json.push("},{")
                    array_array.push(array_json);
                    var array_json = [];
                    console.log("cleared json");
                    if (it == final_json.length) {
                      console.log("last");
                      console.log(array_array);
                      console.log("["+String(array_array).replace("',","")+"]");
                      res.status(200).send(String(array_array).replace("',","")+"]");
                    //  let array_arrays = array_array.replace("',","");
                    //  return String(array_array).replace("',","");
                    }
                } else {
                  console.log(final_json[it]);
                  array_json.push(JSON.stringify(final_json[it]).replace("{","").replace("}",""));
                  }
                  if (it == final_json.length) {
                    console.log("last");
                    console.log(array_array);
                    console.log("["+String(array_array).replace("',","")+"]");
                  //  res.status(200).send("["+String(array_array).replace("',","")+"]");
                  //  let array_arrays = array_array.replace("',","");
                  //  return String(array_array).replace("',","");
                  }
                }


            //  }
            console.log("\n--END newline--\n");
        //  return String(array_array).replace("'","");
     }
     async function fn() {
       data.push("]");
       let sdata = String(data).replace("']',","]").replace("'[',","[")
       let nes = '\"'
       var final_jsons = sdata.replace(nes,"").replace(',[{','{"').replace('},]',"}]").replace('[,{','[{"');
       console.log(final_jsons);
       var final_json = JSON.parse(final_jsons);
       let y = []
       console.log(final_json.length);
       for (var i = 0; i < parseInt(final_json.length/10); i++) {
           console.log("getting "+parseInt(i*10) + " through ", i*10+10);
           console.log(final_json.slice(i*10,  i*10+10));
           let whydo = final_json.slice(i*10, i*10+10)
           y.push(whydo)
       }
       console.log("\n\n"+y);

       res.header('Access-Control-Allow-Origin','*');
       res.status(200).send(y)
       return y;
     }
       count = 0
       request.on('row', function(columns) {
         columns.forEach(function(column) {
             if (column.value === null) {
               console.log('NULL');
               data.push('{"'+column.metadata.colName+'":"null"}');
             } else {
               console.log('{"'+column.metadata.colName+'":"'+column.value+'"}');
               //data.push('{"'+column.metadata.colName+'":"'+column.value+'"}');
              data.push('{"'+column.metadata.colName+'":"'+column.value+'"}');
            //   data.push(column.value)
            //   data.push(column.metadata.colName)
              }
           count =+ 1
         });
       });
        function complete(rowCount, more) {
           console.log("--- Sending Data ---\n");
           let nes = '\"'
           var resing =  fn()
           console.log("\n--- Send The Data ---")
         }

      request.on('done', complete);


       // In SQL Server 2000 you may need: connection.execSqlBatch(request);
       connection.execSql(request);

})
app.listen(process.env.PORT, () => {
  console.log(`Urk API listening at http://localhost:${process.env.PORT}`)
})
