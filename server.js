
/* eslint no-console: 0 */
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const emojiText = require('emoji-text');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();
var rest = require('rest');
var request = require('request');
var _ = require('lodash');
var readlineSync = require('readline-sync');
var faceLogin = require('facebook-chat-api');

var markAsRead = true;
var user = 'nikolaj.sn@hotmail.com';
var oldBody = "";
var phoneNumber = 4524402011;
var sendSms = true;
var facebookFriends;
var listen = true;
var stopCode = 'stop123';
var status = '';

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



function sendSMS(sendFrom, body) {
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
	function(err,httpResponse,body) { 
		if(err){console.log(err)}
		//console.log(httpResponse);
		console.log(body);
	});
}

app.get('/', function(req, res) {
	return res.send(`
		Status:
		Friends loaded: ${facebookFriends}
		Status: ${status}

		<br>
		<br>
		HELP:
		<br>
		get <search>: lists id's of all facebook contacts with the given name.
		<br>
		msg <id>: messages facebook friends using their id followed by a message
		<br>
		reload: reloads all facebook contacts
		<br>
		activate / deactivate: enables / disables sms service. 
		<br>
		yo: sends back 'yo'
		
	`);
});

app.get('/unread', function(req, res) {
	faceLogin({email: user, password: pass}, function (err, api) {
		if(err) return res.send(err);
		api.getThreadList(0, 20, 'inbox', function (err, arr) {
			if(err) return res.send(err);
			unread = arr.filter(thread => (thread.unreadCount > 0 && thread.participants.length < 3));

			unread = _.map(unread, (msg) => msg.snippet);

			res.send(unread);
			sendSMS('Messenger', "");
		});
	});
});


function collectFriends(err, api) {
	console.log('Collecting Facebook friends');
	api.getFriendsList(function(err, data) {
		if(err) return console.error(err);
		facebookFriends = _.toArray(data);
		console.log("A total amount of " + facebookFriends.length + " Facebook friends has been loaded");
	});
}

app.get('/deactivate',function(req, res, next) {
	sendSms = false;
	stopListening();
	console.log('Frakoblet SMS');
	console.log('Logget af Facebook.');
	sendSMS('Messenger', 'Frakoblet SMS');
	res.send('Message has been sent.');
});

app.get('/activate',function(req, res, next) {
	sendSms = true;
	loginAndListen();
	console.log('SMS er tilbage');
	sendSMS('Messenger', 'SMS er tilbage');
	res.send('Message has been sent.');
});

app.get('/reload',function(req, res, next){ //untested.
	var oldfriendAmount = facebookFriends.length;
	faceLogin({email: user, password: pass}, function callback (err, api) {
		collectFriends(err,api);
 	});
	var newfriendAmount = facebookFriends.length;

	sendSMS('Messenger', 'Du har fået ' + (newfriendAmount - oldfriendAmount) + ' nye ven(ner)');
 	res.send('Message has been sent.');
});





app.get('/get', function(req, res, next) {
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
		if(_.isNumber(parseInt(commands[1]))) { //get -> number <- 
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
	if (err) console.log(err);
	console.info('Schlüt SMS ☎️  > 📱  Listening on port %s', port);
});

function shrinkName(msgfrom) {
	var temp_msgfrom = msgfrom.split(' ');
	msgfrom = '';
	for (var i = 0; i < temp_msgfrom.length; i++) {
		if(i == 0) {
			msgfrom += temp_msgfrom[i];
		}else {
			var new_tempmsgfrom = temp_msgfrom[i].replace(/[^A-Za-z0-9]/g, '');
			msgfrom += ' ' + new_tempmsgfrom.match(/\b(\w)/g) +'.';
		}
	}
	return msgfrom;
}

loginAndListen();
var stopListening;

function loginAndListen() {
	if(listen) {
		faceLogin({ email: user, password: pass }, function callback (err, api) {
			if(err) {
				status = err;
				return console.error(err);
			}
			api.setOptions({ selfListen: false })
			api.setOptions({ listenEvents: false });
			api.setOptions({ updatePresence: true });
			api.setOptions({ logLevel: 'warn' });
			collectFriends(err, api); //Into var: facebookFriends.
			console.log('Now listening.')
			stopListening = api.listen(function(err, event) {
				if (err) return console.error(err);
				switch (event.type) {
				case "message":
					
					if(event.body === stopCode) {
						api.sendMessage("Goodbye... ", event.threadID);
						status = 'stopped.'
						return stopListening();
					}
					
					if(markAsRead){
						api.markAsRead(event.threadID, function(err) {
							if(err) {
								console.log(err);
								status = err;
							}
						});
					}

					api.getUserInfo(event.senderID, function(err, ret) {
						if(oldBody != event.messageID) {
						var msgFrom = ret[event.senderID].name;
						console.log(event);
						console.log('Full name: ' + ret[event.senderID].name);
						var replyid = 'replyid unknown'
						
						for (var i = 0; i < facebookFriends.length; i++) {
							if(facebookFriends[i].fullName == ret[event.senderID].name){
								replyid = i;
								break;
							}
							if(ret[event.senderID].name == 'Nikolaj Schlüter Nielsen'){
								replyid = 'Yourself';
							}
						}
						msgFrom = (msgFrom) ? shrinkName(msgFrom) : 'Unknown';
						console.log({replyid});

						var text = 'From: ' + msgFrom + ' reply id: ' + replyid + ' ' + event.body;
							console.log('Shrinked name: ' + msgFrom);
							
							console.log('Message: ' + event.body);
							
							if(sendSms && event.isGroup === false && event.body){
								console.log('Sending SMS');
								status = 'OK';
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
									if(err) {
										console.log(err)
										status = err;
									}
									console.log(httpResponse.body);
									console.log(body);
								});
							}else {
								console.log('Not sending SMS.');
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
}