'use strict';

const router = require('express').Router();

var login = require("facebook-chat-api");
 

var user = 'nikolaj.sn@hotmail.com';
var pass = 'niko123';
// Create simple echo bot 

router.post('/msg', function(req, res, next){
	res.send('msg');

})



module.exports = router;
