import React from 'react'
import useSwr from 'swr'
import { Link } from 'react-router-dom'

import { definitions } from '../schema/rest-api'
import supabase from '../api/supabaseClient'

export default function Uploads () {
  const [table, page, limit] = ['uploaded_files', 0, 10]
  const [from, to] = [page * limit, (page + 1) * limit - 1]
  const { data: uploadedFiles, error } = useSwr(
    `${table}?from=${from}&to=${to}`,
    async () => {
      const result = await supabase
        .from<definitions['uploaded_files']>(table)
        .select()
        .range(from, to)
      if (result.error) throw result.error
      return result.data
    }
  )
  // TODO clean up loading view, error message
  // TODO does this effect happen on each route event?
  if (error) return <span>error</span>
  if (!uploadedFiles) return <span>loading</span>
  return (
    <ul className="flex flex-col">
      {uploadedFiles.map((uploadedFile) => (
        <li
          className="m-3 p-3 w-full bg-green-200 rounded-lg"
          key={uploadedFile.id}
        >
          <Link to={`./${uploadedFile.id}`}>
            {uploadedFile.id} {uploadedFile.file_name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
