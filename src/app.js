const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const redis = require('redis');
const redisClient = redis.createClient();
const service = require('./services/twofactor');
var plivo = require('plivo');
const config = require('./config/config');


router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});


// Send verification code to the user via SMS.
router.get('/verify/:number', function(req, res) {
    const number = (req.params.number);
    const application = new service();
    if (config.phlo_id == null)
    {
        const code = application.sendVerificationCode_sms(number, 'Your verification code is __code__. Code will expire in 1 minute.');
        redisClient.set(`number:${number}:code`, code, 'EX', 60);
    }
    else
    {
        const code = application.sendVerificationCode_phlo(number,'sms')
        redisClient.set(`number:${number}:code`, code, 'EX', 60);
    }
    res.send(JSON.stringify({
        'status': 'success',
        'message': 'verification initiated'
    }));
});

// Send verification code to the user via Call.
router.get('/verify_voice/:number', function(req, res) {
    const number = (req.params.number);
    const application = new service();
    if (config.phlo_id == null)
    {
        const code = application.sendVerificationCode_call(number);
        redisClient.set(`number:${number}:code`, code, 'EX', 60);
    }
    else
    {
        const code = application.sendVerificationCode_phlo(number,'call')
        redisClient.set(`number:${number}:code`, code, 'EX', 60);
    }
    
    res.send(JSON.stringify({
        'status': 'success',
        'message': 'verification initiated'
    }));
});

// Validate the OTP entered by the user.
router.get('/checkcode/:number/:code', function(req, res) {
    const number = (req.params.number);
    const code = (req.params.code);
    redisClient.get(`number:${number}:code`, function(err, OriginalCode) {
        if (OriginalCode == code) {
            redisClient.del(`number:${number}:code`);
            res.send(JSON.stringify({
                'status': 'success',
                'message': 'codes match! number verified'
            }));
        } else if (OriginalCode != code) {
            res.send(JSON.stringify({
                'status': 'failure',
                'message': 'codes do not match! number not verified'
            }));
        } else {
            res.send(JSON.stringify({
                'status': 'failure',
                'message': 'number not found!'
            }));
        }
    });
});

// add the router
app.use('/', router);
app.use(express.static('public'));
app.listen(config.app.port);

console.log('Running at Port 3000');