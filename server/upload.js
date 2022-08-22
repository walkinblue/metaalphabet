const express = require('express')
const multer  = require('multer')
const port = 8001;
const fs = require('fs');

// const options = {
//     key: fs.readFileSync('./keys/key.pem'),
//     cert: fs.readFileSync('./keys/cert.pem')
// };

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
app.use('/upload', express.static('upload'));
  
function saveFile(groupNo, files, body, olddata, traits){
  let data = {};
  data.files=[];
  if(!files)files=[];
  if(!olddata)olddata={};
  if(!olddata.files)olddata.files=[];

  console.log(groupNo+","+files.length+","+olddata.files.length);
  if(files.length > 0){
    for(let i=0;i<files.length;i++){
      let file = files[i];
      let ext = ".png";
      if(file.mimetype == 'image/jpeg'){
        ext = ".jpg";
      }
      let filename = `./uploads/group${groupNo}_${i}${ext}`;
      let trait = body[`trait${groupNo}_${i}`];
      if(fs.existsSync(filename)){fs.unlinkSync(filename);}

  
      fs.rename(file.path, filename, function(e){});
      if(trait){
        traits[file.originalname+""] = trait;
        data.files[i]=({path:filename, trait:trait});
      }else
        data.files[i]=({path:filename});
    }  
  }else if(olddata){
    // console.log(olddata.files.length);
    data.files = olddata.files;
    for(let i = 0 ; i < data.files.length ;  i++ ){
      let file = data.files[i];
      let trait = body[`trait${groupNo}_${i}`];
      if(trait){
        traits[file.originalname+""] = trait;
        file.trait = trait;
      }
    }
  }
  data[`group`] = body[`group${groupNo}`];
  data[`zoom`] = body[`zoom${groupNo}`];
  data[`movex`] = body[`movex${groupNo}`];
  data[`movey`] = body[`movey${groupNo}`];
  data[`rotate`] = body[`rotate${groupNo}`];
  data[`trait`] = body[`trait${groupNo}`];
  return data;
}

app.post(
  '/upload', 
  upload.fields([
    {name: 'images01', maxCount: 100}, 
    {name: 'images02', maxCount: 100},
    {name: 'images03', maxCount: 100},
    {name: 'images04', maxCount: 100},
    {name: 'images05', maxCount: 100},
  ]), 
  function (req, res, next) {
    // req.files is array of `profile-files` files
    // req.body will contain the text fields, if there were any
    // console.log("aaaa");
    // console.log(req.files);
    // console.log(req.body);
    if(fs.existsSync('./web/outputs/running')){
      return res.status(204).send();
    }


    let data = [];
    let traits = {};

    if(fs.existsSync('./uploads/traits.json')){
      let rawtraits = fs.readFileSync('./uploads/traits.json');
      if(rawtraits)
        traits = JSON.parse(rawtraits);        
    }

    let olddata = []
    if(fs.existsSync('./uploads/data.json')){
      let rawdata = fs.readFileSync('./uploads/data.json');
      if(rawdata)
      olddata = JSON.parse(rawdata).data;        
      if(olddata == null)olddata = []
    }
    let index = 0;
    let od = olddata[index];
    data[index++] = saveFile('01', req.files.images01, req.body, od, traits);
    od = olddata[index];
    data[index++] = saveFile('02', req.files.images02, req.body, od, traits);
    od = olddata[index];
    data[index++] = saveFile('03', req.files.images03, req.body, od, traits);
    od = olddata[index];
    data[index++] = saveFile('04', req.files.images04, req.body, od, traits);
    od = olddata[index];
    data[index++] = saveFile('05', req.files.images05, req.body, od, traits);

    let configs = {
      data: data,
      amount: req.body.amount,
      size: req.body.size,
      contract_uri: req.body.contract_uri,
      name: req.body.collection_name,
      description: req.body.collection_description,
      image: req.body.collection_image,
      external_link: req.body.external_link,
      seller_fee_basis_points: req.body.seller_fee_basis_points,
      item: {
        image: req.body.token_image,
        external_url: req.body.token_external_url,
        description: req.body.token_description,
        name: req.body.token_name,
        background_color: req.body.token_background_color,
        animation_url: req.body.token_animation_url,
        youtube_url: req.body.token_youtube_url,
      }
    }
    
    let jsonfile = "./uploads/data.json";
    if(fs.existsSync(jsonfile)){fs.unlinkSync(jsonfile);}
    fs.writeFileSync(jsonfile, JSON.stringify(configs));
    let traitfile = "./uploads/traits.json";
    if(fs.existsSync(traitfile)){fs.unlinkSync(traitfile);}
    fs.writeFileSync(traitfile, JSON.stringify(traits));
    

    const exec = require('child_process').exec;
    const childPorcess = exec('java -jar ./jar/beyonchip.jar', function(err, stdout, stderr) {
    if (err) {
        console.log(err)
    }
    console.log(stdout)
})

    // var response = '<a href="/">Home</a><br>'
    // response += "Files uploaded successfully.<br>"
    // for(var i=0;i<req.files.length;i++){
    //   console.log(i);
    //     response += `<img src="${req.files[i].path}" /><br>`
    // }
    return res.status(204).send();
    // return res.send("success")
})

app.listen(port,() => {
  console.log(`Server running on port ${port}!`);
  if(fs.existsSync('./web/outputs/running')){
    fs.unlinkSync("./web/outputs/running");
  }
})