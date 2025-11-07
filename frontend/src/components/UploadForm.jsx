import React, { useState } from 'react'
import axios from 'axios'
export default function UploadForm({ apiBase, onUploaded }){
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  async function submit(e){
    e.preventDefault()
    const form = new FormData()
    form.append('text', text)
    if (file) form.append('image', file)
    try{
      const res = await axios.post(`${apiBase}/api/posts`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setText(''); setFile(null); onUploaded && onUploaded(res.data)
    }catch(err){ console.error(err); alert('アップロードに失敗しました') }
  }
  return (
    <form onSubmit={submit} className="mb-6">
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="いま感じていることをシェアしよう" className="w-full p-2 border rounded mb-2" />
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      <div className="mt-2"><button className="px-4 py-2 rounded bg-blue-600 text-white">投稿</button></div>
    </form>
  )
}