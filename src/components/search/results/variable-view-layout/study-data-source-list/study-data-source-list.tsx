import { Space } from 'antd'
import { useVariableView } from '../variable-view-context'
import { StudyDataSourceTag } from './study-data-source-tag'


export const StudyDataSourcesList = () => {
    const { orderedDataSources } = useVariableView()!
    return (
        <Space direction="horizontal" size={ 8 } wrap style={{ flexGrow: 1 }}>
            {
                orderedDataSources.map((dataSource) => (
                    <StudyDataSourceTag key={ `variable-view-data-source-tag-${ dataSource.name }` } dataSource={ dataSource } />
                ))
            }
        </Space>
    )
}