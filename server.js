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
var rest = require('rest');
var request = require('request');
var _ = require('lodash');
var readlineSync = require('readline-sync');
var faceLogin = require("facebook-chat-api");

var user = 'nikolaj.sn@hotmail.com';
var oldBody = "";
var phoneNumber = 4524402011;
var sendSms = true;
var facebookFriends;
var listen = true;

var enteredUser = readlineSync.question('Please enter facebook username: ');
if(enteredUser) {
	user = enteredUser;
}else {
	console.log('Using default user: ' + user)
}
var pass = readlineSync.question('Please enter password: ', {hideEchoBack: true});

var enteredNumber = readlineSync.question('Please enter phone number: ');
if(enteredNumber) {
	phoneNumber = enteredNumber;
}else {
	console.log('Using default phone number: ' + phoneNumber);
}



function sendSMS(sendFrom, body){
	request.post({
		url:'https://rest.messagebird.com/messages', 
		headers: {
			Authorization: 'AccessKey live_GOk9sY00eDQ1xC9N0Bx44kg2w'
		},
		form: {
			recipients: phoneNumber,
			originator: '+447860039047',
			body: body
		}
	},
	function(err,httpResponse,body){ 
		if(err){console.log(err)}
		console.log(httpResponse);
		console.log(body);
	});
}


function collectFriends(err, api){
	console.log('Collecting Facebook friends');
	api.getFriendsList(function(err, data) {
		if(err) return console.error(err);
		facebookFriends = _.toArray(data);
		console.log("A total amount of " + facebookFriends.length + " Facebook friends has been loaded");
	});
}

app.get('/deactivate',function(req, res, next){
	sendSms = false;
	console.log('Frakoblet SMS');
	sendSMS('Messenger', 'Frakoblet SMS');
	res.send('message');
});

app.get('/activate',function(req, res, next){
	sendSms = true;
	console.log('SMS er tilbage');
	sendSMS('Messenger', 'SMS er tilbage');
	res.send('message');
});

app.get('/reload',function(req, res, next){ //untested.
	var oldfriendAmount = facebookFriends.length;
	faceLogin({email: user, password: pass}, function callback (err, api) {
		collectFriends(err,api);
 	});
	var newfriendAmount = facebookFriends.length;

 	sendSMS('Messenger', 'Facebook venner du har fået ' + newfriendAmount - oldfriendAmount + ' nye ven(ner)!');
 	res.send('message');
});





app.get('/get', function(req, res, next){
	var commands = _.split(req.query.body, ' ');
	var message = '';

	for (var i = 0; i < facebookFriends.length; i++) {
		if(facebookFriends[i].fullName.toLowerCase().indexOf( commands[1].toLowerCase() ) !== -1){
			message += i + ': ' + facebookFriends[i].fullName + '  ';
		}
	}
	if(!message){
		message = 'Not found';
	}
	sendSMS('Messenger', message);
	res.send(message);

});

app.get('/msg', function(req, res, next){
	faceLogin({email: user, password: pass}, function callback (err, api) {
		if(err) return console.error(err);
		console.log('Logged in');
		var commands = _.split(req.query.body, ' ');
		
		if(_.isNumber(parseInt(commands[1]))) {
			var sendTo = facebookFriends[commands[1]];
			var temp_message = commands;
			temp_message[0] = '';
			temp_message[1] = '';
			var message = _.trim(_.join(temp_message, ' '));
			api.setOptions('')
		    api.sendMessage({body: message}, sendTo.userID);
			console.log('Sending to: ' + sendTo.firstName + ' with message: ' + message);
		}
		api.logout(function(){
			console.log('Logged out');
		});
	});
	return res.send('Message send');
});

app.listen(port, '0.0.0.0', function onStart(err) {
	if (err) {
		console.log(err);
	}
	console.info('Schlüt SMS ☎️  > 📱  Listening on port %s', port);
});

function shrinkName(msgfrom) {
	var temp_msgfrom = msgfrom.split(' ');
	msgfrom = '';
	for (var i = 0; i < temp_msgfrom.length; i++) {
		if(i==0){
			msgfrom += temp_msgfrom[i];
		}else{
			var new_tempmsgfrom = temp_msgfrom[i].replace(/[^A-Za-z0-9]/g, '');
			msgfrom += ' ' + new_tempmsgfrom.match(/\b(\w)/g) +'.';
		}
	}
	return msgfrom;
}


if(listen) {
	faceLogin({email: user, password: pass}, function callback (err, api) {
	    if(err) return console.error(err);
	 	api.setOptions({selfListen: true})
	    api.setOptions({listenEvents: false});
	 	api.setOptions({updatePresence: true});
		collectFriends(err, api); //Into var: facebookFriends.
		console.log('Now listening.')
	    var stopListening = api.listen(function(err, event) {
	        if(err) return console.error(err);
	        switch(event.type) {
	          case "message":
	            if(event.body === '/stop 123') {
	              api.sendMessage("Goodbye... ", event.threadID);
	              return stopListening();
	            }
	            /*api.markAsRead(event.threadID, function(err) {
	              if(err) console.log(err);
	            });*/

	            api.getUserInfo(event.senderID, function(err, ret) {
	            	if(oldBody != event.messageID){
	  	          	var msgFrom = ret[event.senderID].name
	  	          	console.log(event);
	 	           	console.log('Full name: ' + ret[event.senderID].name);
	 	          	var replyid = 'replyid unknown'
	 	          	
	 	          	for (var i = 0; i < facebookFriends.length; i++) {
	 	          		if(facebookFriends[i].fullName == ret[event.senderID].name){
	 	          			replyid = i;
	 	          			break;
	 	          		}
	 	          		if(ret[event.senderID].name == 'Nikolaj Schlüter Nielsen'){
	 	          			replyid = 'yourself';
	 	          		}
	 	          	}
					msgFrom = (msgFrom) ? shrinkName(msgFrom) : 'Unknown';
	 	          	console.log({replyid});

	            	var text = 'From: ' + msgFrom + ' reply id: ' + replyid + ' ' + event.body;
	            		console.log('Shrinked name: ' + msgFrom);
	            		console.log('Message: ' + event.body);
		            	if(sendSms && event.isGroup === false && event.body){
							console.log('Sending SMS');
							request.post({
								url:'https://rest.messagebird.com/messages', 
								headers: {
									Authorization: 'AccessKey live_GOk9sY00eDQ1xC9N0Bx44kg2w'
								},
								form: {
									recipients: phoneNumber,
									originator: '+447860039047',
									body: text
								}
							},
							function(err,httpResponse,body){
								if(err){console.log(err)}
								console.log(httpResponse.body);
								console.log(body);
							});
						}else{
							console.log('Not sending SMS. ');
						}
	            	}
	            	oldBody = event.messageID;
	            });

	            break;
	          case "event":
	            console.log('event: ' + event);
	            break;
	        }
	    });
	});
}
