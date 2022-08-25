const fs = require('fs');
const passfile = "./pass/user.json";
let usersData = fs.readFileSync(passfile);
let users = JSON.parse(usersData);

function check(user, pwd){
    let p = users[user];
    if(!p)return false;
    return p == pwd;
}

exports.check = check;
