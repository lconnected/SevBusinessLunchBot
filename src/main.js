import http from 'http';
import events from 'events';
import log from 'winston';
import botClient from './BotClient/botClient';
import messageHistory from './BotClient/messageHistory';

const port = 8079;
const updateInterval = 7000;
const emitter = new events.EventEmitter();

botClient.authBot()
  .then(function(response) {
    let data = response.data;
    if (data.ok == true) {
      console.log('Bot authorized');
      emitter.emit('successStartup');
    } else {
      emitter.emit('failedStartup');
    }
  })
  .catch(function(error) {
    console.error(error);
    emitter.emit('failedStartup');
  });

emitter.on('successStartup', function() {
  // upServer();
  updateLoop();
});

emitter.on('failedStartup', function() {
  console.error('Application failed to startup');
});

function upServer() {
  http.createServer(function (req, res) {
    if (req.method == 'GET' && req.url == '/') {
      res.write('Hello');
    }
    else {
      res.write('Page not found');
      res.statusCode = 404;
    }
    res.end();
  }).listen(port);
  console.log('Http server started at port ' + port);
}

function updateLoop(offset = messageHistory.getLastUpdateId()) {
  log.info(`Initial update offset is ${offset}`);
  botClient.getUpdates(offset)
    .then(response => { 
      offset = botClient.handleUpdate(response);
      log.info(`Updates received, last update_id: ${offset}`);
      if (offset !== 0) {
        offset++;
      }
      updateLoop(offset);
    })
    .catch(error => {
      log.error(error);
      updateLoop(offset);
    })
}
