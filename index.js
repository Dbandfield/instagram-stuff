const express = require('express')
const app = express()
var querystring = require('querystring');
var https = require('https');

port = process.env.PORT || 3000

var code = 0;
var accessToken;
var responseJSON;

var CLIENT_ID = "a2f2482c753d4f059795ff4e8d58d37c"
var CLIENT_SECRET = "04a2f126e1e6422f97046497d6d879d3"
var REDIRECT_URI = "https://aether-image.herokuapp.com/redirect"

function requestMedia()
{
  var getStr = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + accessToken;
  console.log(getStr);
  https.get(getStr, (resp) =>
  {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) =>
      {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () =>
      {
        console.log(JSON.parse(data));
      });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });


}


function PostCode(codestring)
{
  // Build the post string from an object
  var post_data = querystring.stringify({

        'client_id':CLIENT_ID ,
        'client_secret':CLIENT_SECRET,
        'grant_type':'authorization_code',
        'redirect_uri':REDIRECT_URI,
        'code':codestring
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'api.instagram.com',
      path: '/oauth/access_token',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };

  // Set up the request
  var post_req = https.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk)
      {
          console.log('Response: ' + chunk);
          responseJSON = JSON.parse(chunk);
          accessToken = responseJSON.access_token;
          requestMedia();
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}

app.get('/', function (req, res)
{
  res.sendFile(__dirname + '/index.html',function(err)
{
  if(err)
  {
    console.log(err);
    req.status(err.status).end();
  }
});
});

app.get('/redirect', function (req, res)
{
  code = req.query.code
  PostCode(code)
  res.sendFile(__dirname + '/again.html',function(err)
{
  if(err)
  {
    console.log(err);
    req.status(err.status).end();
  }
});
});

app.listen(port, function ()
{
  console.log('Example app listening on port 3000!');
});
