import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

import NoteCard from "./NoteCard.jsx";

const API_URL = import.meta.env.VITE_API_URL


function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState("");
  const titleRef = useRef(null)

  useEffect(() => {
    let ignore = false
    async function loadNotes() {
      try {
        const res = await fetch(API_URL + '/notes')
        if (!res.ok) {
          throw new Error('The server answered ' + res.status)
        }
        const data = await res.json()
        if (!ignore) setNotes(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      }
      if (!ignore) setLoading(false)
    }
 
    loadNotes()
    return () => {
      ignore = true
    }
  }, [])


  const [note, setNewNote] = useState(() => {
    const saved = localStorage.getItem('draft')
    return saved ? JSON.parse(saved) : startingNotes
  })

  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem('draft', JSON.stringify(note))
      console.log('draft saved:', note.title)
    }, 1000)
    return () => clearTimeout(id)
  }, [note])

  function handleChange(e) {
    const { name, value } = e.target;
    setNewNote({ ...note, [name]: value });
  }

  const handleDelete = useCallback((id) => {
    setNotes((prevNotes) => prevNotes.filter((item) => item.id !== id));
  }, [notes])

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed1 = note.title.trim();
    const trimmed2 = note.body.trim();
    if (trimmed1 === "" || trimmed2 === "") {
      return;
    }

    const newNote = {
      id: crypto.randomUUID(),
      title: trimmed1,
      body: trimmed2,
    };
    setNotes((prevNotes) => [...prevNotes, newNote]);
    setNewNote({ title: "", body: "" });
    localStorage.removeItem("draft")
    titleRef.current.focus();
  }

  const filteredNotes = useMemo(() => {
    console.log('filtering')
    return notes.filter((note) =>
      note.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [notes, search])

  return (
    <div className="grid min-h-screen grid-cols-[420px_1fr]">
      <aside className="sticky top-0 flex h-screen flex-col gap-5 bg-white px-8 py-9 shadow-[0_2px_4px_0_rgba(0,0,0,0.2),0_25px_50px_0_rgba(0,0,0,0.1)]">
        <h1 className="text-[72px] leading-none font-extralight text-[#b83f45]">
          notes
        </h1>

        <div>
          <p className="mb-2 text-[13px] font-normal tracking-wide text-[#949494]">
            SEARCH
          </p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title"
            className="h-[52px] w-full border border-[#e6e6e6] px-4 text-lg outline-none placeholder:text-black/40 placeholder:italic focus:border-[#cf7d7d]"
          />
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <p className="text-[13px] font-normal tracking-wide text-[#949494]">
            NEW NOTE
          </p>
          <input
            ref={titleRef}
            name="title"
            value={note.title}
            onChange={handleChange}
            placeholder="Title"
            className="h-[52px] w-full border border-[#e6e6e6] px-4 text-lg outline-none placeholder:text-black/40 placeholder:italic focus:border-[#cf7d7d]"
          />

          <textarea
            name="body"
            value={note.body}
            onChange={handleChange}
            placeholder="Write your note"
            className="h-[120px] w-full resize-none py-3 border border-[#e6e6e6] px-4 text-lg outline-none placeholder:text-black/40 placeholder:italic focus:border-[#cf7d7d]"
          />

          <button
            type="submit"
            className="h-[50px] cursor-pointer bg-[#b83f45] text-[17px] font-normal text-white hover:bg-[#a33439]"
          >
            Add note
          </button>
        </form>
      </aside>

      <section className="px-12 py-11">
        <h2 className="mb-6 text-3xl">All notes</h2>
        <ul className="grid grid-cols-3 items-start gap-5">
          {filteredNotes.map((item) => (
            <li
              key={item.id}
              className="relative min-h-32 bg-white px-6 py-5 shadow-[0_2px_4px_0_rgba(0,0,0,0.2),0_25px_50px_0_rgba(0,0,0,0.1)]"
            >
              <NoteCard
                id={item.id}
                title={item.title}
                body={item.body}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>

        {loading && <p className="text-lg text-[#949494]">Loading notes...</p>}
        {error && <p className="text-lg text-[#b83f45]">{error}</p>}
        {!loading && !error && filteredNotes.length === 0 && (<p className="text-lg text-[#949494]">No notes found</p>)}
      </section>
    </div>
  );
}

export default Notes;