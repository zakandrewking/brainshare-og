import React from 'react'
import { useParams, Link } from 'react-router-dom'
import supabase from '../api/supabaseClient'
import useSwr from 'swr'
import { FaFileExcel } from 'react-icons/fa'

import { Body, Button } from './Components'

/*
 * Replace underscores with capital letters and spaces
 */
function snakeCaseToText (text: string): string {
  return text
    .replace(/^[a-z]/, (match) => match.toUpperCase())
    .replace(/_([a-z])/g, (_, match) => ` ${match.toUpperCase()}`)
}

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

  // filter key list
  const keys = data[0]
    ? Object.keys(data[0]).filter(
      (k) =>
        !['id', 'created_at', 'updated_at', 'owner', 'object_key'].includes(k)
    )
    : null

  return (
    <Body>
      <div className="flex flex-col" role="list">
        <div className="grow-1 flex flex-row space-x-3 pl-10 py-2">
          {keys
            ? keys.map((key) => (
                <div key={key} className="font-bold">
                  {snakeCaseToText(key)}
                </div>
            ))
            : `You don't have any ${snakeCaseToText(tableName)} yet`}
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
            {keys && keys.map((key) => <div key={key}>{datum[key]}</div>)}
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
      <Link to="./..">
        <Button>{snakeCaseToText(tableName)}</Button>
      </Link>
      <span className="text-2xl pl-1">&#8725;</span>
      <span className="text-2xl">{data.name ?? ''}</span>
    </div>
  )
}
