import React from 'react'
import { Link } from 'react-router-dom'
import { Body, Button } from './Components'

export default function DatabaseView () {
  return (
    <Body>
      <Link to="/database">
        <Button>Back</Button>
      </Link>
      <div>hi!</div>
    </Body>
  )
}
