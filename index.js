var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
const express = require('express')


const app = express()

app.get('/', async (req, res) => {


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
         // If no error, then good to go...
         executeStatement();
       }
     );
     connection.on('connect', function(err) {
        if (err) {
          if (String(err).includes("sp_set_firewall_rule")) {
            const fetch = require('node-fetch');
            let body = {
                  	"properties.endIpAddress": String(err).split("by the login. Client with IP address ")[1].split(" is not allowed to access the server.  To enable access")[0],
                  	"properties.startIpAddress": String(err).split("by the login. Client with IP address ")[1].split(" is not allowed to access the server.  To enable access")[0]
                  }
            fetch(' https://management.azure.com/subscriptions/df5a3c67-2434-41ed-9e99-c8305e8c717f/resourceGroups/Urk-Frama/providers/Microsoft.Sql/servers/Urk-farma/firewallRules/Heroku_new_ip?api-version=2014-04-01', {
              method: 'PUT',
              body:    JSON.stringify(body),
              headers: { 'Content-Type': 'application/json' , 'Authorization' : "Bearer "+process.env.Azure_Bearen_token},
            })
            res.status(500).send("try again with the ip "+String(err).split("by the login. Client with IP address ")[1].split(" is not allowed to access the server.  To enable access")[0]);
          } else {
               console.error('----- Got a connection error ', err,' -------');
                res.status(500).send('----- Got a connection error \n\n', err);
          }
        } else {
           console.log('Connected');
        }
     })

     connection.on('debug', function(text) {
         //console.log(text);
       }
     );

     function executeStatement() {
       request = new Request("select TOP 30 Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar,\"Foto Nr\" From [dbo].[Beeldbank Urk];", function(err, rowCount, data) {
         if (err) {
           console.log(err);
         } else {
           console.log(rowCount + ' rows');
           complete(data)

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
         /*
         console.log(final_json.length);
         console.log("\n-- Begin newline--\n");
         let lenst = final_json.length/10;
         for (var i = 0; i < parseInt(lenst); i++) {
            console.log("lents i "+i);
            console.log(parseInt(lenst));
            */
            var array_array = [];
            var array_json = [];
            function intin() {
              it++;
              //array_array.push(array_json);
              /*
              if (it == final_json.length) {
                console.log("last");
                console.log(array_array);
                console.log("["+String(array_array).replace("',","")+"]");
              //  res.status(200).send("["+String(array_array).replace("',","")+"]");
                return String(array_array).replace("',","");
              }
              */

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

           //console.log(sdata.replace(nes,"").replace(',[{','{"').replace('},]',"}]").replace('[,{','[{"'))
           var resing =  fn()//.then(array_arrays => res.status(200).send("["+array_arrays+"]")).catch(err => res.status(500).send("er ging iets mis in het script \n"+err)+console.error(err) );
          // res.status(200).send(sdata.replace(nes,"").replace(',[{','{"').replace('},]',"}]").replace('[,{','[{"'))
          //res.status(200).send(resing)

           console.log("\n--- Send The Data ---")
         }

      request.on('done', complete);


       // In SQL Server 2000 you may need: connection.execSqlBatch(request);
       connection.execSql(request);
   }



})

app.listen(process.env.PORT)
