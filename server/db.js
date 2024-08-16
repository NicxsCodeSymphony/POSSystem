const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./pos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) =>{ 
    if(err){
        console.error(err.message)
    }else{
        console.log('Connected to the SQLite Database')
    }
})

db.run(`CREATE TABLE IF NOT EXISTS history(
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchased_item TEXT,
        initial_total FLOAT,
        total FLOAT,
        discount FLOAT,
        time DATETIME
    )`)

module.exports = db;