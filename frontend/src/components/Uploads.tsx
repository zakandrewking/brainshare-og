import React from 'react'
import useSwr from 'swr'
import { Link } from 'react-router-dom'

import { definitions } from '../schema/rest-api'
import supabase from '../api/supabaseClient'
import { FaFileExcel } from 'react-icons/fa'
import { Body } from './Components'

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
    <Body>
      <div className="flex flex-col" role="list">
        <div className="p-1">
          <div className="grow-1 pl-9 font-bold">File name</div>
        </div>
        {uploadedFiles.map((uploadedFile) => (
          <Link
            to={`./${uploadedFile.id}`}
            className="px-1 py-3 border-t border-slate-200 dark:border-slate-700  hover:bg-slate-200 active:bg-slate-300 hover:dark:bg-slate-700 active:dark:bg-slate-700 flex flex-row items-center"
            key={uploadedFile.id}
            role="listitem"
          >
            <div className="w-9">
              <FaFileExcel size="1.5em" />
            </div>
            <div>{uploadedFile.name}</div>
          </Link>
        ))}
      </div>
    </Body>
  )
}
