const fs = require('fs');
const logfile = "./logs/info.log";

function info(s,s1,s2,s3){
    let st = "";
    if(typeof s === 'string')st+=s;else if(s)st+=JSON.stringify(s);
    if(typeof s1 === 'string')st+=s1;else if(s1)st+=JSON.stringify(s1);
    if(typeof s2 === 'string')st+=s2;else if(s2)st+=JSON.stringify(s2);
    if(typeof s3 === 'string')st+=s3;else if(s3)st+=JSON.stringify(s3);
    st+="\n";
    fs.appendFile(logfile, st, function (err) {
        if (err) throw err;
      });
}

exports.info = info;