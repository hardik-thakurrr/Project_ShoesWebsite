var alert = require('alert');
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var con = require('../database/connect');
const https = require("https");
const qs = require("querystring");
const checksum_lib = require("../Paytm/checksum");
const config = require("../Paytm/config");

var total_val = 0;

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())

const parseUrl = express.urlencoded({
    extended: false
});
const parseJson = express.json({
    extended: false
});

// GET home page. 
router.get('/', function (req, res, next) {

    res.render('index', {
        message: 'Welcome,' + req.session.name
    })
});


//Handle POST request for User Registration
router.post('/registerr', function (req, res, next) {

    var fullname = req.body.firstName;
    var email = req.body.email;
    var phonenumber = req.body.ph;
    var password = req.body.pwd;
    var address = req.body.add;

    var hashpassword = bcrypt.hashSync(password, 10);
    var sql = 'insert into users(name, email, phone, password, address) values(?,?,?,?,?);';

    con.query(sql, [fullname, email, phonenumber, hashpassword, address], function (err, result, fields) {
        if (err) throw err;
        else {
            console.log('Registration Successful: ' + fullname);
            alert('Registered Successfully\nPlease Login!');
        }
    });
});


//Handle POST request for User Login
router.post('/loginn', [parseUrl, parseJson], function (req, res, next) {

    var name = req.body.login_name;
    var password = req.body.login_pass;

    var sql = 'select * from users where name = ?;';

    var query = 'select sum(shoePrice) as total_cart from order_cart;';

    con.query(query, function (err, result, fields) {
        if (err) throw err;
        else {
            console.log('Amount: ' + result[0].total_cart);
            total_val = result[0].total;
        }
    });

    var final = total_val.toString();
    console.log(typeof(final));

    con.query(sql, [name], function (err, result, fields) {
        if (err) throw err;
        else {
            if (result.length && bcrypt.compareSync(password, result[0].password)) {
                console.log('Login successful: ' + name);

                var paymentDetails = {
                    amount: "20998",
                    customerId: req.body.login_name
                }
                if (!paymentDetails.amount || !paymentDetails.customerId) {
                    res.status(400).send('Payment Failed')
                } else {
                    var params = {};
                    params['MID'] = config.PaytmConfig.mid;
                    params['WEBSITE'] = config.PaytmConfig.website;
                    params['CHANNEL_ID'] = 'WEB';
                    params['INDUSTRY_TYPE_ID'] = 'Retail';
                    params['ORDER_ID'] = 'TEST_' + new Date().getTime();
                    params['CUST_ID'] = paymentDetails.customerId;
                    params['TXN_AMOUNT'] = paymentDetails.amount;
                    params['CALLBACK_URL'] = 'http://localhost:3000/callback';


                    checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
                        var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
                        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

                        var form_fields = "";
                        for (var x in params) {
                            form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
                        }
                        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
                        res.end();
                    });
                }



            } else {
                console.log('Login unsuccessful');
            }
        }

    });
});

router.post("/callback", (req, res) => {
    // Route for verifiying payment

    var body = '';

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        var html = "";
        var post_data = qs.parse(body);

        // received params in callback
        console.log('Callback Response: ', post_data, "\n");


        // verify the checksum
        var checksumhash = post_data.CHECKSUMHASH;
        // delete post_data.CHECKSUMHASH;
        var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
        console.log("Checksum Result => ", result, "\n");


        // Send Server-to-Server request to verify Order Status
        var params = {
            "MID": config.PaytmConfig.mid,
            "ORDERID": post_data.ORDERID
        };

        checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

            params.CHECKSUMHASH = checksum;
            post_data = 'JsonData=' + JSON.stringify(params);

            var options = {
                hostname: 'securegw-stage.paytm.in', // for staging
                // hostname: 'securegw.paytm.in', // for production
                port: 443,
                path: '/merchant-status/getTxnStatus',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': post_data.length
                }
            };


            // Set up the request
            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                post_res.on('end', function () {
                    console.log('S2S Response: ', response, "\n");

                    var _result = JSON.parse(response);
                    if (_result.STATUS == 'TXN_SUCCESS') {
                        res.send('payment sucess')
                    } else {
                        res.send('payment failed')
                    }
                });
            });

            // post the data
            post_req.write(post_data);
            post_req.end();

        });
    });

});

//Cart to MySQL
router.post('/sendToSQL', (req, res, ) => {

    let shoedata = req.body;
    let id = shoedata.id;
    let shoe_name = shoedata.shoe_name;
    let price = parseInt(shoedata.price);

    let qty = shoedata.qty;
    var data = [
        [id, shoe_name, price, qty]
    ]
    console.log(req.body);

    console.log(typeof (price));

    var sql = 'insert into order_cart(shoeID, shoesName, shoePrice, shoeQty) values ?;';

    con.query(sql, [data], function (err, res, fields) {
        if (err)
            throw err;
        else {
            console.log('Inserted succes ');
            console.log(res);

        }
    })

})

module.exports = router;