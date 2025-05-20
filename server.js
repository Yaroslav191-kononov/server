const express= require( 'express');
const cors= require( 'cors');
const bodyParser= require( 'body-parser');
const sqlite3= require( 'sqlite3');
const bcrypt= require( 'bcryptjs');
const session= require( 'express-session');
const httpsLocalhost=  require( "https-localhost");
const https =require('https');
const fs =require( 'fs');
const redis = require('redis');
const { RedisStore } = require('connect-redis');
const app = express();
const redisClient = redis.createClient({
    url: process.env.RESID_URL, // или REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
});
redisClient.connect().catch(console.error);
let redisStore = new RedisStore({
  client: redisClient,
});
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || '@45erere/;:67WER&ER9(304_DEff#Efdgdf',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000
  }
}));
const { verbose } = sqlite3;
const httpsServer = httpsLocalhost();
const corsOptions = {
  origin: [
    'https://localhost',
    'http://localhost:8100'
  ],
  credentials: true,  
};
app.use(cors(corsOptions));
const db = new sqlite3.Database('mydatabase.db');
app.use(bodyParser.json()); 
app.post('/api/check', (req, res) => {
  const sql = `SELECT * FROM \`user\` WHERE \`name\`='${req.body.name}'`;
  db.all(sql, async function(err, result) {
    if(result.length==0){
          res.end(JSON.stringify(false));
    }
    else{
          let passwordMatch = await bcrypt.compare(req.body.password,result[0].password);
          if(passwordMatch){
            req.session.userId = result[0].id;
            res.end(JSON.stringify(true));
          }else{
            res.end(JSON.stringify(false));
          }
    }
  });
});
app.post('/api/addork', (req, res) => {
    if(req.session.userId){
      let date=new Date();
      const sql = `INSERT INTO \`profile\` (\`name\`, \`tag\`,\`kategory\`,\`date\`,\`userId\`,\`type\`,\`like\`) VALUES ('${req.body.name}', '${req.body.tag}','${req.body.kategory}','${date}','${req.session.userId}','${req.body.type}',0)`;
      db.run(sql, async function(err, result) {
        res.end(JSON.stringify(true));
      });
    }
    else{
      res.end(JSON.stringify(false));
    }
});
app.post('/api/addVack', (req, res) => {
    if(req.session.userId){
      let date=new Date();
      const sql = `INSERT INTO \`Vacansi\` (\`name\`, \`about\`,\`cost\`,\`need\`,\`userId\`,\`type\`,\`location\`,\`date\`) VALUES ('${req.body.name}', '${req.body.about}','${req.body.cost}','${req.body.need}','${req.session.userId}','${req.body.type}','${req.body.location}','${date}')`;
      db.run(sql, async function(err, result) {
        res.end(JSON.stringify(true));
      });
    }
    else{
      res.end(JSON.stringify(false));
    }
});
app.post('/api/addComm', (req, res) => {
    if(req.session.userId && req.session.workId){
      const sqlCheck = `SELECT * FROM \`Option\` WHERE \`profileID\`='${req.session.workId}' AND \`userId\`=${req.session.userId}`;
      db.all(sqlCheck, async function(err, resultSelect) {
        console.log(!resultSelect[0]);
                console.log(!resultSelect[0]);
        if(!resultSelect[0]){
          let date=new Date();
          const sql = `INSERT INTO \`Option\` (\`text\`,\`profileID\`,\`userId\`,\`date\`) VALUES ('${req.body.text}', '${req.session.workId}','${req.session.userId}','${date}')`;
          db.run(sql, async function(err, result) {
            res.end(JSON.stringify(true));
          });
        }
        else{
          console.log(464);
          res.end(JSON.stringify(false));
        }
      })
    }
    else{
      res.end(JSON.stringify(false));
    }
});
app.post('/api/setId', (req, res) => {
    if(req.session.userId){
      req.session.vackId = null;
      req.session.workId = req.body.workId;
      res.end(JSON.stringify(true));
    }
    else{
      res.end(JSON.stringify(false));
    }
});
app.post('/api/setVackId', (req, res) => {
    if(req.session.userId){
      req.session.workId = null;
      req.session.vackId = req.body.workId;
      res.end(JSON.stringify(true));
    }
    else{
      res.end(JSON.stringify(false));
    }
});
app.post('/api/addUser', (req, res) => {
  const sql = `SELECT * FROM \`user\` WHERE \`name\`='${req.body.name}'`;
  db.all(sql, async function(err, result) {
    if(result.length==0){
      let hashedPassword = await bcrypt.hash(req.body.password, 10);
      let date=new Date();
        const sqlAdd = `INSERT INTO \`user\` (\`name\`, \`password\`,\`role\`,\`email\`,\`phone\`,\`date\`) VALUES ('${req.body.name}', '${hashedPassword}','${req.body.role}','${req.body.email}','${req.body.phone}','${date}')`;
          db.run(sqlAdd, async function(err, resultAdd) {
             db.all(sql, async function(err, resultSelect) {
                req.session.userId = resultSelect[0].id;
                res.end(JSON.stringify(true));
            })
          })
    }
    else{
          res.end(JSON.stringify(false));
    }
  });
});
app.get('/api/isAutificating', (req, res) => {
    if(req.session.userId){
      res.end(JSON.stringify(true));
    }
    else{
      res.end(JSON.stringify(false));
    }
});
app.get('/api/Exit', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при уничтожении сессии:', err);
    }
  });
  res.end();
});
app.post('/api/getProfil', (req, res) => {
  if(req.session.userId){
    const sql = `SELECT * FROM \`user\` WHERE \`id\`='${req.session.userId}'`;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
  });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getWork', (req, res) => {
  if(req.session.userId){
    const sql = `SELECT * FROM \`profile\` WHERE \`userId\`=${req.session.userId}`;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
  });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getVack', (req, res) => {
  if(req.session.userId){
    const sql = `SELECT * FROM \`Vacansi\` WHERE \`userId\`=${req.session.userId}`;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
  });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getOneWork', (req, res) => {
  if(req.session.workId){
    const sql = `SELECT * FROM \`profile\` WHERE \`id_profile\`='${req.session.workId}'`;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getOneVack', (req, res) => {
  if(req.session.vackId){
    const sql = `SELECT * FROM \`Vacansi\` WHERE \`id\`='${req.session.vackId}'`;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getComm', (req, res) => {
  if(req.session.workId){
    const sql = `SELECT * FROM \`Option\` JOIN \`user\` ON \`user\`.\`id\`= \`Option\`.\`userId\` WHERE \`Option\`.\`profileID\`='${req.session.workId}'`;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getOneLike', async (req, res) => {
  if(req.session.workId){
    let step;
    const sql = `SELECT * FROM \`profile\` WHERE \`id_profile\`='${req.session.workId}'`;
    const likeSessionKey = `like_${req.session.workId}`;
    if(!req.session[likeSessionKey]){
      req.session[likeSessionKey]=true;
      step=1;
    }
    else{
      req.session[likeSessionKey]=false;
      step=-1;
    }
    await db.all(sql, async function(err, result) {
      let like=result[0].like+step;
      let sqlUpdate=`UPDATE \`profile\` SET \`like\` = ${like} WHERE \`id_profile\`='${req.session.workId}'`;
      db.run(sqlUpdate, async function(err, result) {
        res.end(JSON.stringify(like));
      });
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getAllKat', (req, res) => {
  if(req.session.userId){
    const sql = `SELECT \`kategory\` FROM \`profile\` GROUP BY \`kategory\``;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getAllType', (req, res) => {
  if(req.session.userId){
    const sql = `SELECT \`type\` FROM \`Vacansi\` GROUP BY \`type\``;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getAllDate', (req, res) => {
  if(req.session.userId){
    const sql = `SELECT \`date\` FROM \`Vacansi\` GROUP BY \`date\``;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getAllWork', (req, res) => {
  if(req.session.userId){
    const sql = `SELECT * FROM \`user\` WHERE \`id\`='${req.session.userId}'`;
    db.all(sql, async function(err, result) {
      let sqlSelect='';
      if(result[0].role=="boss" && !req.body.select){
        sqlSelect = `SELECT * FROM \`profile\``;
      }
      else if( result[0].role=="student" && !req.body.select){
        sqlSelect = `SELECT * FROM \`profile\` WHERE \`type\`='All'`;
      }
      else if( result[0].role=="boss" && req.body.select){
        sqlSelect = `SELECT * FROM \`profile\` WHERE \`kategory\`='${req.body.select}'`;
      }
      else if( result[0].role=="student" && req.body.select){
        sqlSelect = `SELECT * FROM \`profile\` WHERE \`type\`='All' AND \`kategory\`='${req.body.select}'`;
      }
      db.all(sqlSelect, async function(err, result) {
        res.end(JSON.stringify(result));
      });
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getAllVack', (req, res) => {
  if(req.session.userId){
    let sql = ``;
    if(!req.body.select && !req.body.selectDate){
      sql = `SELECT * FROM \`Vacansi\``;
    }
    else if(req.body.select && !req.body.selectDate){
      sql = `SELECT * FROM \`Vacansi\` WHERE \`type\`='${req.body.select}'`;
    }
    else if(!req.body.select && req.body.selectDate){
      sql = `SELECT * FROM \`Vacansi\` WHERE \`date\`='${req.body.selectDate}'`;
    }
    else if(req.body.select && req.body.selectDate){
      sql = `SELECT * FROM \`Vacansi\` WHERE \`type\`='${req.body.select}' AND \`date\`='${req.body.selectDate}'`;
    }
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
// const options = {
//   key: fs.readFileSync('localhost-key.pem'),
//   cert: fs.readFileSync('localhost.pem')
// };

// https.createServer(options, app).listen(3000, () => {
//   console.log('Server listening on port 3000');
// });
app.listen(3000, function(err){
    if (err) console.log("Error in server setup")
    console.log(3000);
})