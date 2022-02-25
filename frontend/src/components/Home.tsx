import React, { useState, useContext, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import useWebSocket from 'react-use-websocket'
import { Body, Button } from './Components'
import { MessageBoxContext } from '../context/MessageBox'
import { sliceFile } from '../util/files'
import { UserSessionContext } from '../context/UserSession'
import { Link } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'
import { TableParserMessage } from '../schema/table-parser'

import './Home.css'

function MyDropzone ({ session }: { session: Session }) {
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const setMessage = useContext(MessageBoxContext)

  const [buttonLabel, setButtonLabel] = useState('lasers')

  const { sendMessage, sendJsonMessage } = useWebSocket(
    'ws://' + window.location.host + '/api/table-parser/sock',
    {
      onOpen: () => {
        console.log('websocket open')
        setStatus('Connected')
        // TODO check for current file and update UI
      },
      onMessage: (event) => {
        console.debug('websocket message received', event)
        const message: TableParserMessage = JSON.parse(event.data)
        console.debug(message)

        // for testing
        if (message.hasLasers) {
          setButtonLabel(message.hasLasers)
        }

        if (message.status === 'UPLOAD_SUCCESS') {
          setStatus('Uploaded')
        } else if (message.status === 'SAVED') {
          setStatus('Saved')
        } else if (message.status === 'ERROR') {
          console.warn(message.error)
          setStatus('Failed')
          setProgress(0)
        }
      },
      onClose: () => {
        console.log('websocket closed')
        setStatus('Disconnected')
      },
      shouldReconnect: (closeEvent) => true
    }
  )

  const onDrop = async (acceptedFiles: File[]) => {
    setProgress(0)
    setStatus('Uploading')

    let file
    try {
      ;[file] = acceptedFiles
    } catch {
      throw Error('Needs exactly one file')
    }
    const { nSlices, nextSlice } = sliceFile(acceptedFiles[0])
    const message: TableParserMessage = {
      file: {
        name: file.name,
        nSlices,
        accessToken: session.access_token,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      status: 'PREPARE_UPLOAD',
      error: ''
    }
    try {
      sendJsonMessage(message)
    } catch {
      setMessage('Could not connect. Try again in a few minutes.')
    }
    for (let i = 0; i < nSlices; i++) {
      try {
        sendMessage(await nextSlice())
      } catch {
        setMessage('Could not connect. Try again in a few minutes.')
      }
      const percentage = (i + 1) / nSlices
      setProgress(percentage)
      setStatus('Waiting for confirmation')
    }
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections
  } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: '.xlsx'
  })

  const acceptedFileItems = acceptedFiles.map((file) => (
    <div key={file.name}>accepted: {file.name}</div>
  ))

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <div key={file.name}>rejected: {file.name}</div>
  ))

  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} type="file" accept=".xlsx" />
        {isDragActive
          ? (
          <p>Drop the files here ...</p>
            )
          : (
          <p>
            Drag &apos;n&apos; drop .xlsx file here, or click to select a file
          </p>
            )}
        <div>Status: {status}</div>
        <div className="p-3">
          <svg style={{ width: '100px', height: '40px' }}>
            <rect width="100%" height="100%" fill="grey"></rect>
            <rect
              width={(progress * 100).toFixed(2) + '%'}
              height="100%"
              fill="green"
            ></rect>
          </svg>
        </div>
      </div>
      {acceptedFileItems}
      {fileRejectionItems}
      <Button
        onClick={() => {
          const message: TableParserMessage = {
            status: 'LASERS',
            hasLasers: buttonLabel,
            error: ''
          }
          sendJsonMessage(message)
        }}
      >
        {buttonLabel}
      </Button>
    </div>
  )
}

function Home () {
  const session = useContext(UserSessionContext)
  useEffect(() => {
    console.log(session)
  })
  return (
    <Body>
      {session
        ? (
        <MyDropzone session={session}></MyDropzone>
          )
        : (
        <div className="flex justify-center">
          <Link to="/log-in" className="">
            <Button>Log In to Upload a File</Button>
          </Link>
        </div>
          )}
    </Body>
  )
}

// TODO fill screen drop box
//       <form id="my-form" style={{
// width: '100%',
// height: '100%',
// backgroundColor: 'white',
// position: 'fixed',
// left: 0,
// top: 0,
// opacity: 0.1,
// }}>Drop here</form>

export default Home
