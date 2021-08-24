require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const shortid = require('shortid');
const app = express();
const Schema = mongoose.Schema;

// middleware bodyparser that parses post request
app.use(bodyParser.urlencoded({extended: false}));

// connect mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// schema for url pairs
const urlPairSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: {type: String, required: true}
});

// model for url pairs
const urlPair = mongoose.model('urlPair', urlPairSchema);

// constructor for url pairs

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// post url
// check with regex https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
app.post('/api/shorturl', (req, res) => {
  let url = req.body.url;
  var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if (url === "") {
    res.json({error: "invalid url"})
  } else if (!pattern.test(url)) {
    res.json({error: "invalid url"})
  } else {
    let short = shortid.generate();
    let input = new urlPair({
      original_url: url, 
      short_url: short
    });
    input.save((err, data) => {
      if (err) {
        return console.log("error saving doc");
      }
      res.json({
        original_url: req.body.url, 
        short_url: short
      });
    })
  }
});

// retreive original_url from database and then redirect
app.get('/api/shorturl/:short', (req, res) => {
  urlPair.find({short_url: req.params.short}, (err, pairs) => {
    if (err) {
      return console.log("error with findOne");
    }
    let redirectUrl = pairs[0]['original_url'];
    res.redirect(redirectUrl);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
