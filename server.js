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
var SMS_SENDING = true;
var facebookfriends;



function sendSMS(sendFrom, body){
	request.post({
		url:'https://rest.messagebird.com/messages', 
		headers: {
			Authorization: 'AccessKey live_GOk9sY00eDQ1xC9N0Bx44kg2w'
		},
		form: {
			recipients: phonenumber,
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

app.get('/deactivate',function(req, res, next){
	SMS_SENDING = false;
	console.log('Frakoblet SMS');
	sendSMS('Messenger', 'Frakoblet SMS');
	res.send('message');
});

app.get('/activate',function(req, res, next){
	SMS_SENDING = true;
	console.log('SMS er tilbage');
	sendSMS('Messenger', 'SMS er tilbage');
	res.send('message');
});

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
 	sendSMS('Messenger', 'Facebook venner reloaded');
 	res.send('message');
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
	login({email: user, password: pass}, function callback (err, api) {
		if(err) return console.error(err);
		console.log('logged in')
		var commands = _.split(req.query.body, ' ');
		
		if(_.isNumber(parseInt(commands[1]))) {
			var sendTo = facebookfriends[commands[1]];
			var temp_message = commands;
			temp_message[0] = '';
			temp_message[1] = '';
			var message = _.trim(_.join(temp_message, ' '));
			
		    api.sendMessage({body: message}, sendTo.userID);
			console.log('sending to: ' + sendTo.firstName + ' with message: ' + message);
		}
		api.logout(function(){
			console.log('logged out');
		});
	});
	return res.send('message send');
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
	 	api.setOptions({selfListen: false})
	    api.setOptions({listenEvents: false});
	 
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
	            	if(body_old != event.messageID){
	  	          	var msgfrom = ret[event.senderID].name
	  	          	console.log(event);
	 	           	console.log('NAME: ');
	 	           	console.log(ret[event.senderID].name);
	 	          	var replyid = 'replyid unknown'
	 	          	
	 	          	for (var i = 0; i < facebookfriends.length; i++) {
	 	          		if(facebookfriends[i].fullName == ret[event.senderID].name){
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
	            	var text = 'from: ' + msgfrom + ' reply id: ' + replyid + ' ' + event.body;
	            		console.log('from :' + msgfrom);
	            		console.log(event.body);
		            	if(SMS_SENDING && event.isGroup === false && event.body){

							request.post({
								url:'https://rest.messagebird.com/messages', 
								headers: {
									Authorization: 'AccessKey live_GOk9sY00eDQ1xC9N0Bx44kg2w'
								},
								form: {
									recipients: phonenumber,
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
	            	body_old = event.messageID;
	            });

	            break;
	          case "event":
	            console.log('event: ' + event);
	            break;
	        }
	    });
	});
}
