const express = require('express')
const app = express()
var querystring = require('querystring');
var https = require('https');

app.set('views', './views')
app.set('view engine', 'pug')

port = process.env.PORT || 3000

var code = 0;
var accessToken;
var responseJSON;

var CLIENT_ID = "a2f2482c753d4f059795ff4e8d58d37c"
var CLIENT_SECRET = "04a2f126e1e6422f97046497d6d879d3"
var REDIRECT_URI = "https://aether-image.herokuapp.com/"

var mediaObject = null;
var likes = 0;
var imURL = "";

var url = 'wss://aether-iot.herokuapp.com/';
var ws = new WebSocket(url);
var clientConfig =

{
  messageType     : "config",
  messageContent  :
  {
    device      : "nodeMCU",
    name        : "insta",
    mode        : "send",
    dataType    : "number"
  }
};
/* When connection is established */
ws.onopen = function()
{

  console.log('Connected to ' + url);
  /* Convert client config details to JSON and then
   * send */
  var clientConfigMsg = JSON.stringify(clientConfig);
  ws.send(clientConfigMsg)

};

ws.onmessage = function(data, mask)
{

  console.log(data);
};

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
        var recv = JSON.parse(data)
        if(recv.meta.code == 200)
        {
            console.log(recv);
            var arr = recv.data
            if(arr.length > 0)
            {
              mediaObject = JSON.parse(data).data[0]
              likes = mediaObject.likes.count
              imURL = mediaObject.link
              console.log(mediaObject.likes.count)
              ws.send(likes)


            }
        }

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

app.get('/scripts/*', function(req, res)
{
  res.sendFile(__dirname + req.path, function (err)
{
  if (err)
  {
    console.log(err);
    res.status(err.status).end();
  }
  else
  {
  }
});
})

app.get('/', function (req, res)
{
  if(req.query.hasOwnProperty("code"))
  {
    code = req.query.code
    PostCode(code)
  }
  res.render('index', { title: 'THE NUMBER IS LIKES', message: likes, ln: imURL })

});

app.listen(port, function ()
{
  console.log('Example app listening on port 3000!');
});
