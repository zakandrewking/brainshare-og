import React from 'react'
import useSwr from 'swr'
import { Link } from 'react-router-dom'

import { definitions } from '../schema/rest-api'
import supabase from '../api/supabaseClient'
import { FaFileExcel } from 'react-icons/fa'

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
    <div className="flex flex-col" role="list">
      {uploadedFiles.map((uploadedFile) => (
        <Link
          to={`./${uploadedFile.id}`}
          className="m-3 p-3 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 dark:bg-emerald-800 rounded-lg flex flex-row items-center gap-3"
          key={uploadedFile.id}
          role="listitem"
        >
          <FaFileExcel />
          {uploadedFile.file_name}
        </Link>
      ))}
    </div>
  )
}
