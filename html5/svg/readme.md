# svg 使用

## 基本形状

line (x1,y1,x2,y2)  (两点坐标)

rect (x,y,width,height) rx  ,ry  控制圆角

cicle (cx,cy,r)  （圆心坐标，半径）

ellipse cx,cy,rx,ry (rx-短轴，ry-长轴)

## 路径
常用：
- M = moveto
- L = lineto
- A = elliptical Arc
- Z = closepath

A     rx    ry    x-axis-rotation large-arc-flag sweep-flag x y
      x半径 y半径  x轴旋转         大弧标志        镜像标志    终点x,y

百度地图的导行使用，有些就是使用path生成的
