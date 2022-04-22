var express = require('express');
var indexRouter = require('./routes/index');

var app = express();


app.use(express.urlencoded( { extended : false}));

var port = 5000;
app.listen(port, function (err) {
    if (typeof (err) == "undefined") {
        console.log('Your application is running on : ' + port + ' port');

    }

});

app.use(express.static('public'));
app.use(express.static('src/views'));

app.use('/', indexRouter);

module.exports = app;
