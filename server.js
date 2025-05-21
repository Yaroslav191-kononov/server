const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const httpsLocalhost = require("https-localhost");
const https = require('https');
const fs = require('fs');
const redis = require('redis');
const { createClient } = redis; // Правильный импорт createClient
const { RedisStore } = require('connect-redis');

const app = express();

console.log('REDIS_URL:', process.env.REDIS_URL); // <-- Добавлено для проверки

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

let redisStore; // Объявите redisStore здесь

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis подключен!');

    redisStore = new RedisStore({ // Инициализируйте после подключения
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
    const corsOptions = {
      origin: [
        'https://localhost',
        'http://localhost:8100'
      ],
      credentials: true,
    };
    app.use(cors(corsOptions));
    const db = new sqlite3.Database('mydatabase.db', (err) => {
      if (err) {
        console.error('Ошибка при открытии базы данных:', err);
      } else {
        console.log('✅ База данных подключена!');
      }
    });
    app.use(bodyParser.json());

    // Маршруты
    app.post('/api/check', async (req, res) => {
      const sql = `SELECT * FROM \`user\` WHERE \`name\`='${req.body.name}'`;
      db.all(sql, async (err, result) => { // Добавлена обработка ошибок для db.all
        if (err) {
          console.error('Ошибка в /api/check:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }
        if (result.length === 0) {
          res.end(JSON.stringify(false));
        } else {
          let passwordMatch = await bcrypt.compare(req.body.password, result[0].password);
          if (passwordMatch) {
            req.session.userId = result[0].id;
            res.end(JSON.stringify(true));
          } else {
            res.end(JSON.stringify(false));
          }
        }
      });
    });

    // Остальные маршруты (с добавлением обработки ошибок для db.run и db.all)

    // Запуск сервера
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`✅ Server listening on port ${port}`);
    });

  } catch (err) {
    console.error('❌ Не удалось подключиться к Redis:', err);
  }
})();