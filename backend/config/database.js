import sqlite3 from "sqlite3"
import { log } from "../utils/logger.js"

const sqlite = sqlite3.verbose()

const dbPath = process.env.DB_PATH || "./notes.db"

const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        log.error(`SQLite bağlantı xətası: ${err.message}`)
        return
    }

    log.success(`SQLite bazasına uğurla qoşuldu: ${dbPath}`)
})

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON", (err) => {
        if (err) {
            log.error(`Foreign keys aktivləşdirilmədi: ${err.message}`)
            return
        }

        log.success("SQLite foreign keys aktivdir.")
    })

    db.run(
        `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_url TEXT DEFAULT NULL,
      bio TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `,
        (err) => {
            if (err) {
                log.error(`users cədvəli yaradılmadı: ${err.message}`)
                return
            }

            log.success("users cədvəli hazırdır.")
        },
    )

    db.run(
        `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      is_pinned INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )
    `,
        (err) => {
            if (err) {
                log.error(`notes cədvəli yaradılmadı: ${err.message}`)
                return
            }

            log.success("notes cədvəli hazırdır.")
        },
    )
})

export default db
