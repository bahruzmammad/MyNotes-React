import db from "../config/database.js";

export function getAllNotes(userId, callback) {
  const query = `
    SELECT
      id,
      user_id,
      title,
      content,
      category,
      is_pinned,
      is_archived,
      created_at,
      updated_at
    FROM notes
    WHERE user_id = ?
    ORDER BY
      is_pinned DESC,
      COALESCE(updated_at, created_at, '') DESC,
      id DESC
  `;

  db.all(query, [userId], callback);
}

export function getNoteById(id, userId, callback) {
  const query = `
    SELECT
      id,
      user_id,
      title,
      content,
      category,
      is_pinned,
      is_archived,
      created_at,
      updated_at
    FROM notes
    WHERE id = ?
      AND user_id = ?
  `;

  db.get(query, [id, userId], callback);
}

export function createNote(
  userId,
  title,
  content,
  category = "general",
  callback,
) {
  const query = `
    INSERT INTO notes (
      user_id,
      title,
      content,
      category,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  db.run(query, [userId, title, content, category], function (err) {
    callback(err, this);
  });
}

export function updateNote(id, userId, title, content, category, callback) {
  const query = `
    UPDATE notes
    SET
      title = ?,
      content = ?,
      category = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND user_id = ?
  `;

  db.run(query, [title, content, category, id, userId], function (err) {
    callback(err, this);
  });
}

export function patchNote(id, userId, fields, callback) {
  const allowedFields = [
    "title",
    "content",
    "category",
    "is_pinned",
    "is_archived",
  ];

  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      updates.push(`${field} = ?`);
      values.push(fields[field]);
    }
  }

  if (updates.length === 0) {
    return callback(new Error("Yenilənəcək sahə yoxdur."));
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");

  const query = `
    UPDATE notes
    SET ${updates.join(", ")}
    WHERE id = ?
      AND user_id = ?
  `;

  values.push(id, userId);

  db.run(query, values, function (err) {
    callback(err, this);
  });
}

export function deleteNote(id, userId, callback) {
  const query = `
    DELETE FROM notes
    WHERE id = ?
      AND user_id = ?
  `;

  db.run(query, [id, userId], function (err) {
    callback(err, this);
  });
}
