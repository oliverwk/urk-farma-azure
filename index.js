let express    = require('express');
let https      = require('https');
let helmet     = require('helmet');
let cors 		   = require('cors');
let bodyParser = require('body-parser');
let fs 			   = require('fs');
let crypto     = require('crypto').webcrypto;
let knex       = require('knex')({
  client: 'mssql',
  connection: {
		host : process.env.SQL_server,
	  user : process.env.SQL_User,
	  password : process.env.SQL_Password,
	  database : 'Urk-farma'
  }
});

async function digest(data, algorithm = 'SHA-512') {
	const ec = new TextEncoder();
	const digest = await crypto.subtle.digest(algorithm, ec.encode(data));
	return digest;
}

let data = [];
const app = express()
app.use(helmet.contentSecurityPolicy({
    directives: {
			"defaultSrc": ["'self'", "www.wittopkoning.nl", "wittopkoning.nl"],
      "script-src": ["'self'", "'unsafe-inline'"],
			"style-src" : ["'self'", "'unsafe-inline'"],
			"img-src"   : ["'self'", "www.wittopkoning.nl"],
			"font-src"  : ["'self'", "www.wittopkoning.nl"],
    },
  })
);
app.use(cors());
app.use(bodyParser.text({ type: "*/*" }));

app.get('/api/urk/top', async (req, res) => {
		   console.log("Got a reqeust at: "+new Date().toString());
 			 res.header('access-control-expose-headers', "*")
			 res.header('Cache-Control', "no-store");
			 res.header('Content-Type','application/json');
			 let limit;
			 let vanaf;
			 let sortby;
			 let categorieDB;
 		 	 let sorteerrichting;
			 if (req.query.categorieDB) {
					if (String(req.query.categorieDB).toUpperCase() === "objecten".toUpperCase()) {
						categorieDB = "[dbo].[Objecten]";
						console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Objecten].");
					} else if (String(req.query.categorieDB).toUpperCase() === "boeken".toUpperCase()) {
						categorieDB = "[dbo].[Boeken]";
						console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Boeken].");
			   } else {
	 				categorieDB = "[dbo].[Objecten]";
	 				res.header('x-warning',' Didn\'t enter a categorie we will just use Objecten');
	 				console.log("[WARNING] Didn't enter a categorie we will just use Objecten.");
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
						console.log("Vanaf:",req.query.vanaf);
						vanaf = parseInt(req.query.vanaf);
			 } else {
						console.log("[LOG] Didn't enter a vanaf we will just use 0.");
						vanaf = 0;
			 }
				if (req.query.sorteer && req.query.sorteerrichting) {
								sortby = req.query.sorteer;
								sorteerrichting = req.query.sorteerrichting;
								console.log(`Sorteren door ${sortby} in de richting ${sorteerrichting}`);
				} else {
								sortby = "Id";
								sorteerrichting = "ASC";
								console.log("Je hoeft niet te sorteren");
				}

			 let lqs = await knex.select('*').from(categorieDB).whereBetween('Id', [vanaf, limit]).orderBy(sortby, sorteerrichting);
			 res.header('rowCount', lqs.length);
			 console.log(lqs.length, 'rows');
			 complete(lqs, lqs.length);


				async function complete(cData, rowCount) {
					  console.log(`\x1b[32mSELECT * FROM ${categorieDB} WHERE Id BETWEEN (${vanaf}) AND (${limit}) ORDER BY ${sortby} ${sorteerrichting};\x1b[0m`);
					  console.log("Complete, alles van sql server is binnen.");
					  let parData =  JSON.stringify(cData, null, 4);
						let ll = await digest(parData);
			 			const bhash = Buffer.from(ll).toString('base64');
						console.log("Base64", bhash);
						res.header('SHA512-Base64', bhash);
						if (0 >= parseInt(rowCount)) {
 						 console.log("[]");
 						 res.status(404).send("[]");
 						 console.log("Send a response at: "+new Date().toString());
 					 } else {
 						 res.status(200).send(cData);
 						 console.log("Send a response at: "+new Date().toString());
 					 }
				 }
	 });

