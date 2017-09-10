var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser')
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(client) {
  fs.readFile( __dirname + "/data/captains.json", 'utf8', function (error, data) {
      client.emit("refreshCaptains", data);
  });
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())

app.set('port', 4200);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index');
});

io.on('get/captains', function(client) {
   fs.readFile( __dirname + "/data/captains.json", 'utf8', function (error, data) {
       client.emit("refreshCaptains", data);
   });
});

app.put('/api/addCaptain', function (request, response) {
  var database;
  fs.readFile( __dirname + "/data/captains.json", 'utf8', function (err, data) {
      database = JSON.parse(data);
      database.captains.push(request.body);
      writeAndEmit(database)
      response.end()
  });
});

app.post('/api/shuffleCaptains', function (request, response) {
  fs.readFile( __dirname + "/data/captains.json", 'utf8', function (error, data) {
      var database = JSON.parse(data)
      database = shuffle(database)
      writeAndEmit(database)
      response.end()
  });
})

app.delete('/api/deleteCaptain', function (request, response) {
  fs.readFile( __dirname + "/data/captains.json", 'utf8', function (error, data) {
      var database = JSON.parse(data);
      database = deleteCaptain(database, request.body.id)
      writeAndEmit(database)
      response.end()
  });
});

app.delete('/api/deleteAllCaptains', function (request, response) {
  fs.readFile( __dirname + "/data/captains.json", 'utf8', function (error, data) {
      var database = JSON.parse(data);
      database.captains = []
      writeAndEmit(database)
      response.end()
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

server.listen(5000);

function writeAndEmit(database) {
  fs.writeFile(__dirname + "/data/captains.json", JSON.stringify(database), function(error) {
    io.emit("refreshCaptains", JSON.stringify(database))
  });
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(database) {
  var currentIndex = database.captains.length
  var temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = database.captains[currentIndex];
    database.captains[currentIndex] = database.captains[randomIndex];
    database.captains[randomIndex] = temporaryValue;
  }
  return database;
}

function deleteCaptain(database, id) {
  var captainToDelete = -1;
  for(const captain of database.captains) {
    if (captain.id == id) {
      captainToDelete = database.captains.indexOf(captain);
      break;
    }
  }
  if(captainToDelete > -1) {
    database.captains.splice(captainToDelete, 1);
  }
  return database
}
