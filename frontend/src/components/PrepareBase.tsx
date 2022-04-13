import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useSwr from 'swr'

import supabase from '../api/supabaseClient'
import { Body, Button } from './Components'
import { snakeCaseToText } from '../util/snakeCaseToText'
import useTableParser from '../api/useTableParser'
import { TableParserMessage } from '../schema/table-parser'

export default function PrepareBase () {
  const tableName = 'uploaded_files'
  const { id } = useParams()
  // TODO get this data from websocket if we already have it
  const { data, error } = useSwr(`${tableName}?id=${id}`, async () => {
    const result = await supabase.from(tableName).select().eq('id', id)
    if (result.error) throw result.error
    // todo check length
    if (result.data.length !== 1) throw Error('Wrong number of results')
    return result.data[0]
  })

  const [status, setStatus] = useState('')

  useTableParser({
    onOpen: () => setStatus('Connected'),
    onClose: () => setStatus('Disconnected'),
    onMessage: (message: TableParserMessage) => {
      console.debug(message)
    }
  })

  if (error) return <span>error</span>
  if (!data) return <span>loading</span>

  // connect to websockets & get status

  return (
    <Body>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-row items-center space-x-6 pl-3">
          <Link to="./../..">
            <Button>{snakeCaseToText(tableName)}</Button>
          </Link>
          <span className="text-2xl pl-1">&#8725;</span>
          <Link to="./..">
            <Button>{data?.name}</Button>
          </Link>
          <span className="text-2xl pl-1">&#8725;</span>
          <span className="text-2xl">PrepareBase</span>
        </div>
        <h1>Status: {status}</h1>
      </div>
    </Body>
  )
}
