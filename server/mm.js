const https = require('https');
const express = require('express');
const multer  = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const exec = require('child_process').exec;

const port = 8000;
const log = require('../modules/log.js');
const pass = require('../modules/pass.js');
const { get } = require('http');
const { randomInt } = require('crypto');


const options = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')
};



function init(){
    initDir("./data");
    initFile('./data/lines.json', []);
    initFile('./data/marks.json', {});
    initDir("./marks", function(){
        fs.renameSync("./web/images/NONE.png", "./marks/NONE.png");
    });
    initDir("./uploads");
    initDir("./logs");
    initDir("./tmp");
}

function initDir(dir, callback){
    if(fs.existsSync(dir) == false){
        fs.mkdirSync(dir);
        if(callback)callback();
    }
}
function initFile(file, o){
    if(fs.existsSync(file) == false){
        fs.writeFileSync(file, JSON.stringify(o));
    }
}

function authentication(req, res, next) {
    var authheader = req.headers.authorization;

    if (!authheader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err)
    }
 
    var auth = new Buffer.from(authheader.split(' ')[1],
    'base64').toString().split(':');
    var user = auth[0];
    var pwd = auth[1];
    
    if (pass.check(user, pwd)) {
        log.info(user, " passed.");
        req.user = user;
        next();
    } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        log.info(user, authheader);
        return next(err);
    }
 
}




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })


function logErrors(err, req, res, next) {
    console.error(err.stack)
    next(err)
}
function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' })
    } else {
        next(err)
    }
}
function errorHandler(err, req, res, next) {
    res.status(500)
    res.render('error', { error: err })
}


init();
const app = express()
app.use(authentication);
app.use(`/web`, express.static('web'));
app.use(`/data`, express.static('data'));
app.use(`/marks`, express.static('marks'));

app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

const urlencodedParser = bodyParser.urlencoded({ extended: true })
// app.use(urlencodedParser)

app.post(
    `/update`,urlencodedParser,
    async function(req, res){
        console.log(req.body);
        let index = req.body.index;
        let line = req.body.line;
        let decode = req.body.decode;
        let linesubmit = req.body.linesubmit;
        let decodefresh = req.body.decodefresh;
        let lineremove = req.body.lineremove;

        if(linesubmit){arg0 = "linesubmit";};
        if(decodefresh){arg0 = "decodefresh";};
        if(lineremove){arg0 = "lineremove";};
        
        if(arg0 == null){
            console.log("error: ",req.body);
            return res.status(204).send();
        }
        let argId = req.user+"-"+Date.now() + "-"+parseInt(Math.random() * 1000);
        fs.writeFileSync(`./tmp/${argId}.json`, JSON.stringify({action: arg0, index: index, line: line, decode: decode}));

        const childPorcess = await exec(`java -jar ./java/target/jar/metaalphabet.jar ${argId}`, function(err, stdout, stderr) {
            if (err) {
                console.log(err)
            }
            console.log(stdout)
        });
        // next();
        return res.status(204).send("good!");
    }
);

app.post(
  '/save', 
  upload.fields([
    {name: 'mp_image_file', maxCount: 1}, 
  ]), 
  function (req, res, next) {
    
    if(req.files.mp_image_file){
        let file = req.files.mp_image_file[0];

        let filename = `mark_${Date.now()}.png`;
        fs.rename(file.path, "./marks/"+filename, function(e){});    
        let markname = req.body.mp_data_name;

        let marksfile = './data/marks.json';
        let marksData = fs.readFileSync(marksfile);
        let marks = JSON.parse(marksData);
    
        marks[markname] = {
            image: filename,
        };
        fs.writeFileSync(marksfile, JSON.stringify(marks));
    }



    let index = req.body.mp_index;
    let mindex = req.body.mp_mindex;
    let parameters  = req.body.mp_data_parameters;

    let linesfile = `./data/lines.json`;
    let linesData = fs.readFileSync(linesfile);
    let lines = JSON.parse(linesData);
    lines[index].metaphors[mindex].parameters = parameters;

    fs.writeFileSync(linesfile, JSON.stringify(lines));


    return res.status(204).send();
})

const server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);

});




// app.listen(port,() => {
//   console.log(`Server running on port ${port}!`);
// })




//   const dir = __dirname.replace("/server", "");
//   let url = req.url;


//   if(url.endsWith(".html") == false && url.indexOf(".") == -1){
//     url = url + ".html";
//   }

//   if(url.indexOf("?") != -1){
//     url = url.substring(0, url.indexOf("?"));
//   }
//   const file = dir + url;

//   fs.readFile(file, function (err,data) {
//     if (err) {
//       res.writeHead(404);
//       res.end(JSON.stringify(err));
//       return;
//     }

