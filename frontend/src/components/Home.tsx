import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Body } from './Components'
import './Home.css'

function MyDropzone () {
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles) => {
    setProgress(0)
    setStatus('uploading')

    const formData = new FormData()
    formData.append('file', acceptedFiles[0]) // TODO warn on multiple files
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/table-parser/parse', true)
    xhr.upload.onprogress = (event) => {
      const percentage = +((event.loaded / event.total) * 100).toFixed(2)
      setProgress(percentage)
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return
      if (xhr.status !== 200) {
        console.warn(xhr)
        setStatus('error')
      }
      setStatus('success')
      setProgress(100)
    }
    xhr.send(formData)
  }, [])
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
      </div>
      {acceptedFileItems}
      {fileRejectionItems}
      <div>Status: {status}</div>
      <svg style={{ width: '100px', height: '40px' }}>
        <rect width="100%" height="100%" fill="grey"></rect>
        <rect width={progress + '%'} height="100%" fill="green"></rect>
      </svg>
    </div>
  )
}

function Home () {
  const [buttonLabel, setButtonLabel] = useState('shootin Lasers')
  return (
    <Body>
      <MyDropzone></MyDropzone>
      <button
        onClick={() => {
          fetch('/api/table-parser/get-file')
            .then((res) => res.json())
            .then((data) => setButtonLabel(data.result))
        }}
      >
        {buttonLabel}
      </button>
    </Body>
  )
}
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