app.get('/api/urk/name', async (req, res) => {
				console.log("Got a reqeust at: "+new Date().toString());
				res.header('access-control-expose-headers', "*");
				res.header('Cache-Control', "no-store");
				res.header('Content-Type','application/json');
				console.log("The qeury: "+req.query.name);
				let name;
				let categorie;
				let limit;
				let categorieDB;
				if (req.query.name) {
					 name = req.query.name;
				 } else {
					 name = "";
					 res.header('x-error',"Didn't enter a name.");
					 console.log("[ERROR] Didn't enter a name.");
					 res.sendStatus(400);
				 }
				 //req.query.categorie bestaat
				 if (req.query.categorieDB) {
						if (String(req.query.categorieDB).toUpperCase() === "objecten".toUpperCase() ) {
							categorieDB = "[dbo].[Objecten]";
							console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Objecten].");
						} else if (String(req.query.categorieDB).toUpperCase() === "boeken".toUpperCase()) {
							categorieDB = "[dbo].[Boeken]";
							console.log("[LOG] The entered categorie is Boeken so we will use [dbo].[Boeken].");
					 } else {
						 categorieDB = "[dbo].[Objecten]";
 						 res.header('x-warning',' Didn\'t enter a right categorie we will just use Objecten');
 						 console.log("[LOG] Didn't enter a categorie we will just use Objecten.");
					 }
					 //req.query.categorie bestaat niet
				} else {
					categorieDB = "[dbo].[Objecten]";
					res.header('x-warning',' Didn\'t enter a categorie we will just use Objecten');
					console.log("[LOG] Didn't enter a categorie we will just use Objecten.");
				}
				 if (req.query.limit) {
							console.log("Limit:", req.query.limit);
							limit = parseInt(req.query.limit);
				 } else {
							res.header('x-warning',"Didn't enter a limit we will just use 50.");
							console.log("[WARNING] Didn't enter a limit we will just use 50.");
							limit = 50;
				 }
				 if (req.query.categorie) {
					 categorie = req.query.categorie;
				 } else {
					 categorie = "Omschrijving";
					 res.header('x-warning',"Didn't enter a collum so where using Omschrijving.");
					 console.log("[WARNING] Didn't enter a collum.");
				 }
				 if (req.query.sorteer && req.query.sorteerrichting) {
	 								sortby = req.query.sorteer;
	 								sorteerrichting = req.query.sorteerrichting;
	 								console.log(`Sorteren door ${sortby} in de richting ${sorteerrichting}`);
	 				} else {
	 								sortby = "Id";
	 								sorteerrichting = "ASC";
	 								console.log("Je hoeft niet te sorteren");
	 				}

				 let lqs = await knex.select('*').from(categorieDB).whereRaw("? LIKE \'%??%\'", [categorie, name]).orderBy(sortby, sorteerrichting).limit(limit);
				 res.header('rowCount', lqs.length);
				 console.log(lqs.length, 'rows');
				 complete(lqs, lqs.length);

			 async function complete(cData, rowCount) {
				 console.log(`\x1b[32mSELECT TOP (${limit}) * FROM ${categorieDB} WHERE ${categorie} LIKE '%[${name}]%' ORDER BY [${sortby}] ${sorteerrichting};\x1b[0m`);
				 console.log("complete, alles van sql server is binnen");
				 let parData = JSON.stringify(cData, null, 4);
				 let ll = await digest(parData);
				 const bhash = Buffer.from(ll).toString('base64');
				 console.log("Base64", bhash);
				 res.header('SHA512-Base64', bhash);
				 if (0 >= parseInt(rowCount)) {
						 console.log("[]");
						 //Nothing found
						 res.status(404).send("[]");
						 console.log("Send a response at: "+new Date().toString());
				 } else {
						 console.log(cData);
						 res.status(200).send(cData);
						 console.log("Send a response at: "+new Date().toString());
					}
				 }
});

app.post('/api/urk/update', async (req, res) => {
	console.log("Got a reqeust at:", new Date().toString());
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
	let sql_qeury = "";
	let ikeys = "";
	const prod_null = "-";
	try {
		let jbody = JSON.parse(req.body);
	} catch (e) {
		console.log("No body or not good");
		res.header('x-error',' Didn\'t have a body');
		res.sendStatus(400);
	}
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
               let nns;
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
							 console.log( `INSERT INTO ${categorieDB} (${ikeys}) VALUES (${vals});`);
							 sql_qeury += `INSERT INTO ${categorieDB} (${ikeys}) VALUES (${vals});` ;
			} else {
				// Dit is voor Muteren
				vaels = "";
				for (var titem of Object.keys(item)) {
					var nn = item[titem] == null || item[titem] === prod_null ? null : "'"+item[titem]+"'";
					if (titem.includes(" ")) {res.sendStatus(400)}
					titem == "Id" ? console.log("Is id:", item[titem]) : vaels += titem+" = "+nn+" , ";
				}
				 vaels = vaels.trim().replace(/.$/,"");

				//console.log(`UPDATE ${categorieDB} SET ${vaels} WHERE Id = '${item.Id}';`);
				sql_qeury += `UPDATE ${categorieDB} SET ${vaels} WHERE Id = '${item.Id}';`;
			}
		 });
	 } else {
		 res.header('x-error','No body');
		 res.sendStatus(400);
		 return false;
	 }
	console.log(sql_qeury);
	let resualt = await knex.raw(sql_qeury);
	console.log(resualt);
	res.header('rowCount', 0);
	console.log("complete, de sql server is geupdate.");
	console.log("Send the response at: "+new Date().toString());
	res.sendStatus(200);
});
app.get('/', (req, res) => {
    fs.readFile('index.html',(err, data) => {
        res.status(200).send(data.toString());
    });
});

app.get('/api/urk/version', (req, res) => { res.status(200).send("{\"version\": 4.4}") })
app.get('/api/urk/status', (req, res) => { res.status(200).send("{\"status\": 200, \"time\" : \""+new Date().toString()+"\" }") })
const privateKey = fs.readFileSync('./tls/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./tls/cert.pem', 'utf8');
const ca = fs.readFileSync('./tls/ca.pem', 'utf8');
 const options = {
	 key: privateKey,
	 cert: certificate,
	 ca: ca
 };

let server = https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`Urk Farma API listening at https://urk.wittopkoning.nl:${process.env.PORT}`);
});
