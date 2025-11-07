import React from 'react'
export default function Feed({ posts }){
  return (
    <div className="space-y-4">
      {posts.map(p=> (
        <div key={p.id} className="p-3 border rounded">
          <div className="text-sm text-gray-600">@{p.username} — {p.created_at}</div>
          <div className="mt-2">{p.text}</div>
          {p.image_path && (<img src={`http://localhost:4000${p.image_path}`} alt="post" className="mt-2 max-h-80 object-contain" />)}
        </div>
      ))}
    </div>
  )
}