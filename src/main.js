import 'babel-polyfill';
import http from 'http';
import axios from 'axios';
import events from 'events';
import log from 'winston';
import botClient from './BotClient/botClient';

const port = process.env.PORT || 8079;
const pingInterval = 90000; // in millis
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
  upServer();
  updateLoop();
  // self ping job
  setInterval(async function() {
    let aliveRequest = axios.get(`http://127.0.0.1:${port}/alive`)
        .then(function(response) {
          log.info(response.data);
        })
        .catch(function(error) {
          log.error(error);
        });
    await aliveRequest;
  }, pingInterval);
});

emitter.on('failedStartup', function() {
  console.error('Application failed to startup');
});

function upServer() {
  http.createServer(function (req, res) {
    if (req.method == 'GET' && req.url == '/') {
      res.write('Hello from <a href="https://t.me/SevBusinessLunchBot">SevBusinessLunchBot</a>');
    } else if (req.method == 'GET' && req.url == '/alive') {
      res.write('bot is alive');
    } else {
      res.write('Page not found');
      res.statusCode = 404;
    }
    res.end();
  }).listen(port);
  console.log('Http server started at port ' + port);
}

/**
 * Loops the update request via long polling
 * @param {integer} offset 
 */
function updateLoop(offset = 0) {
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
