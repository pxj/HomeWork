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
      res.redirect('/admin/house');
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
  const size=3;
  let page=req.query.page;

  if(!page){
    page=1;
  }else if(!/^[1-9]\d*$/.test(page)){
    page=1;
  }

  let start=(page-1)*size;
  console.log("start="+start+",page="+page);

  let key = req.query.key;
  console.log("key="+key);
    //搜索
  let like_seg='1=1';
  if(key){
    let keys=key.split(/\s+/g);

    //['a', '禾', ...] => ["'%a%'", "'%禾%'", ...]
    like_seg=keys.map(item=>`title LIKE '%${item}%'`).join(' OR ');
  }

  console.log("like_seg",like_seg);

  req.db.query(`SELECT ID,title,ave_price,tel FROM house_table WHERE ${like_seg} LIMIT ${start},${size}`, (err, house_data)=>{
    if(err){
      console.log("err="+err);
      res.sendStatus(500);
    }else{
      //2.获取总数据量
      req.db.query(`SELECT COUNT(*) AS c FROM house_table WHERE ${like_seg}`, (err, data)=>{
        if(err){
          res.sendStatus(500);
        }else if(data.length==0){
          res.sendStatus(500);
        }else{
          console.log('total :'+Math.ceil(data[0].c/size));
          res.render('index', {
            data: house_data,
            cur_page: parseInt(page),
            page_count: Math.ceil(data[0].c/size),
            key:key
          });
        }
      });
    }
  });
});

// add house info
router.post('/house/add_update', (req, res)=>{
  let is_mod = req.body['is_mod'];
  console.log("is_mod = "+is_mod);

  //a. get req params
  console.log("post body datas " + JSON.stringify(req.body));

  //process special data
  //process date
  req.body['sale_time']=Math.floor(new Date(req.body['sale_time']).getTime()/1000);
  req.body['submit_time']=Math.floor(new Date(req.body['submit_time']).getTime()/1000);

  if(is_mod){
    console.log("update house info!");

    const fields=['title','sub_title','position_main','position_second','ave_price','area_min','area_max','tel','sale_time','submit_time','building_type','property_types'];

    let arr=[];
    fields.forEach(key=>{
      arr.push(`${key}='${req.body[key]}'`);
    });

    let sql=`UPDATE house_table SET ${arr.join(',')} WHERE ID='${req.body['old_id']}'`;

    req.db.query(sql, err=>{
      if(err){
        console.log("update err",err);
        res.sendStatus(500);
      }else{
        res.redirect('/admin/house');
      }
    });
  }else{
    console.log("add house info!");

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
    let update_sql=`UPDATE house_table`;
    console.log(insert_sql);
    req.db.query(insert_sql,(err,data)=>{
        if(err){
          console.error("insert fail",err);
        }else{
          console.log("insert success!");
          res.redirect('/admin/house');
        }
    });
  }

});

// delete house info
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

// get data
router.get('/house/get_data',(req,res)=>{
  let id = req.query.id;
  //validate id
  if(!id){
    res.sendStatus(404);
  }else if(!/^[\da-f]{32}$/.test(id)){
    res.sendStatus(400);
  }else{
    req.db.query(`SELECT * FROM house_table WHERE ID='${id}'`,(err,data)=>{
      if(err){
        res.sendStatus(500);
      }else{
        if(data.length==0){
          res.sendStatus(500,'no data');
        }else{
          res.send(data[0]);
        }
      }
    });
  }
})
