import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  border: 1px solid red;
  padding: 1rem;
`

export const Notification = ({ message }) => {
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Wrapper open={ open } onClick={ handleClose }>
      { message }
    </Wrapper>
  )
}
