import React, { useEffect, useState } from 'react'
import supabase from '../api/supabaseClient'

interface Upload {
  key: string
}

export default function Uploads () {
  const [uploads, setUploads] = useState<Upload[]>([])
  useEffect(() => {
    const get = async () => {
      const result = await supabase.from('file_uploads').first(10).get()
    }
    get()
  })
  return (
    <ul>
      {uploads.map((upload) => (
        <li key={upload.key}>{upload}</li>
      ))}
    </ul>
  )
}
