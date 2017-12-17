// 在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 注意require('koa-router')返回的是函数:
const router = require("koa-router")();

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
  console.log("ctx=" + JSON.stringify(ctx));
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
  // ctx.response.type = 'text/html';
  // ctx.response.body = '<h1>Hello, koa2!</h1>';
});

// add router
router.get('/hello/:name', async (ctx, next) => {
  let name = ctx.params.name;
  console.log("name="+name);
  ctx.response.body = `<h1>Hello, ${name}!</h1>`;
});

router.get("/", async (ctx, next) => {
  ctx.response.body = "<h1>Welcome, index !</h1>";
});

//add router middleware:
app.use(router.routes());

// 在端口3000监听:
app.listen(8080);
console.log('app started at port 8080...');
