var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser')

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/api/captains', function (request, response) {
   fs.readFile( __dirname + "/data/captains.json", 'utf8', function (error, data) {
       response.end(data);
   });
});

app.post('/api/addCaptain', function (request, response) {
  var database;
  fs.readFile( __dirname + "/data/captains.json", 'utf8', function (err, data) {
      console.log("data: " + JSON.parse(data))
      database = JSON.parse(data);
      database.captains.push(request.body)

      fs.writeFile(__dirname + "/data/captains.json", JSON.stringify(database), function(error) {
        if(error) {
            response.end("There was a problem writing the data.")
        }
        response.end(JSON.stringify(database));
      });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
