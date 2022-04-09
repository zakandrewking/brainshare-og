import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { definitions } from '../schema/rest-api'
import supabase from '../api/supabaseClient'
import useSwr from 'swr'
import { FaCaretLeft, FaFileExcel } from 'react-icons/fa'

import { Body, Button } from './Components'

export function TableView ({ tableName }: { tableName: string }) {
  const [page, limit] = [0, 10]
  const [from, to] = [page * limit, (page + 1) * limit - 1]
  const { data, error } = useSwr(
    `${tableName}?from=${from}&to=${to}`,
    async () => {
      const result = await supabase.from(tableName).select().range(from, to)
      if (result.error) throw result.error
      return result.data
    }
  )
  // TODO clean up loading view, error message
  // TODO does this effect happen on each route event?
  if (error) return <span>error</span>
  if (!data) return <span>loading</span>
  return (
    <Body>
      <div className="flex flex-col" role="list">
        <div className="p-1">
          <div className="grow-1 pl-9 font-bold">File name</div>
        </div>
        {data.map((datum) => (
          <Link
            to={`./${datum.id ?? ''}`}
            className="px-1 py-3 border-t border-slate-200 dark:border-slate-700  hover:bg-slate-200 active:bg-slate-300 hover:dark:bg-slate-700 active:dark:bg-slate-700 flex flex-row items-center"
            key={datum.id ?? ''}
            role="listitem"
          >
            <div className="w-9">
              <FaFileExcel size="1.5em" />
            </div>
            <div>{datum.name ?? ''}</div>
          </Link>
        ))}
      </div>
    </Body>
  )
}

export function TableDetail ({ tableName }: { tableName: string }) {
  const { id } = useParams()
  const { data, error } = useSwr(`${tableName}?id={id}`, async () => {
    const result = await supabase.from(tableName).select().eq('id', id)
    if (result.error) throw result.error
    // todo check length
    if (result.data.length !== 1) throw Error('Wrong number of results')
    return result.data[0]
  })
  if (error) return <span>error</span>
  if (!data) return <span>loading</span>
  return (
    <div className="flex flex-row items-center space-x-6 pl-3">
      <Link to="..">
        <Button>
          <FaCaretLeft size={20} />
        </Button>
      </Link>
      <span className="text-2xl">{data.name ?? ''}</span>
    </div>
  )
}
