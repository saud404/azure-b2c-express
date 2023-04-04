const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./config.json')

var router = express.Router();

const BearerStrategy = require('passport-azure-ad').BearerStrategy;

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
    done(null, {}, token);
}
);

router.get('/',
    passport.authenticate('oauth-bearer', { session: false }),
    (req, res) => {
        console.log('Validated claims: ', req.authInfo);
        var todos = getCallerTodos(req);
        res.status(200).json(todos);
    }
);
router.get('/*',
    passport.authenticate('oauth-bearer', { session: false }),
    (req, res) => {
        console.log('Validated claims: ', req.authInfo);
        var todos = getCallerTodos(req);
        var item = todos.find(item => item.id === parseInt(req.params[0]));
        res.status(200).json(item);
    }
);

router.post('/', passport.authenticate('oauth-bearer', { session: false }),
    (req, res) => {
        var maxId = 1;
        if (global_todos.length > 0)
            maxId = Math.max.apply(Math, global_todos.map(function (item) { return item.id; })) + 1;

        var item = { "id": maxId, "owner": req.authInfo['sub'], "description": req.body.description, "status": false };
        global_todos.push(item);
        res.status(200).json(item);
    }
);

router.put('/*',
    passport.authenticate('oauth-bearer', { session: false }),
    (req, res) => {
        console.log('Validated claims: ', req.authInfo);
        var todos = getCallerTodos(req);
        var item = todos.find(item => item.id === parseInt(req.body.id));
        item.description = req.body.description;
        item.status = req.body.status;
        res.status(200).json(item);
    }
);

router.delete('/*',
    passport.authenticate('oauth-bearer', { session: false }),
    (req, res) => {
        console.log('Validated claims: ', req.authInfo);
        var item = global_todos.find(item => item.id === parseInt(req.params[0]));
        let pos = global_todos.findIndex(item => item.id === parseInt(req.params[0]));
        global_todos.splice(pos, 1)
        res.status(200).json(item);
    }
);

function getCallerTodos(req) {
    return global_todos.filter(item => item.owner === req.authInfo['sub']);
}

module.exports = router;
