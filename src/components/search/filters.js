import React, { useEffect, useState } from 'react'
import { Radio } from 'antd'
import { useHelxSearch } from './'
// import './filters.css'

export const Filters = () => {
  const [filters, setFilters] = useState()

  const handleChangeFilters = value => setFilters(value)

  return (
    <Radio.Group value={ filters } onChange={ () => console.log('.') }>
      <Radio.Button value="small">Small</Radio.Button>
      <Radio.Button value="default">Default</Radio.Button>
      <Radio.Button value="large">Large</Radio.Button>
    </Radio.Group>
  )
}