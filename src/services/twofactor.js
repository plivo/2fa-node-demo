const plivo = require('plivo');
const config = require('../config/config');
var PhloClient = plivo.PhloClient;
var phloClient = phlo = null;



/**
 * To send Verification code via SMS, Call & PHLO
 */
class PlivoTwofactorAuth {
    /**
     * Adds two numbers together.
     * @param {string} auth_id Plivo Auth ID.
     * @param {string} auth_token Plivo Auth Token.
     */
    constructor() {
        this.client = new plivo.Client(config.credentials.auth_id, config.credentials.auth_token);
        this.app_number = config.app_number;
        this.phlo_client = new PhloClient(config.credentials.auth_id, config.credentials.auth_token);
        this.phloId = config.phlo_id;
    }
    /**
     * Adds two numbers together.
     * @param {string} DstNumber The Destination number.
     * @param {string} Message The Message Text number.
     * @return {int} Verification Code.
     */
    sendVerificationCode_sms(DstNumber, Message) {
        const code = Math.floor(100000 + Math.random() * 900000);

        const response = this.client.messages.create(
            this.app_number,
            DstNumber, // dst
            Message.replace('__code__', code)); // text
        return code;
    }

    /**
     * @param {string} DstNumber The Destination number.
     * @param {string} Message The Message Text number.
     * @param {string} Answer_url which returns a SSML.
     */
    sendVerificationCode_call(DstNumber) {
        const code = Math.floor(100000 + Math.random() * 900000);

        this.client.calls.create(
            this.app_number, // CallerId/Source
            DstNumber, // Destination
            'https://twofa-answerurl.herokuapp.com/answer_url/' + code); // Answer_url
        return code;

    }

    // Trigger PHLO
    sendVerificationCode_phlo(DstNumber, mode) {
        var payload = {
            from: this.app_number,
            to: DstNumber,
            otp: code,
            mode: mode
        }
        phloClient = this.phlo_client
        phloClient.phlo(this.phloId).run(payload).then(function() {
            return code;
        }).catch(function(err) {
            console.error('Phlo run failed', err);
        });
    }
}
module.exports = PlivoTwofactorAuth;