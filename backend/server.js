import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";

dotenv.config();

const sql = sqlite3.verbose();
const app = express();

const PORT = process.env.PORT || 5000;
const DB_PATH = "./notes.db";

// ============================================================
// COLORS
// ============================================================

const colors = {
  reset: "\x1b[0m",

  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  brightBlack: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
};

// ============================================================
// LOGGER
// ============================================================

const log = {
  info(message) {
    console.log(`${colors.brightCyan}[INFO]${colors.reset} ${message}`);
  },

  success(message) {
    console.log(`${colors.brightGreen}[SUCCESS]${colors.reset} ${message}`);
  },

  warn(message) {
    console.log(`${colors.brightYellow}[WARN]${colors.reset} ${message}`);
  },

  error(message) {
    console.error(`${colors.brightRed}[ERROR]${colors.reset} ${message}`);
  },

  request(method, url, status, duration) {
    console.log(
      `${colors.brightBlue}[REQUEST]${colors.reset} ` +
        `${colors.brightMagenta}${method}${colors.reset} ` +
        `${colors.brightWhite}${url}${colors.reset} ` +
        `${colors.brightGreen}${status}${colors.reset} ` +
        `${colors.brightBlack}(${duration}ms)${colors.reset}`,
    );
  },
};

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ============================================================
// REQUEST LOGGER
// ============================================================

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    log.request(req.method, req.originalUrl, res.statusCode, duration);
  });

  next();
});

// ============================================================
// DATABASE
// ============================================================

const db = new sql.Database(DB_PATH, (err) => {
  if (err) {
    log.error(`SQLite connection error: ${err.message}`);
    return;
  }

  log.success("SQLite bazasına uğurla qoşuldu.");

  initializeDatabase();
});

// ============================================================
// DATABASE INITIALIZATION
// ============================================================

function initializeDatabase() {
  db.run(
    `
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    (err) => {
      if (err) {
        log.error(`notes table creation error: ${err.message}`);
        return;
      }

      log.success("notes cədvəli hazırdır.");

      ensureColumns();
    },
  );
}

// ============================================================
// ENSURE OLD DATABASE COLUMNS
// ============================================================

function ensureColumns() {
  db.all("PRAGMA table_info(notes)", [], (err, columns) => {
    if (err) {
      log.error(`Database schema error: ${err.message}`);
      return;
    }

    const columnNames = columns.map((column) => column.name);

    const addCreatedAt = !columnNames.includes("created_at");
    const addUpdatedAt = !columnNames.includes("updated_at");

    if (!addCreatedAt && !addUpdatedAt) {
      log.success("Database schema yoxlanıldı.");
      return;
    }

    if (addCreatedAt) {
      db.run(
        `
          ALTER TABLE notes
          ADD COLUMN created_at DATETIME
        `,
        (alterErr) => {
          if (alterErr) {
            log.error(`created_at əlavə edilə bilmədi: ${alterErr.message}`);
          } else {
            log.success("created_at sütunu əlavə edildi.");
          }

          addUpdatedAtColumn();
        },
      );
    } else {
      addUpdatedAtColumn();
    }

    function addUpdatedAtColumn() {
      if (!addUpdatedAt) {
        return;
      }

      db.run(
        `
          ALTER TABLE notes
          ADD COLUMN updated_at DATETIME
        `,
        (alterErr) => {
          if (alterErr) {
            log.error(`updated_at əlavə edilə bilmədi: ${alterErr.message}`);
          } else {
            log.success("updated_at sütunu əlavə edildi.");
          }
        },
      );
    }
  });
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API işləyir.",
    database: "SQLite",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// GET ALL NOTES
// GET /api/notes
// ============================================================

app.get("/api/notes", (req, res) => {
  const query = `
    SELECT
      id,
      title,
      content,
      created_at,
      updated_at
    FROM notes
    ORDER BY
      COALESCE(created_at, '') DESC,
      id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      log.error(`GET /api/notes error: ${err.message}`);

      return res.status(500).json({
        success: false,
        error: "Qeydləri oxumaq mümkün olmadı.",
        details: err.message,
      });
    }

    log.info(`${rows.length} qeyd tapıldı.`);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  });
});

