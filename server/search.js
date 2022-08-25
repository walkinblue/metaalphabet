const express = require('express')
const multer  = require('multer')
const port = 8004;
const fs = require('fs');
const XMLHttpRequest = require('xhr2');
https = require('https');

const options = {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem')
};

const app = express()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })

app.use(express.static(__dirname + '/public'));
app.use('/search', express.static('search'));

app.post(
  '/search', 
  upload.fields([
  ]), 
  function (req, res, next) {

    let key = req.body.key;
    console.log(`search.key:${key}`);

    let iconfontUrl = `https://www.iconfont.cn/search/index?searchType=icon&q=${key}&page=1&fromCollection=1&fills=&tag=`;
    let flaticonUrl = `https://www.flaticon.com/search?word=${key}`;
    let iconfinder = `https://www.iconfinder.com/search?q=${key}`;

    let client = new XMLHttpRequest();
    client.open('GET', flaticonUrl);
    client.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 404) {
                console.log("404 detected");
            } else {
                console.log(client.responseText)
            }
        }else{
            console.log(this.readyState);
            console.log(client.responseText)    
        }
        
    }
    client.send();

    return res.status(204).send();
})


const server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

// app.listen(port,() => {
//   console.log(`Server running on port ${port}!`);
// })