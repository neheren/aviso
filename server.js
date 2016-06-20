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
var request = require('request');
var _ = require('lodash');
var body_old = "";
var phonenumber = 4524402011;

var facebookfriends;



function sendSMS(sendFrom, body){
	request.post({
		url:'https://rest.messagebird.com/messages', 
		headers: {
			Authorization: 'AccessKey live_GOk9sY00eDQ1xC9N0Bx44kg2w'
		},
		form: {
			recipients: phonenumber,
			originator: sendFrom,
			body: body
		}
	},
	function(err,httpResponse,body){ 
		if(err){console.log(err)}
		console.log(httpResponse);
		console.log(body);
	});
}

function sendFB(msg, id){
	login({email: user, password: pass}, function callback (err, api) {
	    if(err) return console.error(err);
	    api.sendMessage({body: msg}, id);
	});
}

console.log('virker?');

setTimeout(function (){
	login({email: user, password: pass}, function callback (err, api) {
  	if(err){
  		//console.log(err);
  		return console.log('trying again');
  	} 
 	 	api.getFriendsList(function(err, data) {
   			if(err) return console.error(err);
    		facebookfriends = _.toArray(data);
    		console.log(facebookfriends);
  	});
});

},1000);

app.get('/reload',function(req, res, next){
	login({email: user, password: pass}, function callback (err, api) {
  	if(err){
  		//console.log(err);
  		return console.log('trying again');
  	} 
 	 	api.getFriendsList(function(err, data) {
   			if(err) return console.error(err);
    		facebookfriends = _.toArray(data);
    		console.log(facebookfriends);
  	});
});

app.get('/get', function(req, res, next){
	var commands = _.split(req.query.body, ' ');
	var message = '';

	for (var i = 0; i < facebookfriends.length; i++) {
		if(facebookfriends[i].fullName.toLowerCase().indexOf( commands[1].toLowerCase() ) !== -1){
			message += i + ': ' + facebookfriends[i].fullName + '  ';
		}
	}
	if(!message){
		message = 'Not found';
	}
	sendSMS('Messenger', message);
	res.send(message);

});

app.get('/msg', function(req, res, next){
	var commands = _.split(req.query.body, ' ');
	
	if(_.isNumber(parseInt(commands[1]))) {
		var sendTo = facebookfriends[commands[1]];
		var temp_message = commands;
		temp_message[0] = '';
		temp_message[1] = '';
		var message = _.trim(_.join(temp_message, ' '));
		
		sendFB(message, sendTo.userID);
		res.send('sending to: ' + sendTo.firstName + ' with message: ' + message);

	}
	
});

app.listen(port, '0.0.0.0', function onStart(err) {
	if (err) {
		console.log(err);
	}
	console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});

if(true){
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
	  	          	var msgfrom = ret[event.senderID].fullName
	 	           	//console.log('NAME'+ret[event.senderID].firstName);
	 	           	var replyid;
	            	var text = 'from: ' + msgfrom + ' reply id: ' + replyid + event.body;
	            	if(body_old != event.body){
	            		console.log(event.body);
		            	if(true && event.isGroup === false && event.body){

							request.post({
								url:'https://rest.messagebird.com/messages', 
								headers: {
									Authorization: 'AccessKey live_GOk9sY00eDQ1xC9N0Bx44kg2w'
								},
								form: {
									recipients: phonenumber,
									originator: msgfrom,
									body: text
								}
							},
							function(err,httpResponse,body){ 
								if(err){console.log(err)}
								console.log(httpResponse);
								console.log(body);
							});
						}
	            	}
	            	body_old = event.body;
	            });

	            //api.sendMessage("Nikolaj sporter en slidt nokia i denne stund, beskeden er blevet videresendt til: " + phonenumber + " Du kan også ringe til +4530135097 få at få hans placering.");
	            break;
	          case "event":
	            console.log('event: ' + event);
	            break;
	        }
	    });
	});
}