// ============================================================
// GET NOTE BY ID
// GET /api/notes/:id
// ============================================================

app.get("/api/notes/:id", (req, res) => {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({
      success: false,
      error: "ID rəqəm olmalıdır.",
    });
  }

  db.get(
    `
      SELECT
        id,
        title,
        content,
        created_at,
        updated_at
      FROM notes
      WHERE id = ?
    `,
    [id],
    (err, row) => {
      if (err) {
        log.error(`GET /api/notes/${id} error: ${err.message}`);

        return res.status(500).json({
          success: false,
          error: "Qeyd oxunarkən xəta baş verdi.",
          details: err.message,
        });
      }

      if (!row) {
        log.warn(`Qeyd tapılmadı. ID: ${id}`);

        return res.status(404).json({
          success: false,
          error: "Qeyd tapılmadı.",
        });
      }

      res.status(200).json({
        success: true,
        data: row,
      });
    },
  );
});

// ============================================================
// CREATE NOTE
// POST /api/notes
// ============================================================

app.post("/api/notes", (req, res) => {
  const { title, content } = req.body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "title tələb olunur.",
    });
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "content tələb olunur.",
    });
  }

  const cleanTitle = title.trim();
  const cleanContent = content.trim();

  const query = `
    INSERT INTO notes (
      title,
      content,
      created_at,
      updated_at
    )
    VALUES (
      ?,
      ?,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `;

  db.run(query, [cleanTitle, cleanContent], function (err) {
    if (err) {
      log.error(`POST /api/notes error: ${err.message}`);

      return res.status(500).json({
        success: false,
        error: "Qeyd yaradılarkən xəta baş verdi.",
        details: err.message,
      });
    }

    log.success(`Yeni qeyd yaradıldı. ID: ${this.lastID}`);

    db.get(
      `
          SELECT
            id,
            title,
            content,
            created_at,
            updated_at
          FROM notes
          WHERE id = ?
        `,
      [this.lastID],
      (selectErr, row) => {
        if (selectErr) {
          return res.status(201).json({
            success: true,
            message: "Qeyd uğurla yaradıldı.",
            data: {
              id: this.lastID,
              title: cleanTitle,
              content: cleanContent,
            },
          });
        }

        res.status(201).json({
          success: true,
          message: "Qeyd uğurla yaradıldı.",
          data: row,
        });
      },
    );
  });
});

// ============================================================
// UPDATE NOTE
// PUT /api/notes/:id
// ============================================================

