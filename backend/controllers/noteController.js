import {
  getAllNotes as getAllNotesModel,
  getNoteById as getNoteByIdModel,
  createNote as createNoteModel,
  updateNote as updateNoteModel,
  patchNote as patchNoteModel,
  deleteNote as deleteNoteModel,
} from "../models/noteModel.js";

import { log } from "../utils/logger.js";

export function getNotes(req, res, next) {
  const userId = req.user.userId;

  getAllNotesModel(userId, (err, notes) => {
    if (err) {
      log.error(`Notes GET xətası: ${err.message}`);
      return next(err);
    }

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  });
}

export function getNote(req, res, next) {
  const userId = req.user.userId;
  const noteId = Number(req.params.id);

  if (!Number.isInteger(noteId) || noteId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Yanlış note ID.",
    });
  }

  getNoteByIdModel(noteId, userId, (err, note) => {
    if (err) {
      log.error(`Note GET xətası: ${err.message}`);
      return next(err);
    }

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note tapılmadı.",
      });
    }

    return res.status(200).json({
      success: true,
      data: note,
    });
  });
}

export function createNote(req, res, next) {
  const userId = req.user.userId;

  const { title, content, category = "general" } = req.body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title tələb olunur.",
    });
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Content tələb olunur.",
    });
  }

  createNoteModel(
    userId,
    title.trim(),
    content.trim(),
    typeof category === "string" ? category.trim() : "general",
    (err, result) => {
      if (err) {
        log.error(`Note CREATE xətası: ${err.message}`);
        return next(err);
      }

      return res.status(201).json({
        success: true,
        message: "Note yaradıldı.",
        data: {
          id: result.lastID,
          user_id: userId,
          title: title.trim(),
          content: content.trim(),
          category: typeof category === "string" ? category.trim() : "general",
        },
      });
    },
  );
}

export function updateNote(req, res, next) {
  const userId = req.user.userId;
  const noteId = Number(req.params.id);

  const { title, content, category = "general" } = req.body;

  if (!Number.isInteger(noteId) || noteId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Yanlış note ID.",
    });
  }

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title tələb olunur.",
    });
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Content tələb olunur.",
    });
  }

  updateNoteModel(
    noteId,
    userId,
    title.trim(),
    content.trim(),
    typeof category === "string" ? category.trim() : "general",
    (err, result) => {
      if (err) {
        log.error(`Note PUT xətası: ${err.message}`);
        return next(err);
      }

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Note tapılmadı və ya sizə aid deyil.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Note yeniləndi.",
      });
    },
  );
}

export function patchNote(req, res, next) {
  const userId = req.user.userId;
  const noteId = Number(req.params.id);

  if (!Number.isInteger(noteId) || noteId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Yanlış note ID.",
    });
  }

  const body = req.body || {};

  if (
    body.title !== undefined &&
    (typeof body.title !== "string" || body.title.trim().length === 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Title düzgün deyil.",
    });
  }

  if (
    body.content !== undefined &&
    (typeof body.content !== "string" || body.content.trim().length === 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Content düzgün deyil.",
    });
  }

  const fields = {
    ...body,
  };

  if (typeof fields.title === "string") {
    fields.title = fields.title.trim();
  }

  if (typeof fields.content === "string") {
    fields.content = fields.content.trim();
  }

  if (typeof fields.category === "string") {
    fields.category = fields.category.trim();
  }

  if (fields.is_pinned !== undefined) {
    fields.is_pinned = fields.is_pinned ? 1 : 0;
  }

  if (fields.is_archived !== undefined) {
    fields.is_archived = fields.is_archived ? 1 : 0;
  }

  patchNoteModel(noteId, userId, fields, (err, result) => {
    if (err) {
      log.error(`Note PATCH xətası: ${err.message}`);
      return next(err);
    }

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Note tapılmadı və ya sizə aid deyil.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note yeniləndi.",
    });
  });
}

export function deleteNote(req, res, next) {
  const userId = req.user.userId;
  const noteId = Number(req.params.id);

  if (!Number.isInteger(noteId) || noteId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Yanlış note ID.",
    });
  }

  deleteNoteModel(noteId, userId, (err, result) => {
    if (err) {
      log.error(`Note DELETE xətası: ${err.message}`);
      return next(err);
    }

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Note tapılmadı və ya sizə aid deyil.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note silindi.",
    });
  });
}
