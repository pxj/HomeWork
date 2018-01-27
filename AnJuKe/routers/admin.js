const express=require('express');
const config=require('../config');
const common=require('../libs/common');
const fs=require('fs');

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

//展现test页面
router.get('/test', (req, res)=>{
  res.render('test', {error_msg: ''});
});

router.post('/upload', (req, res)=>{
  console.log("length="+req.files.length);
  console.log("filename="+req.files[0].filename);
  console.log("originalname="+req.files[0].originalname);
  console.log("path="+req.files[0].path);
});

//登录操作
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

// add house info
router.post('/house', (req, res)=>{
  console.log("add house info!");
  //a. get req params
  console.log("post body datas " + JSON.stringify(req.body));
  //process special data
  //process date
  req.body['sale_time']=Math.floor(new Date(req.body['sale_time']).getTime()/1000);
  req.body['submit_time']=Math.floor(new Date(req.body['submit_time']).getTime()/1000);
  //process image, save the filename and path
  let aImgPath=[];
  let aImgRealPath=[];

  for(let i=0;i<req.files.length;i++){
      switch(req.files[i].fieldname){
        case 'main_img':
          req.body['main_img_path']=req.files[i].filename;
          req.body['main_img_real_path']=req.files[i].path;
          break;
        case 'img':
          aImgPath.push(req.files[i].filename);
          aImgRealPath.push(req.files[i].path);
          break;
        case 'property_img':
          req.body['property_img_paths']=req.files[i].filename;
          req.body['property_img_real_paths']=req.files[i].path;
          break;
      }
  }
  req.body['ID']=common.uuid();
  req.body['admin_ID']=req.admin_ID;

  req.body['img_paths']=aImgPath.join(',');
  req.body['img_real_paths']=aImgRealPath.join(',');

  //看看
  let arrField=[];
  let arrValue=[];

  for(let name in req.body){
    arrField.push(name);
    arrValue.push(req.body[name]);
  }

  let insert_sql=`INSERT INTO house_table (${arrField.join(',')}) VALUES('${arrValue.join("','")}')`;
  console.log(insert_sql);
  req.db.query(insert_sql,(err,data)=>{
      if(err){
        console.error("insert fail",err);
      }else{
        console.log("insert success!");
        res.redirect('/admin/house');
      }
  });
});

// submit_time


router.get('/house/delete',(req,res)=>{
  let ID = req.query['id'];
  console.log("ID="+ID);

  let aID = new Array();
  let b_err=false;
  if(ID.indexOf(",") != -1){
    aID = ID.split(',');
    //test ID
    aID.forEach(item=>{
      if(!/^(\d|[a-f]){32}$/.test(item)){
          b_err=true;
      }
    });
  }else{
    aID.push(ID);
  }

  if(b_err){
    res.sendStatus(500,"ID format is wrong.");
  }else{
    //start delete
    let id_index=0;
    _next();
    function _next(){
      let ID=aID[id_index++];
      //a. 删除图片
      let query_sql = `SELECT * FROM house_table WHERE ID='${ID}'`;
      req.db.query(query_sql,(err,data)=>{
        console.log("err = "+err+",length="+data.length);
        if(err){
          res.sendStatus(500);
        }else if(data.length==0){
          res.sendStatus(404,"no data");
        }else{
          let images=[];  //保存所有图片资源位置
          if(data[0]['main_img_real_path']!=null){
            images.push(data[0]['main_img_real_path']);
          }

          if(data[0]['img_real_paths']!=null && data[0]['img_real_paths'].length>0){
            if(data[0]['img_real_paths'].indexOf(',')>=0){
              data[0]['img_real_paths'].split(',').forEach(item=>{
                images.push(item);
              });
            }else{
              images.push(data[0]['img_real_paths']);
            }
          }

          if(data[0]['property_img_real_paths']!=null && data[0]['property_img_real_paths'].length>0){
            if(data[0]['property_img_real_paths'].indexOf(',')>=0){
              data[0]['property_img_real_paths'].split(',').forEach(item=>{
                images.push(item);
              });
            }else{
              images.push(data[0]['property_img_real_paths']);
            }
          }
          console.log('images path='+images);
          if(images.length>0){
            let i=0;
            // concurrent convert to serialization
            next();
            function next(){
              fs.unlink(images[i], err=>{
                if(err){
                  res.sendStatus(500);
                  console.log(err);
                }else{
                  i++;
                  if(i>=images.length){
                    deleteFromDB();
                  }else{
                    next();
                  }
                }
              });
            }
          }else{
            deleteFromDB();
          }

          function deleteFromDB(){
            //2.删除数据本身
            req.db.query(`DELETE FROM house_table WHERE ID='${ID}'`, err=>{
              if(err){
                console.log(err);
                res.sendStatus(500);
              }else{
                //res.redirect('/admin/house');
                if(id_index<aID.length){
                  _next();
                }else{
                  res.redirect('/admin/house');
                }
              }
            });
          }
        }
      })

    }
  }
});
