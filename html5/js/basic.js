$(function() {
  /**
          jQuery()返回的是jQuery对象，而jQuery对象是没有getContext方法的，需要把
          jQuery对象转换成Dom对象，官方文档推荐的方法如上述代码，其实jQuery对象就是类
          数组，用数组下标可以取得Dom对象
  */
  // var c = document.getElementById("c01");
  let c1 = $("#c01")[0];
  let ctx = c1.getContext("2d");
  ctx.lineWidth = 10;
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(150, 150);
  ctx.stroke();  // draw line

  //c2 lineCap 样式
  let c2 = $("#c02")[0];
  let ctx2 = c2.getContext("2d");
  ctx2.lineWidth = 14;
  ctx2.strokeStyle = "yellow";

  let lineStyle = ["butt", "round", "square"];
  for (let i = 0; i < 3; i++) {
    ctx2.lineCap = lineStyle[i];
    ctx2.beginPath();
    ctx2.moveTo(10, 10 + i * 30);
    ctx2.lineTo(250, 10 + i * 30);
    ctx2.stroke();
  }

  //c3
  let c3 = $("#c03")[0];
  let ctx3 = c3.getContext("2d");
  ctx3.lineWidth = 10;
  ctx3.strokeStyle = "purple";
  ctx3.beginPath();
  ctx3.strokeRect(10,10,190,90);  // (x,y,width,height)

  //c4
  let c4 = $("#c04")[0];
  let ctx4 = c4.getContext("2d");
  ctx4.lineWidth = 10;
  ctx4.strokeStyle = "green";
  ctx4.beginPath();
  ctx4.rect(10,10,190,90);  // (x,y,width,height)
  ctx4.stroke();

  //c5
  let c5 = $("#c05")[0];
  let ctx5 = c5.getContext("2d");
  ctx5.fillStyle = "green";
  ctx5.beginPath();
  ctx5.fillRect(10,10,190,90);  // 实心图形

  //c11
  let c11 = $("#c11")[0];
  let ctx11 = c11.getContext("2d");
  ctx11.lineWidth = 10;
  ctx11.strokeStyle = "red";
  ctx11.beginPath();
  /**
  arc 圆心x,圆心y,半径r,起始角度，终止角度,是否逆时针
  */
  ctx11.arc(100,100,70,0,130*Math.PI/180,true);
  ctx11.stroke();  // draw circle

  //c12
  let c12 = $("#c12")[0];
  let ctx12 = c12.getContext("2d");
  ctx12.lineWidth = 10;
  ctx12.fillStyle = "blue";
  ctx12.beginPath();
  ctx12.arc(100,100,50,0,270*Math.PI/180,false);
  ctx12.fill();  // draw circle

  //c13 fillText 文字
  let c13 = $("#c13")[0];
  let ctx13 = c13.getContext("2d");
  ctx13.font="30px Arial";
  ctx13.fillText("Hello World",10,100) //text, x, y

  //c14 strokeText 文字
  let c14 = $("#c14")[0];
  let ctx14 = c14.getContext("2d");
  ctx14.font="30px Arial";
  ctx14.strokeText("Hello World",10,100)

  //c15 fontStyle,font-weight
  let c15 = $("#c15")[0];
  let ctx15 = c15.getContext("2d");
  let fontWeight = ["normal","bold","bloder","lighter",100]; //四个属性值，或数值
  let fontStyle = ["Arial","Verdana","Times New Roman","serif","scans-serif"];
  for(let i=0;i<fontWeight.length;i++){
    ctx15.beginPath();
    ctx15.font = `${fontWeight[i]} 15px ${fontStyle[i]}`;
    ctx15.fillText(`Hello World (${fontWeight[i]},${fontStyle[i]})`,15,50+i*15);
  }

  //align
  let c21 = $("#c21")[0];
  let ctx21 = c21.getContext("2d");
  let textAlign = ["left","right","center"];
  for(let i=0;i<textAlign.length;i++){
    ctx21.beginPath();
    ctx21.textAlign = textAlign[i];
    ctx21.font ='30px Arial';
    ctx21.fillText("Text Align",100,30 + i*50);
  }

});
