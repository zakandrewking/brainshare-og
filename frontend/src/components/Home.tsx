import React, { useState, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import { Link, useNavigate } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'

import { Body, Button, NotFound404 } from './Components'
import { MessageBoxContext } from '../context/MessageBox'
import { sliceFile } from '../util/files'
import { UserSessionContext } from '../context/UserSession'
import { TableParserMessage } from '../schema/table-parser'

import useTableParser from '../api/useTableParser'

import './Home.css'

function MyDropzone ({ session }: { session: Session }) {
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const setMessage = useContext(MessageBoxContext)
  const navigate = useNavigate()

  const { sendMessage, sendJsonMessage } = useTableParser({
    onOpen: () => setStatus('Connected'),
    onClose: () => setStatus('Disconnected'),
    onMessage: (message: TableParserMessage) => {
      console.debug(message)

      if (message.status === 'UPLOAD_SUCCESS') {
        setStatus('Saving')
      } else if (message.status === 'SAVED') {
        setStatus('Saved ... preparing your file')
        sendJsonMessage({
          status: 'REQUEST_TABLE_UPDATE'
        })
        setTimeout(
          () => navigate(`/uploads/${message.uploadedFileId}/prepare-base`),
          2000
        )
      } else if (message.status === 'ERROR') {
        console.warn(message.error)
        setStatus('Failed')
        setProgress(0)
      }
    }
  })

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
    if (!session.user) {
      throw Error('Missing session.user')
    }
    const message: TableParserMessage = {
      file: {
        name: file.name,
        nSlices,
        accessToken: session.access_token,
        userId: session.user.id,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      status: 'PREPARE_UPLOAD'
    }
    try {
      sendJsonMessage(message)
    } catch {
      setMessage(
        'Could not connect. Please refresh the page or try again in a few minutes.'
      )
    }
    for (let i = 0; i < nSlices; i++) {
      try {
        sendMessage(await nextSlice())
      } catch {
        setMessage(
          'Could not connect. Please refresh the page or try again in a few minutes.'
        )
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
    </div>
  )
}

function Home () {
  const session = useContext(UserSessionContext)

  if (!session) return <NotFound404 />

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
