var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
var https = require('https');
var helmet = require('helmet')
var cors = require('cors')
const crypto = require('crypto').webcrypto;



var data = [];
const app = express()
app.use(bodyParser.text({ type: "*/*" }));
app.use(helmet());
app.use(cors());
var config = {
			 server: process.env.SQL_server,
			 authentication: {
			 	type: 'default',
					options: {
						userName: process.env.SQL_User,
						password: process.env.SQL_Password
					 }
			 },
			 options: {
					 encrypt: true,
					 database: 'Urk-farma',
					 validateBulkLoadParameters: true
			 }
		 };
     var connection;
		 connection = new Connection(config);
		 function mail_me(err) {
				// FIXME: Hier nog mail toevoegen als hij namelijk hier error geeft dan is er iets mis met de server zelf of de sql server connection string a.k.a password
			 console.error('----- Got a connection error -----\n\n', err);
			 process.exit(1)
		 }

		 connection.on('error', err => {
			    console.log('There is an error\n');
					console.log(err);
					if (String(err).includes("ConnectionError")) {
						connection = new Connection(config);
					} else {
						setTimeout(() => {
		         // When NodeJS exits
		         process.on("exit", function () {

		             require("child_process").spawn(process.argv.shift(), process.argv, {
		                 cwd: process.cwd(),
		                 detached : true,
		                 stdio: "inherit"
		             });
		         });
		         process.exit();
     			}, 1000);
					}
			});
		 connection.connect(err => {
			 if (err) {
				 console.error('----- Got a connection error -----\n\n', err);
				 // FIXME: mail_me(err);
			 } else {
				 console.log('Connected to the database');
				 //process.env.PORT is voor azure nodig
         const privateKey = fs.readFileSync('./tls/privkey.pem', 'utf8');
         const certificate = fs.readFileSync('./tls/1chain.pem', 'utf8');
         const ca = fs.readFileSync('./tls/2chain.pem', 'utf8');
          const options = {
            key: privateKey,
            cert: certificate,
            ca: ca
          };
         var server = https.createServer(options, app).listen(process.env.PORT,() => {
           console.log(`Urk API listening at https://urk.wittopkoning.nl:${process.env.PORT}`);
         });
			 }
			});


