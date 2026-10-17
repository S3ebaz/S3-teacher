// notebook.js - La Libreta: notas + archivos en IndexedDB

const DB_NAME = 'S3TeacherDB';
const DB_VERSION = 1;
const STORE_FILES = 'files';
const STORE_NOTES = 'notes';

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_FILES)) {
        database.createObjectStore(STORE_FILES, { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains(STORE_NOTES)) {
        database.createObjectStore(STORE_NOTES, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function initNotebook() {
  try {
    await openDB();
    loadNotes();
    loadFiles();
  } catch (e) {
    console.error('Error abriendo IndexedDB:', e);
  }
}

function saveNote() {
  const text = document.getElementById('note-text').value.trim();
  if (!text) return alert('Escribe algo primero');
  const tx = db.transaction(STORE_NOTES, 'readwrite');
  const store = tx.objectStore(STORE_NOTES);
  const note = { text, date: new Date().toISOString() };
  store.add(note);
  tx.oncomplete = () => {
    document.getElementById('note-text').value = '';
    loadNotes();
  };
}

function loadNotes() {
  const list = document.getElementById('notes-list');
  list.innerHTML = '<h3>Notas guardadas</h3>';
  const tx = db.transaction(STORE_NOTES, 'readonly');
  const store = tx.objectStore(STORE_NOTES);
  const req = store.openCursor(null, 'prev'); // newest first
  req.onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const note = cursor.value;
      const div = document.createElement('div');
      div.className = 'note-item';
      div.innerHTML = `
        <div>
          <p>${note.text}</p>
          <small>${new Date(note.date).toLocaleString('es-MX')}</small>
        </div>
        <button class="btn danger" onclick="deleteNote(${note.id})">Borrar</button>
      `;
      list.appendChild(div);
      cursor.continue();
    }
  };
}

function deleteNote(id) {
  const tx = db.transaction(STORE_NOTES, 'readwrite');
  tx.objectStore(STORE_NOTES).delete(id);
  tx.oncomplete = loadNotes;
}

function handleFileUpload(files) {
  if (!files.length) return;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const fileData = {
        name: file.name,
        type: file.type,
        data: e.target.result, // base64 or ArrayBuffer
        date: new Date().toISOString()
      };
      store.add(fileData);
      tx.oncomplete = loadFiles;
    };
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file); // PDFs also as data URL for simplicity
    }
  });
}

function loadFiles() {
  const list = document.getElementById('files-list');
  list.innerHTML = '<h3>Archivos subidos</h3>';
  const tx = db.transaction(STORE_FILES, 'readonly');
  const store = tx.objectStore(STORE_FILES);
  const req = store.openCursor(null, 'prev');
  req.onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const file = cursor.value;
      const div = document.createElement('div');
      div.className = 'file-item';
      let preview = '';
      if (file.type.startsWith('image/')) {
        preview = `<img src="${file.data}" alt="${file.name}">`;
      } else {
        preview = `<a href="${file.data}" download="${file.name}" target="_blank">📄 ${file.name}</a>`;
      }
      div.innerHTML = `
        ${preview}
        <div>
          <strong>${file.name}</strong><br>
          <small>${new Date(file.date).toLocaleString('es-MX')}</small>
        </div>
        <button class="btn danger" onclick="deleteFile(${file.id})">Borrar</button>
      `;
      list.appendChild(div);
      cursor.continue();
    }
  };
}

function deleteFile(id) {
  const tx = db.transaction(STORE_FILES, 'readwrite');
  tx.objectStore(STORE_FILES).delete(id);
  tx.oncomplete = loadFiles;
}

// Expose
window.notebook = { initNotebook, saveNote, handleFileUpload, deleteNote, deleteFile };