app.put("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({
      success: false,
      error: "ID rəqəm olmalıdır.",
    });
  }

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "title tələb olunur.",
    });
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "content tələb olunur.",
    });
  }

  const cleanTitle = title.trim();
  const cleanContent = content.trim();

  const query = `
    UPDATE notes
    SET
      title = ?,
      content = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [cleanTitle, cleanContent, id], function (err) {
    if (err) {
      log.error(`PUT /api/notes/${id} error: ${err.message}`);

      return res.status(500).json({
        success: false,
        error: "Qeyd yenilənərkən xəta baş verdi.",
        details: err.message,
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Qeyd tapılmadı.",
      });
    }

    log.success(`Qeyd yeniləndi. ID: ${id}`);

    db.get(
      `
          SELECT
            id,
            title,
            content,
            created_at,
            updated_at
          FROM notes
          WHERE id = ?
        `,
      [id],
      (selectErr, row) => {
        if (selectErr) {
          return res.status(200).json({
            success: true,
            message: "Qeyd uğurla yeniləndi.",
            data: {
              id: Number(id),
              title: cleanTitle,
              content: cleanContent,
            },
          });
        }

        res.status(200).json({
          success: true,
          message: "Qeyd uğurla yeniləndi.",
          data: row,
        });
      },
    );
  });
});

// ============================================================
// PATCH NOTE
// PATCH /api/notes/:id
// ============================================================

app.patch("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({
      success: false,
      error: "ID rəqəm olmalıdır.",
    });
  }

  if (title === undefined && content === undefined) {
    return res.status(400).json({
      success: false,
      error: "Yeniləmək üçün title və ya content göndərilməlidir.",
    });
  }

  if (title !== undefined && typeof title !== "string") {
    return res.status(400).json({
      success: false,
      error: "title string olmalıdır.",
    });
  }

  if (content !== undefined && typeof content !== "string") {
    return res.status(400).json({
      success: false,
      error: "content string olmalıdır.",
    });
  }

  db.get("SELECT * FROM notes WHERE id = ?", [id], (err, note) => {
    if (err) {
      log.error(`PATCH /api/notes/${id} error: ${err.message}`);

      return res.status(500).json({
        success: false,
        error: "Qeyd tapılarkən xəta baş verdi.",
        details: err.message,
      });
    }

    if (!note) {
      return res.status(404).json({
        success: false,
        error: "Qeyd tapılmadı.",
      });
    }

    const newTitle = title !== undefined ? title.trim() : note.title;

    const newContent = content !== undefined ? content.trim() : note.content;

    if (newTitle.length === 0) {
      return res.status(400).json({
        success: false,
        error: "title boş ola bilməz.",
      });
    }

    if (newContent.length === 0) {
      return res.status(400).json({
        success: false,
        error: "content boş ola bilməz.",
      });
    }

    db.run(
      `
          UPDATE notes
          SET
            title = ?,
            content = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
      [newTitle, newContent, id],
      function (updateErr) {
        if (updateErr) {
          log.error(
            `PATCH /api/notes/${id} update error: ${updateErr.message}`,
          );

          return res.status(500).json({
            success: false,
            error: "Qeyd yenilənə bilmədi.",
            details: updateErr.message,
          });
        }

        log.success(`Qeyd qismən yeniləndi. ID: ${id}`);

        db.get(
          `
              SELECT
                id,
                title,
                content,
                created_at,
                updated_at
              FROM notes
              WHERE id = ?
            `,
          [id],
          (selectErr, row) => {
            if (selectErr) {
              return res.status(200).json({
                success: true,
                message: "Qeyd uğurla yeniləndi.",
                data: {
                  id: Number(id),
                  title: newTitle,
                  content: newContent,
                },
              });
            }

            res.status(200).json({
              success: true,
              message: "Qeyd uğurla yeniləndi.",
              data: row,
            });
          },
        );
      },
    );
  });
});

// ============================================================
// DELETE NOTE
// DELETE /api/notes/:id
// ============================================================

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({
      success: false,
      error: "ID rəqəm olmalıdır.",
    });
  }

  db.run("DELETE FROM notes WHERE id = ?", [id], function (err) {
    if (err) {
      log.error(`DELETE /api/notes/${id} error: ${err.message}`);

      return res.status(500).json({
        success: false,
        error: "Qeyd silinərkən xəta baş verdi.",
        details: err.message,
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Qeyd tapılmadı.",
      });
    }

    log.success(`Qeyd silindi. ID: ${id}`);

    res.status(200).json({
      success: true,
      message: "Qeyd uğurla silindi.",
      deletedId: Number(id),
    });
  });
});

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  log.warn(`404 Route: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    error: "Endpoint tapılmadı.",
    path: req.originalUrl,
    method: req.method,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  log.error(`Unhandled error: ${err.stack || err.message}`);

  res.status(500).json({
    success: false,
    error: "Serverdə gözlənilməz xəta baş verdi.",
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log("");

  console.log(
    `${colors.brightCyan}========================================${colors.reset}`,
  );

  console.log(`${colors.brightGreen}          NOTES API SERVER${colors.reset}`);

  console.log(
    `${colors.brightCyan}========================================${colors.reset}`,
  );

  console.log(`${colors.brightWhite}PORT:${colors.reset} ${PORT}`);

  console.log(
    `${colors.brightWhite}URL:${colors.reset} http://localhost:${PORT}`,
  );

  console.log(
    `${colors.brightWhite}HEALTH:${colors.reset} http://localhost:${PORT}/api/health`,
  );

  console.log(
    `${colors.brightWhite}API:${colors.reset} http://localhost:${PORT}/api/notes`,
  );

  console.log(
    `${colors.brightCyan}========================================${colors.reset}`,
  );

  console.log("");
});
