/**
 * A Bot for Slack!
 */

let Botkit = require('botkit');

let _bots = {};

/**
 * Define a function for initiating a conversation on installation
 */

function onInstallation(bot, installer) {
  if (installer) {
    bot.startPrivateConversation({
      user: installer
    }, function (err, convo) {
      if (err) {
        console.log(err);
      } else {
        convo.say('I am a bot that has just joined your team');
        convo.say(
          'You must now /invite me to a channel so that I can be of use!'
        );
      }
    });
  }
}


const config = require("./config");
const botkit_config = {
  json_file_store: './db_slack_bot_a/'
};

if (!config.CLIENT_ID || !config.CLIENT_SECRET || !config.PORT) {
  console.error(
    'Error: Please specify CLIENT_ID, CLIENT_SECRET, and PORT in config.js');
  process.exit(1);
}

let controller = Botkit.slackbot(botkit_config).configureSlackApp({
  clientId: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
  scopes: ['bot'], //TODO it would be good to move this out a level, so it can be configured at the root level
});

controller.setupWebserver(config.PORT, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver, function (
    err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

controller.on('create_bot', function (bot, config) {
  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function (err) {
      if (err) {
        console.log(err);
        process.exit(1);
      }

      _bots[bot.config.token] = bot;

      if (onInstallation)
        onInstallation(bot, config.createdBy);
    });
  }
});

controller.storage.teams.all(function (err, teams) {
  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (let t in teams) {
    if (teams[t].bot) {
      let bot = controller.spawn(teams[t]).startRTM(function (err) {
        if (err) {
          console.log('Error connecting bot to Slack:', err);
        } else {
          _bots[bot.config.token] = bot;
        }
      });
    }
  }
});


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', (bot) => console.log('** The RTM api just connected!'));
controller.on('rtm_close', (bot) => console.log('** The RTM api just closed'));


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', (bot, message) => bot.reply(message,
  "I'm here!"));
controller.hears('hello', 'direct_message', (bot, message) => bot.reply(message,
  'Hello!'));


/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
//controller.on('direct_message,mention,direct_mention', function (bot, message) {
//    bot.api.reactions.add({
//        timestamp: message.ts,
//        channel: message.channel,
//        name: 'robot_face',
//    }, function (err) {
//        if (err) {
//            console.log(err)
//        }
//        bot.reply(message, 'I heard you loud and clear boss.');
//    });
//});
