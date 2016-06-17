/* eslint no-console: 0 */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();
var login = require("facebook-chat-api");
var user = 'nikolaj.sn@hotmail.com';
var pass = 'niko123';
var rest = require('rest');
var body_old = "";




app.use(require('./api/routes'));


app.listen(port, '0.0.0.0', function onStart(err) {

	if (err) {

		console.log(err);

	}

	console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);

});


	login({email: user, password: pass}, function callback (err, api) {
	    if(err) return console.error(err);
	 	api.setOptions({selfListen: true})
	    api.setOptions({listenEvents: true});
	 
	    var stopListening = api.listen(function(err, event) {
	        if(err) return console.error(err);
	        switch(event.type) {
	          case "message":
	            if(event.body === '/stop') {
	              api.sendMessage("Goodbye...", event.threadID);
	              return stopListening();
	            }
	            /*api.markAsRead(event.threadID, function(err) {
	              if(err) console.log(err);
	            });*/

	            api.getUserInfo(event.senderID, function(err, ret) {
	            	var msgfrom = ret.name;
	            	var text = event.body;
	            	if(body_old != event.body){
	            		console.log(event.body);
		            	if(/*false && event.isGroup === false && */event.body){
			            	rest('https://rest.nexmo.com/sms/json?api_key=ca3b160a&api_secret=163d5267370a63c0&from='+ msgfrom +'&to=4530135097&text=' + text).then(function(response) {
						    	console.log('response: ', response);
							});
		            	}
	            	}
	            	body_old = event.body;
	            });

	            //api.sendMessage("TEST BOT: " + event.body, event.threadID);
	            break;
	          case "event":
	            console.log('event: ' + event);
	            break;
	        }
	    });
	});
