const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./config.json');
const todolist = require('./todolist');
const cors = require('cors');


const BearerStrategy = require('passport-azure-ad').BearerStrategy;

global.global_todos = [];

const options = {
    identityMetadata: `https://${config.credentials.tenantName}.b2clogin.com/${config.credentials.tenantName}.onmicrosoft.com/${config.policies.policyName}/${config.metadata.version}/${config.metadata.discovery}`,
    clientID: config.credentials.clientID,
    audience: config.credentials.clientID,
    policyName: config.policies.policyName,
    isB2C: config.settings.isB2C,
    validateIssuer: config.settings.validateIssuer,
    loggingLevel: config.settings.loggingLevel,
    passReqToCallback: config.settings.passReqToCallback
}

const bearerStrategy = new BearerStrategy(options, (token, done) => {
        done(null, { }, token);
    }
);
const app = express();

app.use(express.json()); 

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(morgan('dev'));

app.use(passport.initialize());

passport.use(bearerStrategy);

app.use('/api/todolist', todolist);


app.get('/hello',
    passport.authenticate('oauth-bearer', {session: false}),
    (req, res) => {
        console.log('Validated claims: ', req.authInfo);
    
        res.status(200).json({'name': req.authInfo['name']});
        console.log(req);
        console.log(res);
    }
);

app.get('/public', (req, res) => res.send( {'date': new Date() } ));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Listening on port ' + port);
});