//     if(req.url.endsWith(".mjs")){
//       res.setHeader("Content-Type", "application/javascript")
//       res.writeHead(200); 
//     }else if(req.url.endsWith(".js")){
//       res.setHeader("Content-Type", "text/javascript")
//       res.writeHead(200);
//     }else if(req.url.endsWith(".json")){
//       res.setHeader("Content-Type", "text/json")
//       res.writeHead(200);
//     }else if(req.url.endsWith(".css") || req.url.endsWith(".html")){
//       res.setHeader("Content-Type", "text/html")
//       res.writeHead(200);
//     }else{
//       res.setHeader("Content-Type", "text/html")
//       res.writeHead(200);
//     }
    
//     console.log(`${req.url}`);
//     res.end(data);
//   });


    // let data = [];
    // let traits = {};


    // if(fs.existsSync('./uploads/traits.json')){
    //   let rawtraits = fs.readFileSync('./uploads/traits.json');
    //   if(rawtraits)
    //     traits = JSON.parse(rawtraits);        
    // }

    // let olddata = []
    // if(fs.existsSync('./uploads/data.json')){
    //   let rawdata = fs.readFileSync('./uploads/data.json');
    //   if(rawdata)
    //   olddata = JSON.parse(rawdata).data;        
    //   if(olddata == null)olddata = []
    // }
    // let index = 0;
    // let od = olddata[index];
    // data[index++] = saveFile('01', req.files.images01, req.body, od, traits);
    // od = olddata[index];
    // data[index++] = saveFile('02', req.files.images02, req.body, od, traits);
    // od = olddata[index];
    // data[index++] = saveFile('03', req.files.images03, req.body, od, traits);
    // od = olddata[index];
    // data[index++] = saveFile('04', req.files.images04, req.body, od, traits);
    // od = olddata[index];
    // data[index++] = saveFile('05', req.files.images05, req.body, od, traits);

    // let configs = {
    //   data: data,
    //   amount: req.body.amount,
    //   size: req.body.size,
    //   contract_uri: req.body.contract_uri,
    //   name: req.body.collection_name,
    //   description: req.body.collection_description,
    //   image: req.body.collection_image,
    //   external_link: req.body.external_link,
    //   seller_fee_basis_points: req.body.seller_fee_basis_points,
    //   item: {
    //     image: req.body.token_image,
    //     external_url: req.body.token_external_url,
    //     description: req.body.token_description,
    //     name: req.body.token_name,
    //     background_color: req.body.token_background_color,
    //     animation_url: req.body.token_animation_url,
    //     youtube_url: req.body.token_youtube_url,
    //   }
    // }
    
    // let jsonfile = "./uploads/data.json";
    // if(fs.existsSync(jsonfile)){fs.unlinkSync(jsonfile);}
    // fs.writeFileSync(jsonfile, JSON.stringify(configs));
    // let traitfile = "./uploads/traits.json";
    // if(fs.existsSync(traitfile)){fs.unlinkSync(traitfile);}
    // fs.writeFileSync(traitfile, JSON.stringify(traits));
    

    // const exec = require('child_process').exec;
    // const childPorcess = exec('java -jar ./jar/beyonchip.jar', function(err, stdout, stderr) {
    //     if (err) {
    //         console.log(err)
    //     }
    //     console.log(stdout)
    // })

// function saveFile(groupNo, files, body, olddata, traits){
//   let data = {};
//   data.files=[];
//   if(!files)files=[];
//   if(!olddata)olddata={};
//   if(!olddata.files)olddata.files=[];

//   console.log(groupNo+","+files.length+","+olddata.files.length);
//   if(files.length > 0){
//     for(let i=0;i<files.length;i++){
//       let file = files[i];
//       let ext = ".png";
//       if(file.mimetype == 'image/jpeg'){
//         ext = ".jpg";
//       }
//       let filename = `./uploads/group${groupNo}_${i}${ext}`;
//       let trait = body[`trait${groupNo}_${i}`];
//       if(fs.existsSync(filename)){fs.unlinkSync(filename);}

  
//       fs.rename(file.path, filename, function(e){});
//       if(trait){
//         traits[file.originalname+""] = trait;
//         data.files[i]=({path:filename, trait:trait});
//       }else
//         data.files[i]=({path:filename});
//     }  
//   }else if(olddata){
//     // console.log(olddata.files.length);
//     data.files = olddata.files;
//     for(let i = 0 ; i < data.files.length ;  i++ ){
//       let file = data.files[i];
//       let trait = body[`trait${groupNo}_${i}`];
//       if(trait){
//         traits[file.originalname+""] = trait;
//         file.trait = trait;
//       }
//     }
//   }
//   data[`group`] = body[`group${groupNo}`];
//   data[`zoom`] = body[`zoom${groupNo}`];
//   data[`movex`] = body[`movex${groupNo}`];
//   data[`movey`] = body[`movey${groupNo}`];
//   data[`rotate`] = body[`rotate${groupNo}`];
//   data[`trait`] = body[`trait${groupNo}`];
//   return data;
// }
