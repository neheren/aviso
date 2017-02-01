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

var faceLogin = require("facebook-chat-api");

var user = 'nikolaj.sn@hotmail.com';
var pass = 'niko123';
var oldBody = "";
var phoneNumber = 4524402011;
var sendSms = true;
var facebookFriends;



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


setTimeout(function (){
	faceLogin({email: user, password: pass}, function callback (err, api) {
		if(err){
			return console.log(err);
		}
		console.log('Collecting Facebook friends');
		api.getFriendsList(function(err, data) {
			if(err) return console.error(err);
			facebookFriends = _.toArray(data);
			console.log("A total amount of " + facebookFriends.length + " Facebook friends has been loaded");
		});
	});
},500);

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

app.get('/reload',function(req, res, next){
	faceLogin({email: user, password: pass}, function callback (err, api) {
  	if(err){
  		return console.log(err);
  	} 
 	 	api.getFriendsList(function(err, data) {
   			if(err) return console.error(err);
    		facebookFriends = _.toArray(data);
    		console.log(facebookFriends);
  		});
 	});
 	sendSMS('Messenger', 'Facebook venner reloaded');
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

const listen = true;

if(listen) {
	faceLogin({email: user, password: pass}, function callback (err, api) {
	    if(err) return console.error(err);
	 	api.setOptions({selfListen: true})
	    api.setOptions({listenEvents: false});
	 	api.setOptions({updatePresence: true});
		console.log('Now listening.')
	    var stopListening = api.listen(function(err, event) {
	        if(err) return console.error(err);
	        switch(event.type) {
	          case "message":
	            if(event.body === '/stop 123') {
	              api.sendMessage("Goodbye...", event.threadID);
	              return stopListening();
	            }
	            /*api.markAsRead(event.threadID, function(err) {
	              if(err) console.log(err);
	            });*/

	            api.getUserInfo(event.senderID, function(err, ret) {
	            	if(oldBody != event.messageID){
	  	          	var msgfrom = ret[event.senderID].name
	  	          	console.log(event);
	 	           	console.log('NAME: ');
	 	           	console.log(ret[event.senderID].name);
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
	 	          	//lortekoden: fra Nikolaj Schlüter Nielsen => Nikolaj S. N.
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
	 	      
	 	          	console.log(replyid);

	 	           	if(!msgfrom) msgfrom = 'Unknown';
	            	var text = 'From: ' + msgfrom + ' reply id: ' + replyid + ' ' + event.body;
	            		console.log('from :' + msgfrom);
	            		console.log(event.body);
		            	if(sendSms && event.isGroup === false && event.body){

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
