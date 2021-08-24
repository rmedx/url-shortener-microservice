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
  original_url: {type: String, required: true, unique: true},
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
app.post('/api/shorturl', async (req, res) => {
  let short = shortid.generate();
  let input = new urlPair({
    original_url: req.body.url, 
    short_url: short
  });
  try {
    await input.save()
  } catch {
    console.log("error saving input aka document");
  };
  res.json({
    original_url: req.body.url, 
    short_url: short
  });
});

// retreive original_url from database and then redirect
app.get('/api/shorturl/:short', (req, res) => {
  urlPair.findOne({short_url: req.params.short}).exec((err, pair) => {
    if (err) {
      return console.log("error");
    }
    let redirectUrl = pair['original_url'];
    console.log("redirect url" + redirectUrl);
    res.redirect(redirectUrl);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
