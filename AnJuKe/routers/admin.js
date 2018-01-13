const express=require('express');
const config=require('../config');
const common=require('../libs/common');

let router=express.Router();
module.exports=router;

//进入所有的admin相关的页面之前，都要校验用户身份——如果没登录过，滚去登陆(/admin/login)
//“所有的”，除了"/admin/login"
router.use((req, res, next)=>{
  console.log("session = " + req.session.admin_ID);
  if(!req.session.admin_ID && req.url!='/login'){
    console.log("redirect");
    res.redirect('/admin/login');
  }else{
    next();
  }
});

//展现login页面
router.get('/login', (req, res)=>{
  res.render('login', {error_msg: ''});
});

//登录操作

router.get('/test', (req, res)=>{
  console.log("get test/ ");
  res.redirect('/admin/house');
});

router.post('/login',(req,res)=>{
  console.log(req.body);
  let {username,password}=req.body;
  //超级管理员
  if(username == config.root_username){
    if(common.md5(password) == config.root_password){
      req.session.admin_ID='1';
      res.redirect('/admin/test');
    }else{
      console.log("root user login error!");
      showError("密码错误！");
    }
  }else{
    req.db.query(`SELECT * FROM admin_table WHERE username='${username}'`, (err, data)=>{
      if(err){
        console.log("common user login error!");
        showError("连接数据库有错！");
      }else{
        if(data.length==0){
          showError("用户名不存在！");
        }else{
          console.log("query data = " + data);
          if(data[0].password == common.md5(password)){
            console.log("common user login success!");
            req.session.admin_ID=data[0].ID;
            res.redirect('/admin/');
          }else{
            showError("密码错误！");
          }
        }
      }
    });
  }

  function showError(msg){
    res.render('login',{error_msg:msg});
  }
});

router.get('/house', (req, res)=>{
  console.log("get house!");
  req.db.query(`SELECT ID,title,ave_price,tel FROM house_table`, (err, data)=>{
    if(err){
      res.sendStatus(500);
    }else{
      res.render('index', {data});
    }
  });
});
