var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var Bing = require('node-bing-api')({accKey: "3ddbd08313134638809487eb6385628b"});
var searchTerm = require('./models/searchTerm');

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname));

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/searchTerms');

app.get('/api/imagesearch/:searchVal*', (req, res, next)=>{
  var searchVal = req.params.searchVal;
  var offset = req.query.offset;
  var data = new searchTerm({
    searchVal,
    searchDate: new Date()
  });
  // console.log(offset)
  data.save(err=>{
    if(err){
      res.send('Error Saving to Database');
    }
    // res.json(data);
  });
  // return res.json({
  //   searchVal,
  //   offset
  // });
  var searchOffset
  if(offset){
    if(offset == 1){
      offset = 0;
      searchOffset = 1;
    } else if (offset > 1){
      searchOffset = offset + 1;
    }
  }
  Bing.images(searchVal, {
    top: (10 * searchOffset),
    skip: (10 * offset)
  }, (error, rezz, body)=>{
    // res.json(body);
    var bingData = [];
    for (var i=0; i<10; i++){
      bingData.push({
        url: body.value[i].webSearchUrl,
        snippet: body.value[i].name,
        thumbnail: body.value[i].thumbnailUrl,
        context: body.value[i].hostPageDisplayUrl,
        
      })
    }
    return res.json(bingData);
  })
})

app.get('/api/recentsearches', (req, res, next)=>{
  searchTerm = find({}, (err, data)=>{
    res.json(data);
  })
})


app.listen(process.env.PORT || 3000, ()=> {
  console.log('server is running');
})