app.post('/api/urk/update', async (req, res) => {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("Got a reqeust at: "+new Date().toString()+" From: "+ip);
  res.header('access-control-expose-headers', "*")
	res.header('Cache-Control', "no-store");
	res.header('Content-Type','application/json');
	let categorieDB = "";
				 if (req.query.categorieDB) {
						if (String(req.query.categorieDB) === "objecten") {
							categorieDB = "[dbo].[Objecten]";
							console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Objecten].");
						} else if (String(req.query.categorieDB) === "boeken") {
							categorieDB = "[dbo].[Boeken]";
							console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Boeken].");
				 }
				} else {
					//categorieDB = "[dbo].[Objecten]";
					res.header('x-error',' Didn\'t enter a categorie');
		 		  res.sendStatus(400);
					console.log("[WARNING] Didn't enter a categorie.");
				}
	var sql_qeury = "";
	let ikeys = "";
	const prod_null = "-";
	console.log("Got body: ", req.body);
		if (!!req.body) {
			 JSON.parse(req.body).forEach((item, i) => {
			 console.log(item);
			 if (item.Id === 0) {
				 			console.log("Zero, checking it and then adding to the database.");
				 			let keys =  Object.keys(item);
							ikeys = "";
							 //Dit is voor de key van de json
							for (var titem of Object.keys(item)) {
								console.log("key", titem);
                if (titem == "Id") {
                   console.log("Is id")
                } else {
									titem.includes(" ") ? ikeys += "'"+titem+"', "   : ikeys += titem+", "
                }
							}
							ikeys = ikeys.trim().replace(/.$/,"");

							 vals = "";
               var nns;
				 			 for (var tkey of Object.keys(item)) {
				 					 nns = item[tkey] == "" || item[tkey] == null || item[tkey] == prod_null ? null : "'"+item[tkey]+"'";
                   console.log("tkey: "+tkey, "value: "+item[tkey]+" nns: "+nns);
                  if (tkey == "Id") {
                     console.log("Is id")
                  } else {
                    vals += nns+", ";
                  }
				 			 }
							 vals = vals.trim().replace(/.$/,"");
							 console.log( "INSERT INTO "+categorieDB+" ("+ikeys+") VALUES ("+vals+");");
							 sql_qeury += "INSERT INTO "+categorieDB+" ("+ikeys+") VALUES ("+vals+");";
			} else {
				// Dit is voor Muteren
				vaels = "";
				for (var titem of Object.keys(item)) {
					var nn = item[titem] == null || item[titem] === prod_null ? null : "'"+item[titem]+"'";
					if (titem.includes(" ")) {return}
					titem == "Id" ? console.log("Is id:", item[titem]) : vaels += titem+" = "+nn+" , ";
				}
				 vaels = vaels.trim().replace(/.$/,"");

				//console.log("UPDATE "+categorieDB+" SET "+vaels+" WHERE Id = '"+item.Id+"' ;");
				sql_qeury +="UPDATE "+categorieDB+" SET "+vaels+" WHERE Id = '"+item.Id+"' ;";
			}
		 });
	 } else {
		 res.header('x-error','No body');
		 res.sendStatus(400);
		 return false;
	 }
	console.log(sql_qeury);
	data = [];
	il = 0;
	let first = true;
	if (sql_qeury == "") {
		 res.header('rowCount', 1);
     complete(JSON.stringify(data));
	} else {
		request = new Request(sql_qeury, function(err, rowCount, data) {
		 if (err) {
			 console.log(err);
		 } else {
			 res.header('rowCount', rowCount);
			 console.log(rowCount + ' rows');
			 complete(JSON.stringify(data));
		 }
		});
	}
	request.on('row', function(columns) {
		// QUESTION: Waarom is dit hier als het goed is return dit niets
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
			 var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		   console.log("Got a reqeust at: "+new Date().toString()+" from: "+ip);
			 // FIXME: cors misschien nog beter maken
 			 res.header('access-control-expose-headers', "*")
			 res.header('Cache-Control', "no-store");
			 res.header('Content-Type','application/json');
			 count = 0
			 let limit = 30;
			 let vanaf = 0;
			 let categorieDB = "";
			 let sortby;
			 let sorteerrichting;
			 if (req.query.sorteer && req.query.sorteerrichting) {
				 sortby = req.query.sorteer;
				 sorteerrichting = req.query.sorteerrichting;
				 console.log(`Sorteren door ${sortby} in de richting ${sorteerrichting}`);
			 } else {
				 sortby = "Id";
				 sorteerrichting = "ASC";
				 console.log("Je hoeft niet te sorteren");
			 }
			 if (req.query.categorieDB) {
					if (String(req.query.categorieDB).toUpperCase() === "objecten".toUpperCase()) {
						categorieDB = "[dbo].[Objecten]";
						console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Objecten].");
					} else if (String(req.query.categorieDB).toUpperCase() === "boeken".toUpperCase()) {
						categorieDB = "[dbo].[Boeken]";
						console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Boeken].");
			 }
			} else {
				categorieDB = "[dbo].[Objecten]";
				res.header('x-warning',' Didn\'t enter a categorie we will just use Objecten');
				console.log("[WARNING] Didn't enter a categorie we will just use Objecten.");
			}
			 if (req.query.limit) {
						console.log("Maximimaal:", req.query.limit);
						limit = parseInt(req.query.limit);
			 } else {
						res.header('x-warning',"Didn't enter a limit we will just use 50.");
						console.log("[LOG] Didn't enter a limit we will just use 50.");
						limit = 50;
			 }
			 if (req.query.vanaf) {
						console.log("Vanaf: ",req.query.vanaf);
						vanaf = parseInt(req.query.vanaf);
			 } else {
						console.log("[LOG] Didn't enter a vanaf we will just use 0.");
						vanaf = 0;
			 }

//       request = new Request("set @limit = "+parseInt(req.query.limit)+" SELECT TOP (@limit) Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar, FotoNr FROM [dbo].[Objecten];", function(err, rowCount, data) {
			 // 						dit between is hier zo dat je pagina's kan toevoegen later
			 let lqs = `SELECT * FROM ${categorieDB} WHERE Id BETWEEN (${vanaf}) AND  (${limit}) ORDER BY ${sortby} ${sorteerrichting};`;
			 console.log(lqs);
			 request = new Request(lqs, function(err, rowCount, data) {
				 if (err) {
					 console.log(err);
				 } else {
					 res.header('rowCount', rowCount);
					 console.log(rowCount, 'rows');
					 complete(data, rowCount);
				 }
			 });

			 data = [];
			 il = 0;
			 let first = true;
			 //Dit is voor het omzetten naar een json array
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
			 async function digest(data, algorithm = 'SHA-512') {
			   const ec = new TextEncoder();
			   const digest = await crypto.subtle.digest(algorithm, ec.encode(data));
			   return digest;
			 }
				async function complete(Data, rowCount) {
					  console.log("\x1b[32m"+request.parameters[0].value+"\x1b[0m");
					  //Legt het heel goed uit
					  console.log("complete, alles van sql server is binnen en de req.on(row) function is dus ook klaar en nu stuur ik dit: ");
						let tmp = JSON.parse(String(data)+"]")
					  let parData =  JSON.stringify(tmp, null, 4);
						let ll = await digest(parData);
			 			const bhash = Buffer.from(ll).toString('base64');
						console.log("Base64", bhash);
						res.header('SHA512-Base64', bhash);
						if (0 >= parseInt(rowCount)) {
 						 console.log("[]");
 						 res.status(404).send("[]");
 						 console.log("Send a response at: "+new Date().toString());
 					 } else {
 						 res.status(200).send(String(data)+"]");
 						 console.log("Send a response at: "+new Date().toString());
 					 }
				 }

			 connection.execSql(request);
	 });

