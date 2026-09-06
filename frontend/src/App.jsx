import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // GET ALL NOTES
  // ============================================================

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Qeydləri oxumaq mümkün olmadı.");
      }

      setNotes(data.data || []);
    } catch (err) {
      console.error("Qeydlər yüklənmədi:", err);
      setError(err.message || "Serverə qoşulmaq mümkün olmadı.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CREATE NOTE
  // ============================================================

  const addNote = async (e) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      setError("Başlıq və məzmun boş ola bilməz.");
      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          content: cleanContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Qeyd əlavə edilə bilmədi.");
      }

      setNotes((prevNotes) => [data.data, ...prevNotes]);

      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Qeyd əlavə edilmədi:", err);
      setError(err.message || "Qeyd əlavə edilə bilmədi.");
    }
  };

  // ============================================================
  // DELETE NOTE
  // ============================================================

  const deleteNote = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Qeyd silinə bilmədi.");
      }

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Qeyd silinmədi:", err);
      setError(err.message || "Qeyd silinmədi.");
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchNotes();
  }, []);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Mənim Qeydlərim</h1>

          <button type="button" onClick={fetchNotes} className="refresh-button">
            Yenilə
          </button>
        </header>

        {error && <div className="error">{error}</div>}

        <form onSubmit={addNote} className="note-form">
          <input
            type="text"
            placeholder="Başlıq"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />

          <textarea
            placeholder="Məzmun"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />

          <button type="submit">Qeyd Əlavə Et</button>
        </form>

        <section className="notes-section">
          <div className="section-header">
            <h2>Qeydlər</h2>

            <span>{notes.length}</span>
          </div>

          {loading ? (
            <p className="empty-state">Qeydlər yüklənir...</p>
          ) : notes.length === 0 ? (
            <p className="empty-state">Hələ ki qeyd yoxdur.</p>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <article key={note.id} className="note-card">
                  <div className="note-content">
                    <h3>{note.title}</h3>

                    <p>{note.content}</p>

                    {note.created_at && <small>{note.created_at}</small>}
                  </div>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteNote(note.id)}
                  >
                    Sil
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
