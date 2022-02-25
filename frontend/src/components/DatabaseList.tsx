import React from 'react'
import { Link } from 'react-router-dom'
import { Body, Button } from './Components'

export default function DatabaseList () {
  const dbId = 'my_DB'
  return (
    <Body>
      <Link to={`./${dbId}`} key={dbId}>
        <Button>{dbId}</Button>
      </Link>
    </Body>
  )
}
