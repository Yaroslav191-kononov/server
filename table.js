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
        point INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        view INTEGER NOT NULL,
        userId INTEGER NOT NULL
    )`;  

const createTableUser = ` 
    CREATE TABLE IF NOT EXISTS user ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, 
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        ban TEXT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        verification TEXT NOT NULL,
        date TEXT NOT NULL
    )`; 

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

const createTableOption = ` 
    CREATE TABLE IF NOT EXISTS Option ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profileID TEXT NOT NULL,
        userId INTEGER NOT NULL,
        text TEXT NOT NULL,
        date TEXT NOT NULL
    )`; 

const createTableMessage = ` 
    CREATE TABLE IF NOT EXISTS Message ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1 INTEGER NOT NULL,
        user2 INTEGER NOT NULL,
        text TEXT NOT NULL,
        date TEXT NOT NULL
    )`; 

async function addAdmin(db,name, password, email, phone, date, callback) {
    let hashedPassword = await bcrypt.hash(password, 10);
    const insertAdmin = `INSERT INTO \`user\` (\`name\`, \`password\`, \`role\`, \`email\`, \`phone\`, \`date\`,\`verification\`) VALUES (?, ?, ?, ?, ?, ?,'yes')`;

    const adminRole = 'admin';

    db.run(insertAdmin, [name, hashedPassword, adminRole, email, phone, date], function(err) {
        if (err) {
            console.error('Ошибка добавления администратора:', err.message);
            return callback(err);
        }
        console.log(`Администратор ${name} добавлен с ID: ${this.lastID}`);
        callback(null, this.lastID);
    });
}

function insertUser(db, name, password, role, email, phone, verification, date, callback) {
    const sql = `INSERT INTO user (name, password, role, ban, email, phone, verification, date) VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`;
    db.run(sql, [name, password, role, email, phone, verification, date], function (err) {
        if (err) {
            console.error("Error inserting user:", err.message);
        } else {
            console.log(`User ${name} inserted with id: ${this.lastID}`);
        }
        callback(err, this.lastID);
    });
}


function insertProfile(db, name, tag, kategory, date, type, userId, callback) {
    const sql = `INSERT INTO profile (name, tag, kategory, date, type, point, rating, view, userId) VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)`;
    db.run(sql, [name, tag, kategory, date, type, userId], function (err) {
        if (err) {
            console.error("Error inserting profile:", err.message);
        } else {
            console.log(`Profile ${name} inserted with id: ${this.lastID}`);
        }
        callback(err);
    });
}

function insertVacancy(db, name, about, cost, need, type, location, userId, date, callback) {
    const sql = `INSERT INTO Vacansi (name, about, cost, need, type, location, userId, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, about, cost, need, type, location, userId, date], function (err) {
        if (err) {
            console.error("Error inserting vacancy:", err.message);
        } else {
            console.log(`Vacancy ${name} inserted with id: ${this.lastID}`);
        }
        callback(err);
    });
}
const users = [
    { name: "Employer1", password: "password1", role: "boss", email: "employer1@example.com", phone: "123-456-7890", verification: "yes", date: "2024-01-01" },
    { name: "Employer2", password: "password2", role: "boss", email: "employer2@example.com", phone: "987-654-3210", verification: "yes", date: "2024-01-02" },
    { name: "Student1", password: "password3", role: "student", email: "student1@example.com", phone: "555-123-4567", verification: "yes", date: "2024-01-03" },
    { name: "Student2", password: "password4", role: "student", email: "student2@example.com", phone: "111-222-3333", verification: "yes", date: "2024-01-04" }
];

const profiles = [
    { name: "Software Engineer", tag: "Java, Python", kategory: "IT", date: "2024-01-10", type: "vacancy" },
    { name: "Web Developer", tag: "HTML, CSS, JavaScript", kategory: "IT", date: "2024-01-11", type: "vacancy" },

    { name: "Marketing Manager", tag: "SEO, Social Media", kategory: "Marketing", date: "2024-01-12", type: "vacancy" },
    { name: "Sales Representative", tag: "Sales, Customer Service", kategory: "Sales", date: "2024-01-13", type: "vacancy" },
];

const vacancies = [
    { name: "Software Engineer", about: "Develop software", cost: "100000", need: "Java, Python", type: "Full-time", location: "Remote", date: "2024-01-10" },
    { name: "Web Developer", about: "Develop websites", cost: "80000", need: "HTML, CSS, JavaScript", type: "Full-time", location: "On-site", date: "2024-01-11" },

    { name: "Marketing Manager", about: "Manage marketing campaigns", cost: "120000", need: "SEO, Social Media", type: "Full-time", location: "On-site", date: "2024-01-12" },
    { name: "Sales Representative", about: "Sell products", cost: "60000", need: "Sales, Customer Service", type: "Full-time", location: "Hybrid", date: "2024-01-13" },
];
db.serialize(async () => {
    db.run(createTableProfile, (err) => { 
        if (err) { 
            return console.error('Ошибка создания таблицы:', err.message); 
        }
        else{
            console.log('Таблица создана успешно');
        }
    });
    
    db.run(createTableMessage, (err) => { 
        if (err) { 
            return console.error('Ошибка создания таблицы:', err.message); 
        }
        else{
            console.log('Таблица создана успешно'); 
        }
    });
    db.run(createTableUser, (err) => { 
        if (err) { 
            return console.error('Ошибка создания таблицы:', err.message); 
        }
        else{
            console.log('Таблица создана успешно'); 
        }
    });
    db.run(createTableVacansi, (err) => { 
        if (err) { 
            return console.error('Ошибка создания таблицы:', err.message); 
        }
        else{
            console.log('Таблица создана успешно'); 
        }
    });
    db.run(createTableOption, (err) => { 
        if (err) { 
            return console.error('Ошибка создания таблицы:', err.message); 
        }
        else{
            console.log('Таблица создана успешно'); 
        }
    });
    await addAdmin(db,'admin', 'password123', 'admin@example.com', '123-456-7890', new Date().toISOString(), (err, adminId) => {
        if (err) {
            console.error('Не удалось добавить администратора:', err);
        } else {
            console.log(`Администратор успешно добавлен с ID: ${adminId}`);
        }
    });
    users.forEach((user, index) => {
        insertUser(db, user.name, user.password, user.role, user.email, user.phone, user.verification, user.date, (err, userId) => {
            if (err) {
                return;
            }
            if(index>=2){
              const userProfiles = profiles.filter((profile, i) => {
                  if (index === 2 && i < 2) return profile;
                  if (index === 3 && i >= 2 && i < 4) return profile;
              });

              userProfiles.forEach(profile => {
                  insertProfile(db, profile.name, profile.tag, profile.kategory, profile.date, profile.type, userId, (err) => {
                      if (err) {
                          return;
                      }
                  });
              });
            }
            if(index<2){
              const userVacancies = vacancies.filter((vacancy, i) => {
                  if (index === 0 && i < 2) return vacancy;
                  if (index === 1 && i >= 2 && i < 4) return vacancy;
              });

              userVacancies.forEach(vacancy => {
                  insertVacancy(db, vacancy.name, vacancy.about, vacancy.cost, vacancy.need, vacancy.type, vacancy.location, userId, vacancy.date, (err) => {
                      if (err) {
                          return;
                      }
                  });
              });
            }
        });
    });
})