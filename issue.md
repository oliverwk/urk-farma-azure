# RequestError: Incorrect syntax near '@limit'.

I'm using the tedious modules to preform two simple query's: `SELECT TOP @limit * From [dbo].[Beeldbank Urk];`and `"SELECT TOP @limit * From [dbo].[Beeldbank Urk] WHERE Omschrijving LIKE %@Name%;`.
In [The code ](https://gist.github.com/oliverwk/19d1f2bd2f8cb253db5015d705ae090d)i used the request.addParameter function to safely add untrusted content to the query but it's giving me this error about `incorrect syntax near @` which is weird because i copied the code straight from [The documentation.](https://tediousjs.github.io/tedious/parameters.html)

```
[LOG] Api listening at http://localhost:8080
[ERROR] RequestError: Incorrect syntax near '@limit'.
    at Parser.<anonymous> (/Users/MWK/Desktop/urk-farma-azure/node_modules/tedious/lib/connection.js:1153:27)
    at Parser.emit (node:events:327:20)
    at Parser.<anonymous> (/Users/MWK/Desktop/urk-farma-azure/node_modules/tedious/lib/token/token-stream-parser.js:35:14)
    at Parser.emit (node:events:327:20)
    at addChunk (/Users/MWK/Desktop/urk-farma-azure/node_modules/readable-stream/lib/_stream_readable.js:298:12)
    at readableAddChunk (/Users/MWK/Desktop/urk-farma-azure/node_modules/readable-stream/lib/_stream_readable.js:280:11)
    at Parser.Readable.push (/Users/MWK/Desktop/urk-farma-azure/node_modules/readable-stream/lib/_stream_readable.js:241:10)
    at Parser.Transform.push (/Users/MWK/Desktop/urk-farma-azure/node_modules/readable-stream/lib/_stream_transform.js:139:32)
    at doneParsing (/Users/MWK/Desktop/urk-farma-azure/node_modules/tedious/lib/token/stream-parser.js:122:14)
    at /Users/MWK/Desktop/urk-farma-azure/node_modules/tedious/lib/token/infoerror-token-parser.js:48:5 {
  code: 'EREQUEST',
  number: 102,
  state: 1,
  class: 15,
  serverName: 'my-database',
  procName: '',
  lineNumber: 1
}
```
### Versions
macOS: Catalina 10.15.6
node: v15.1.0,
npm: 7.0.8
tedious: ^9.2.1

 [All my code :grinning:](https://gist.github.com/oliverwk/19d1f2bd2f8cb253db5015d705ae090d)
