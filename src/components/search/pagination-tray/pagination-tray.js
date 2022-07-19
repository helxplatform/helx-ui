import { navigate } from '@reach/router'
import { Pagination, Space } from 'antd'
import { useHelxSearch } from '../'
import { useEnvironment } from '../../../contexts'
import './pagination-tray.css'

export const PaginationTray = ({ showTotal=true }) => {
  const { query, totalConcepts, currentPage } = useHelxSearch()
  const { basePath } = useEnvironment();

  return (
    <Space role="navigation" aria-label="Pagination Navigation" className="pagination-tray">
      <Pagination
        current={ currentPage }
        defaultPageSize={20}
        total={ totalConcepts }
        showTotal={total => showTotal ? `${ total } concepts` : undefined}
        onChange={ (page, pageSize) => navigate(`${basePath}search?q=${ query }&p=${ page }`) }
        showSizeChanger={ false }
      />
    </Space>
  )
}
