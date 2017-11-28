const mysql = require('mysql');

let db = mysql.createPool({hostname:"localhost",user:"root",password:"pxj1989",database:"chat"});

const sql = 'SELECT * FROM user';

db.query(sql,(err,data)=>{
  if(err){
    console.log(err);
  }else{
    console.log(data);
  }
});
