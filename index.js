var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const bodyParser = require('body-parser');
const express = require('express');
const crypto = require('crypto');
const encoder = new TextEncoder();
var data = [];
const app = express()
app.use(bodyParser.json());
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

		 var connection = new Connection(config);
		 function mail_me(err) {
				// FIXME: Hier nog mail toevoegen als hij namelijk hier error geeft dan is er iets mis met de server zelf of de sql server connection string a.k.a password
			 console.error('----- Got a connection error \n\n',err);
			 process.exit(1)
		 }
		 connection.connect(function(err) {
			 if (err) {
				 console.error('----- Got a connection error \n\n', err);
			 } else {
				 console.log('Connected');
		 }
	 });

// WARNING: Dit is nog niet af moet nog categorieDB toevoegen en keys updat met iets client side
app.post('/api/urk/update', async (req, res) => {
	console.log("Got a reqeust at: "+new Date().toString());
	res.header('Access-Control-Allow-Origin','*');
  res.header('X-Powered-By', "Me ;)")
  res.header('access-control-expose-headers', "*")
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
							// Dit is voor nieuwe records
							 console.log( "INSERT INTO "+categorieDB+" (Omschrijving, Locatie, Plank, Categorie, GPK, Inhoud, Producent, Eigenaar, FotoNr) VALUES ("+om+", "+lo+", "+pl+", "+ca+", "+gp+",  "+inh+",  "+pr+", "+ei+", "+fo+");");
							 sql_qeury += "INSERT INTO "+categorieDB+" (Omschrijving, Locatie, Plank, Categorie, GPK, Inhoud, Producent, Eigenaar, FotoNr) VALUES ("+om+", "+lo+", "+pl+", "+ca+", "+gp+",  "+inh+",  "+pr+", "+ei+", "+fo+");";
							 i = keys.length + 1;
							 let addIt = true;
							 console.log(addIt);
					 }
				 }

			} else {
				// Dit is voor muteren
				console.log(" UPDATE "+categorieDB+" SET "+Object.keys(item)[1]+" =  "+om+" , "+Object.keys(item)[2]+" =  "+lo+" , "+Object.keys(item)[3]+" =  "+pl+" , "+Object.keys(item)[4]+" =   "+ca+" , "+Object.keys(item)[5]+" =  "+gp+" , "+Object.keys(item)[6]+" =  "+inh+" , "+Object.keys(item)[7]+" =  "+pr+" , "+Object.keys(item)[8]+" =  "+ei+" , FotoNr =  "+fo+" WHERE Id = '"+item.Id+"' ;");
				sql_qeury += " UPDATE "+categorieDB+" SET "+Object.keys(item)[1]+" =  "+om+" , "+Object.keys(item)[2]+" =  "+lo+" , "+Object.keys(item)[3]+" =  "+pl+" , "+Object.keys(item)[4]+" =  "+ca+" , "+Object.keys(item)[5]+" =  "+gp+" , "+Object.keys(item)[6]+" =  "+inh+" , "+Object.keys(item)[7]+" =  "+pr+" , "+Object.keys(item)[8]+" =  "+ei+" , FotoNr =  "+fo+" WHERE Id = '"+item.Id+"' ;";
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
	request = new Request(sql_qeury, function(err, rowCount, data) {
	 if (err) {
		 console.log(err);
	 } else {
		 res.header('rowCount', rowCount);
		 console.log(rowCount + ' rows');
		 complete(data);
	 }
	});
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
			 console.log("Got a reqeust at: "+new Date().toString());
			 // FIXME: cors misschien nog beter maken
			 res.header('Access-Control-Allow-Origin','*');
			 res.header('X-Powered-By', "Me ;)")
 			 res.header('access-control-expose-headers', "*")
			 res.header('Content-Type','application/json');
			 count = 0
			 let limit = 30;
			 let vanaf = 0;
			 let categorieDB = "";
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
						console.log(req.query.limit);
						limit = parseInt(req.query.limit);
			 } else {
						res.header('x-warning',"Didn't enter a limit we will just use 50.");
						console.log("[LOG] Didn't enter a limit we will just use 50.");
						limit = 50;
			 }
			 if (req.query.vanaf) {
						console.log(req.query.vanaf);
						vanaf = parseInt(req.query.vanaf);
			 } else {
						console.log("[LOG] Didn't enter a vanaf we will just use 0.");
						vanaf = 0;
			 }

//       request = new Request("set @limit = "+parseInt(req.query.limit)+" SELECT TOP (@limit) Id,Locatie,Plank,Categorie,Omschrijving,GPK,Inhoud,Producent,Eigenaar, FotoNr FROM [dbo].[Objecten];", function(err, rowCount, data) {
			 // 						dit between is hier zo dat je pagina's kan toevoegen later
			 let lqs = "SELECT * FROM "+categorieDB+" WHERE Id BETWEEN ("+vanaf+") AND  ("+limit+");";
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
				 function complete(data, rowCount) {
					 console.log("\x1b[32m"+request.parameters[0].value+"\x1b[0m");
					 //Legt het heel goed uit
					 console.log("complete, alles van sql server is binnen en de req.on(row) function is dus ook klaar en nu stuur ik dit: ");

					 // to veriy on client side res.header('x-SHA256-base64', crypto.subtle.digest('SHA-256', data));
					 let parData =  JSON.stringify(String(data)+"]", null, 4);
					 //const hash = crypto.createHash('sha256').update(parData);
					 const hash = crypto.createHash('sha256').update(parData).digest('hex');
					 res.header('SHA256-Base64', Buffer.from(hash).toString('base64'));
					 //res.header('SHA256-Base64', Buffer.from(crypto.createHash('sha256').update(parData)).toString('base64')); //.update(Buffer.from(parData, 'utf-8')));
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

			 connection.execSql(request);
	 });

app.get('/api/urk/name', async (req, res) => {
				res.header('Access-Control-Allow-Origin','*');
				res.header('X-Powered-By', "Me ;)")
				res.header('access-control-expose-headers', "*")
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
				 let lqs = "SELECT TOP ("+limit+") * FROM "+categorieDB+" WHERE ["+categorie+"] LIKE '%"+name+"%';";
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

			 function complete(data, rowCount) {
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

app.get('/api/urk/version', (req, res) => { res.status(200).send("{\"version\": 3.0}") })
app.get('/api/urk/status', (req, res) => { res.status(200).send("{\"status\": 200, \"time\" : "+new Date().toString()+"}") })
//process.env.PORT is voor azure nodig
app.listen(process.env.PORT, () => {
	console.log(`Urk API listening at http://localhost:${process.env.PORT}`)
})
