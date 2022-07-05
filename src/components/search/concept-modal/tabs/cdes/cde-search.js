import { useEffect, useState } from 'react'
import { Divider, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useDebounce } from 'use-debounce'

export const CdeSearch = ({ setSearch: setOuterSearch }) => {
    const [_search, setSearch] = useState("")
    const [search] = useDebounce(_search, 200)
    useEffect(() => {
        setOuterSearch(search)
    }, [search])
    return (
        <Input
            style={{ width: "auto" }}
            allowClear
            value={_search}
            onChange={(e) => setSearch(e.target.value) }
            suffix={
                <div style={{ display: "flex", alignItems: "center", height: "100%"}}>
                    <Divider type="vertical" style={{ height: "100%" }} />
                    <SearchOutlined style={{ fontSize: "16px", marginLeft: "4px" }} />
                </div>
        }
        />
    )
}