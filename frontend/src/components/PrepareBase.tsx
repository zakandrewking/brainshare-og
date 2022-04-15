import React, { useState, useEffect, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import useSwr from 'swr'
import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import { UserSessionContext } from '../context/UserSession'
import supabase from '../api/supabaseClient'
import { Body, Button, NotFound404 } from './Components'
import { snakeCaseToText } from '../util/snakeCaseToText'
import useTableParser, { TableData } from '../api/useTableParser'

export default function PrepareBase () {
  const session = useContext(UserSessionContext)

  const [tableData, setTableData] = useState<TableData | null>(null)

  const { tableData: firstTableData, sendJsonMessage } = useTableParser({
    onTableData: (tableData: TableData | null) => {
      console.debug('received table data', tableData)
      setTableData(tableData)
    }
  })

  useEffect(() => {
    console.log('firstTableData', firstTableData)
    setTableData(firstTableData)
  }, [])

  const tableName = 'uploaded_files'
  const { id } = useParams()
  const { data, error } = useSwr(`${tableName}?id=${id}`, async () => {
    const result = await supabase.from(tableName).select().eq('id', id)
    if (result.error) throw result.error
    // todo check length
    if (result.data.length !== 1) throw Error('Wrong number of results')
    return result.data[0]
  })

  if (!session) return <NotFound404 />
  if (error) return <span>error</span>
  if (!data) return <span>loading</span>

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
        <div className="w-full h-48">
          <AgGridReact
            rowData={tableData?.rowData || []}
            columnDefs={tableData?.columnDefs || []}
          ></AgGridReact>
        </div>
        <div>
          <Button
            onClick={() => {
              sendJsonMessage({
                status: 'REQUEST_TABLE_UPDATE',
                objectKey: data.object_key,
                accessToken: session.access_token
              })
            }}
          >
            Load Data
          </Button>
        </div>
      </div>
    </Body>
  )
}
