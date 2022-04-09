import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { definitions } from '../schema/rest-api'
import supabase from '../api/supabaseClient'
import useSwr from 'swr'
import { FaCaretLeft } from 'react-icons/fa'
import { Button } from './Components'

export default function Upload () {
  const { uploadId } = useParams()
  const table = 'uploaded_files'
  const { data: uploadedFile, error } = useSwr(
    `${table}?id={uploadId}`,
    async () => {
      const result = await supabase
        .from<definitions['uploaded_files']>(table)
        .select()
        .eq('id', uploadId)
      if (result.error) throw result.error
      // todo check length
      if (result.data.length !== 1) throw Error('Wrong number of results')
      return result.data[0]
    }
  )
  if (error) return <span>error</span>
  if (!uploadedFile) return <span>loading</span>
  return (
    <div className="flex flex-row items-center space-x-6 pl-3">
      <Link to="..">
        <Button>
          <FaCaretLeft size={20} />
        </Button>
      </Link>
      <span className="text-2xl">{uploadedFile.name ?? ''}</span>
    </div>
  )
}
