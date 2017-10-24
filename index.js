const express = require('express')
const app = express()

port = process.env.PORT || 3000)

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
