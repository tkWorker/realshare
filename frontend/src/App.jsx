import React, { useEffect, useState } from 'react'
import axios from 'axios'
import UploadForm from './components/UploadForm'
import Feed from './components/Feed'
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
export default function App(){
  const [posts, setPosts] = useState([])
  async function load(){ const res = await axios.get(`${API}/api/posts`); setPosts(res.data) }
  useEffect(()=>{ load() }, [])
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">realshare</h1>
      <UploadForm onUploaded={(p)=> setPosts(prev=>[p,...prev])} apiBase={API} />
      <Feed posts={posts} />
    </div>
  )
}