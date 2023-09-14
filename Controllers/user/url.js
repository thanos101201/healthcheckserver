const userModel = require('../../models/user');
const { google } = require('googleapis');
const request = require('request');
const urlParse = require('url-parse');
const queryPArse = require('query-string');
const url = (req, res) => {
    // const email = req.body.email;
    // console.log(email);
    // const state = { em : email};
    const oauth2Client = new google.auth.OAuth2(
        "611658826728-ob0ffv5qe6gee0o4q32afip1ldb71632.apps.googleusercontent.com",
        "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",
        "http://localhost:3001/user/points"
        );
        
    const scopes = ["https://www.googleapis.com/auth/fitness.activity.read profile email openid"]
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
    })
    // res.send("Hiiii");
    // res.send(req.body.callbackURL);

    request(url, (err, response, body) => {
        console.log("error ", err);
        console.log("statusCode: ", response && response.statusCode);
        res.send({url});
        const queryURL = new urlParse(url);
        const code = queryPArse.parse(queryURL.query).client_id;
        console.log(code);
    })
}

module.exports = url;