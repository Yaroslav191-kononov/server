const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const httpsLocalhost = require("https-localhost");

const app = express();
const { verbose } = sqlite3;
//const httpsServer = httpsLocalhost();

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

  const sql = `SELECT * FROM \`user\` WHERE \`name\`=?`;

  db.all(sql,[req.body.name], async function(err, result) {
    if(result.length==0){
      res.end(JSON.stringify(false));
    }
    else{
      let passwordMatch = await bcrypt.compare(req.body.password,result[0].password);
      if(passwordMatch){
        res.end(JSON.stringify(result[0].id));
      }
      else{
        res.end(JSON.stringify(false));
      }
    }
  });
});
app.post('/api/addWork', (req, res) => {
    if(req.body.userId){
      let date=new Date().toISOString().split('T')[0];
      const sql = `INSERT INTO \`profile\` (\`name\`, \`tag\`,\`kategory\`,\`date\`,\`userId\`,\`type\`,\`point\`,\`rating\`,\`view\`) VALUES (?,?,?,?,?,?,0,0,0)`;

      db.run(sql,[req.body.name,req.body.tag,req.body.kategory,date,req.body.userId,req.body.type], async function(err, result) {
        res.end(JSON.stringify(true));
      });

    }
    else{
      res.end(JSON.stringify(false));
    }
});
app.post('/api/updateVack', async (req, res) => {
  if(req.body.vackId){
    let sqlUpdate=`UPDATE \`Vacansi\` SET \`name\` = ?,\`about\` = ?,\`cost\` = ?,\`need\` = ?,\`type\` = ?,\`location\` = ? WHERE \`id\`=?`;

    db.run(sqlUpdate,[req.body.name,req.body.about,req.body.cost,req.body.need,req.body.type,req.body.location,req.body.vackId], async function(err, result) {
      res.end(JSON.stringify(true));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/updateWork', async (req, res) => {
  if(req.body.workId){
    let sqlUpdate=`UPDATE \`profile\` SET \`name\` = ?,\`tag\` = ?,\`kategory\` = ? WHERE \`id_profile\`=?`;

    db.run(sqlUpdate,[req.body.name,req.body.tag,req.body.kategory,req.body.workId], async function(err, result) {
      res.end(JSON.stringify(true));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/updateComm', async (req, res) => {
  if(req.body.commId){
    let sqlUpdate=`UPDATE \`Option\` SET \`text\` = ? WHERE \`id\` = ?`;

    db.run(sqlUpdate,[req.body.text,req.body.commId], async function(err, result) {
      console.log(err);
      res.end(JSON.stringify(true));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/addVack', (req, res) => {
    if(req.body.userId){
      let date=new Date().toISOString().split('T')[0];
      const sql = `INSERT INTO \`Vacansi\` (\`name\`, \`about\`,\`cost\`,\`need\`,\`userId\`,\`type\`,\`location\`,\`date\`) VALUES (?,?,?,?,?,?,?,?)`;

      db.run(sql,[req.body.name,req.body.about,req.body.cost,req.body.need,req.body.userId,req.body.type,req.body.location,date], async function(err, result) {
        res.end(JSON.stringify(true));
      });
    }  
    else{
      res.end(JSON.stringify(false));
    }
});
app.post('/api/addMessage', (req, res) => {
    if(req.body.user1){
      let date=new Date().toISOString().split('T')[0];
      const sql = `INSERT INTO \`Message\` (\`text\`,\`user1\`,\`user2\`,\`date\`) VALUES (?,?,?,?)`;

      db.run(sql,[req.body.text,req.body.user1,req.body.user2,date], async function(err, result) {
        res.end(JSON.stringify(true));
      });
    }  
    else{
      res.end(JSON.stringify(false));
    }
});
app.post('/api/addComm', (req, res) => {
    if(req.body.userId && req.body.workId){
      const sqlCheck = `SELECT * FROM \`Option\` WHERE \`profileID\`=? AND \`userId\`=?`;

      db.all(sqlCheck,[req.body.workId,req.body.userId], async function(err, resultSelect) {
        if(!resultSelect[0]){
          let date=new Date().toISOString().split('T')[0];
          const sql = `INSERT INTO \`Option\` (\`text\`,\`profileID\`,\`userId\`,\`date\`) VALUES (?,?,?,?)`;

          db.run(sql,[req.body.text,req.body.workId,req.body.userId,date], async function(err, result) {
            res.end(JSON.stringify(true));
          });
        }
        else{
          res.end(JSON.stringify(false));
        }
      })
    }
    else{
      res.end(JSON.stringify(false));
    }   
});
app.post('/api/addUser', (req, res) => {
  const sql = `SELECT * FROM \`user\` WHERE \`name\`=?`;

  db.all(sql,[req.body.name], async function(err, result) {
    if(result.length==0){
      let hashedPassword = await bcrypt.hash(req.body.password, 10);
      let date=new Date().toISOString().split('T')[0];
      const sqlAdd = `INSERT INTO \`user\` (\`name\`, \`password\`,\`role\`,\`email\`,\`phone\`,\`date\`) VALUES (?,?,?,?,?,?)`;
      
      db.run(sqlAdd,[req.body.name,hashedPassword,req.body.role,req.body.email,req.body.phone,date], async function(err, resultAdd) {
        db.all(sql,[req.body.name], async function(err, resultSelect) {
          res.end(JSON.stringify(resultSelect[0].id));
        })
      })
    }
    else{
      res.end(JSON.stringify(false));
    }
  });
});
app.post('/api/getProfil', (req, res) => {
  if(req.body.userId){
    const sql = `SELECT * FROM \`user\` WHERE \`id\`=?`;
    db.all(sql,[req.body.userId], async function(err, result) {
      res.end(JSON.stringify(result));
  });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getWork', (req, res) => {
  if(req.body.userId){
    const sql = `SELECT * FROM \`profile\` WHERE \`userId\`=?`;
    db.all(sql,[req.body.userId], async function(err, result) {
      res.end(JSON.stringify(result));
  });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getMessage', (req, res) => {
  if(req.body.user1){
    const sql = `SELECT * FROM \`Message\` WHERE (\`user1\`=? AND \`user2\`=?) OR (\`user2\`=? AND \`user1\`=?)`;
    db.all(sql,[req.body.user1,req.body.user2,req.body.user1,req.body.user2], async function(err, result) {
      if(result[0]){
        res.end(JSON.stringify(result));
      }
      else{
        res.end(JSON.stringify(false));
      }
  });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getVack', (req, res) => {
  if(req.body.userId){
    const sql = `SELECT * FROM \`Vacansi\` WHERE \`userId\`=?`;
    db.all(sql,[req.body.userId], async function(err, result) {
      res.end(JSON.stringify(result));
  });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getOneWork', (req, res) => {
  if(req.body.workId){
    const sql = `SELECT * FROM \`profile\` WHERE \`id_profile\`=?`;
    db.all(sql,[req.body.workId], async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getOneVack', (req, res) => {
  if(req.body.vackId){
    const sql = `SELECT * FROM \`Vacansi\` WHERE \`id\`=?`;
    db.all(sql,[req.body.vackId], async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getOneComm', async (req, res) => {
  if(req.body.commId){
    const sql = `SELECT * FROM \`Option\` WHERE \`id\`=?`;
    db.all(sql,[req.body.commId], async function(err, result) {
        res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getComm', (req, res) => {
  if(req.body.workId){
    const sql = `SELECT * FROM \`Option\` JOIN \`user\` ON \`user\`.\`id\`= \`Option\`.\`userId\` WHERE \`Option\`.\`profileID\`=?`;
    db.all(sql,[req.body.workId], async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/setRaiting', async (req, res) => {
  if(req.body.workId){
    const sql = `SELECT \`point\`, \`rating\` FROM \`profile\` WHERE \`id_profile\` = ?`;
    db.all(sql,[req.body.workId], async function(err, result) {
      let point=result[0].point+1;
      let rating=result[0].rating+req.body.rating;
      let sqlUpdate=`UPDATE \`profile\` SET \`point\` = ${point},\`rating\` = ${rating} WHERE \`id_profile\`=?`;
      db.run(sqlUpdate,[req.body.workId], async function(err, result) {
        res.end(JSON.stringify(true));
      });
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getOneView', async (req, res) => {
  if(req.body.workId){
    const sql = `SELECT * FROM \`profile\` WHERE \`id_profile\`=?`;
    db.all(sql,[req.body.workId], async function(err, result) {
      let view=result[0].view+1;
      let sqlUpdate=`UPDATE \`profile\` SET \`view\` = ${view} WHERE \`id_profile\`=?`;
      db.run(sqlUpdate,[req.body.workId], async function(err, result) {
        res.end(JSON.stringify(view));
      });
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getAllKat', (req, res) => {
    const sql = `SELECT \`kategory\` FROM \`profile\` GROUP BY \`kategory\``;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
});
app.post('/api/getAllType', (req, res) => {
    const sql = `SELECT \`type\` FROM \`Vacansi\` GROUP BY \`type\``;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
});
app.post('/api/getAllDate', (req, res) => {
    const sql = `SELECT \`date\` FROM \`Vacansi\` GROUP BY \`date\``;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
});
app.post('/api/getAllWork', (req, res) => {
  if(req.body.userId){
    const sql = `SELECT * FROM \`user\` WHERE \`id\`='${req.body.userId}'`;
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
app.post('/api/getAllUser', (req, res) => {
  if(req.body.userId){
    const sql = `SELECT * FROM \`user\``;
    db.all(sql, async function(err, result) {
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getAllMessage', (req, res) => {
  if(req.body.user1){
    const sql = `
      SELECT
    id,
    CASE
        WHEN user1 = ? THEN user1
        ELSE user2
    END AS user1,
    CASE
        WHEN user1 = ? THEN user2
        ELSE user1
    END AS user2,
    text,
    date
FROM
    \`Message\`
WHERE
    user1 = ? OR user2 = ?
GROUP BY
    CASE
        WHEN user1 = ? THEN user2
        ELSE user1
    END,
    text,
    date
ORDER BY
    date ASC;
    `;
    db.all(sql,[req.body.user1, req.body.user1, req.body.user1, req.body.user1, req.body.user1], async function(err, result) {
      console.log(err);
      res.end(JSON.stringify(result));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/getAllVack', (req, res) => {
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
});
app.post('/api/banned', (req, res) => {
  if(req.body.userId){
    const sql = `UPDATE \`user\` SET \`ban\` = 'ban' WHERE \`id\`=?`;
    
    db.run(sql,[req.body.userId], async function(err, result) {
      res.end(JSON.stringify(true));
    });
  }
  else{
    res.end(JSON.stringify(false));
  }
});
app.post('/api/unBanned', (req, res) => {
  if(req.body.userId){
    const sql = `UPDATE \`user\` SET \`ban\` = 'unban' WHERE \`id\`=?`;
    
    db.run(sql,[req.body.userId], async function(err, result) {
      res.end(JSON.stringify(true));
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