/**
 * A Bot for Slack!
 */


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


var config = require("./config");

if (config.CLIENT_ID && config.CLIENT_SECRET && config.PORT) {
  var app = require('./lib/apps');
  var controller = app.configure(config.PORT, config.CLIENT_ID,
    config.CLIENT_SECRET, {
      json_file_store: './db_slack_bot_a/'
    }, onInstallation);
} else {
  console.error(
    'Error: Please specify CLIENT_ID, CLIENT_SECRET, and PORT in the configuration file'
  );
  process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
});

controller.hears('hello', 'direct_message', function (bot, message) {
  bot.reply(message, 'Hello!');
});


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