app.get('/api/urk/name', async (req, res) => {
				var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			        console.log("Got a reqeust at: "+new Date().toString()+" From: "+ip);
				res.header('access-control-expose-headers', "*");
				res.header('Cache-Control', "no-store");
				res.header('Content-Type','application/json');
				console.log("The qeury: "+req.query.name);
				let name = "";
				let categorie = "";
				if (req.query.name) {
					 name = req.query.name;
				 } else {
					 name = "";
					 res.header('x-warning',"Didn't enter a name.");
					 console.log("[WARNING] Didn't enter a name.");
				 }
				 let limit = 50;
				 let categorieDB = "";
				 //req.query.categorie bestaat
				 if (req.query.categorieDB) {
						if (String(req.query.categorieDB).toUpperCase() === "objecten".toUpperCase() ) {
							categorieDB = "[dbo].[Objecten]";
							console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Objecten].");
						} else if (String(req.query.categorieDB).toUpperCase() === "boeken".toUpperCase()) {
							categorieDB = "[dbo].[Boeken]";
							console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Boeken].");
					 }
					 //req.query.categorie bestaat niet
				} else {
					categorieDB = "[dbo].[Objecten]";
					res.header('x-warning',' Didn\'t enter a categorie we will just use Objecten');
					console.log("[LOG] Didn't enter a categorie we will just use Objecten.");
				}
				 if (req.query.limit) {
							console.log(req.query.limit);
							limit = parseInt(req.query.limit);
				 } else {
							res.header('x-warning',"Didn't enter a limit we will just use 50.");
							console.log("[WARNING] Didn't enter a limit we will just use 50.");
				 }

				 if (req.query.categorie) {
					 categorie = req.query.categorie;
				 } else {
					 categorie = "Omschrijving";
					 res.header('x-warning',"Didn't enter a collum so where using Omschrijving.");
					 console.log("[WARNING] Didn't enter a collum.");
				 }

	//       request = new Request("set @limit = "+parseInt(req.query.limit)+" SELECT TOP (@limit) Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar, FotoNr FROM [dbo].[Objecten];", function(err, rowCount, data) {
				 // doe die ander zodat er geen string escape kan let lqs = "SELECT TOP ("+limit+") * FROM "+categorieDB+" WHERE ["+categorie+"] LIKE '%"+name+"%';";
				 let lqs = `SELECT TOP (${limit}) * FROM ${categorieDB} WHERE [${categorie}] LIKE '%${name}%';`;
				 console.log(lqs);
				 request = new Request(lqs, function(err, rowCount, data) {
				 if (err) {
					 console.log(err);
				 } else {
					 res.header('rowCount', rowCount);
					 console.log(rowCount + ' rows');
					 complete(data, rowCount);
				 }
			 });
			 data = [];
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

			 function complete(Data, rowCount) {
					 console.log("complete, alles van sql server is binnen en de .on(row) function is dus ook klaar, data: \n");
					 if (0 >= parseInt(rowCount)) {
						 console.log("[]");
						 //Nothing found
						 res.status(404).send("[]");
						 console.log("Send a response at: "+new Date().toString());
					 } else {
						 console.log(String(data)+"]");
						 res.status(200).send(String(data)+"]");
						 console.log("Send a response at: "+new Date().toString());
					 }
				 }

			 connection.execSql(request, req.query.name);
});

app.get('/api/urk/version', (req, res) => { res.status(200).send("{\"version\": 3.3.2}") })
app.get('/api/urk/status', (req, res) => { res.status(200).send("{\"status\": 200, \"time\" : "+new Date().toString()+"}") })
