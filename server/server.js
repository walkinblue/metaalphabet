const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')
};


//如果data.json & traits.json不存在创建一个新的。
const dataJson = "./uploads/data.json";
const traitsJson = "./uploads/traits.json";
if(fs.existsSync(dataJson) == false){
  fs.writeFileSync(dataJson, JSON.stringify({}));
}
if(fs.existsSync(traitsJson) == false){
  fs.writeFileSync(traitsJson, JSON.stringify({}));
}


https.createServer(options, (req, res) => {

  const dir = __dirname.replace("/server", "");
  let url = req.url;


  if(url.endsWith(".html") == false && url.indexOf(".") == -1){
    url = url + ".html";
  }

  if(url.indexOf("?") != -1){
    url = url.substring(0, url.indexOf("?"));
  }
  const file = dir + url;

  fs.readFile(file, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }

    
    if(req.url.endsWith(".mjs")){
      res.setHeader("Content-Type", "application/javascript")
      res.writeHead(200); 
    }else if(req.url.endsWith(".js")){
      res.setHeader("Content-Type", "text/javascript")
      res.writeHead(200);
    }else if(req.url.endsWith(".json")){
      res.setHeader("Content-Type", "text/json")
      res.writeHead(200);
    }else if(req.url.endsWith(".css") || req.url.endsWith(".html")){
      res.setHeader("Content-Type", "text/html")
      res.writeHead(200);
    }else{
      res.setHeader("Content-Type", "text/html")
      res.writeHead(200);
    }
    

    console.log(`${req.url}`);
    res.end(data);
  });

}).listen(8000);