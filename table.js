const sqlite3 = require('sqlite3');
const { verbose } = sqlite3;
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('mydatabase.db');

const createTableProfile = ` 
    CREATE TABLE IF NOT EXISTS profile ( 
        id_profile INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL,
        tag TEXT NOT NULL,
        kategory TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        like INTEGER NOT NULL,
        view INTEGER NOT NULL,
        userId INTEGER NOT NULL
    )`;  

db.run(createTableProfile, (err) => { 
    if (err) { 
        return console.error('Ошибка создания таблицы:', err.message); 
    }
    else{
        console.log('Таблица создана успешно');
    }
});

const createTableUser = ` 
    CREATE TABLE IF NOT EXISTS user ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, 
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        ban TEXT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL
    )`; 

db.run(createTableUser, (err) => { 
    if (err) { 
        return console.error('Ошибка создания таблицы:', err.message); 
    }
    else{
        console.log('Таблица создана успешно'); 
    }
});

const createTableVacansi = ` 
    CREATE TABLE IF NOT EXISTS Vacansi ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, 
        about TEXT NOT NULL,
        cost TEXT NOT NULL,
        need TEXT NOT NULL,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        userId INTEGER NOT NULL,
        date TEXT NOT NULL
    )`; 

db.run(createTableVacansi, (err) => { 
    if (err) { 
        return console.error('Ошибка создания таблицы:', err.message); 
    }
    else{
        console.log('Таблица создана успешно'); 
    }
});

const createTableOption = ` 
    CREATE TABLE IF NOT EXISTS Option ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileID TEXT NOT NULL,
        userId INTEGER NOT NULL,
        text TEXT NOT NULL,
        date TEXT NOT NULL
    )`; 
    
db.run(createTableOption, (err) => { 
    if (err) { 
        return console.error('Ошибка создания таблицы:', err.message); 
    }
    else{
        console.log('Таблица создана успешно'); 
    }
});
async function addAdmin(name, password, email, phone, date, callback) {
    let hashedPassword = await bcrypt.hash(password, 10);
    const insertAdmin = `INSERT INTO \`user\` (\`name\`, \`password\`, \`role\`, \`email\`, \`phone\`, \`date\`) VALUES (?, ?, ?, ?, ?, ?)`;

    const adminRole = 'admin';  // Или другое значение, обозначающее роль администратора

    db.run(insertAdmin, [name, hashedPassword, adminRole, email, phone, date], function(err) {
        if (err) {
            console.error('Ошибка добавления администратора:', err.message);
            return callback(err);
        }
        console.log(`Администратор ${name} добавлен с ID: ${this.lastID}`);
        callback(null, this.lastID);
    });
}

addAdmin('admin', 'password123', 'admin@example.com', '123-456-7890', new Date().toISOString(), (err, adminId) => {
    if (err) {
        console.error('Не удалось добавить администратора:', err);
    } else {
        console.log(`Администратор успешно добавлен с ID: ${adminId}`);
    }
});