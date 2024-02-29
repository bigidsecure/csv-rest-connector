const app = require('express')();
var bodyParser = require('body-parser')
app.use(bodyParser.json());
require('./api-routes')(app);

const port = 8000;

app.listen(port, function() {
  console.log(`running from: ${process.cwd()}`);
  console.log(`listening on port ${port}`);
});
