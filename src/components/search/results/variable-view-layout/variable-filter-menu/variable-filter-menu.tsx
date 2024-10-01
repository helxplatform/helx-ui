import { useMemo } from 'react'
import { Button, Checkbox, Divider, Popover, Select } from 'antd'
import { CaretDownFilled } from '@ant-design/icons'
import { useVariableView } from '../variable-view-context'
import { DebouncedInput } from '../../../../debounced-input'

export const VariableFilterMenuContent = () => {
    const {
        subsearch, setSubsearch,
        sortOption, setSortOption,
        sortOrderOption, setSortOrderOption,
        collapseIntoVariables, setCollapseIntoVariables,
        resetFilters, isFiltered
    } = useVariableView()!
    
    const sortOptions = useMemo(() => ([
        {
            value: "score",
            label: "Score"
        },
        {
            value: "data_source",
            label: "Data source"
        }
    ]), [])
    
    const sortOrderOptions = useMemo(() => ([
        {
            value: "descending",
            label: "Descending"
        },
        {
            value: "ascending",
            label: "Ascending"
        }
    ]), [])

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    color: "#434343",
                    textTransform: "uppercase",
                    overflow: "hidden"
                }}>Filters</span>
                { isFiltered && <Button type="link" style={{ 
                    height: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    overflow: "hidden"
                }} onClick={ resetFilters }>Clear</Button> }
            </div>
            <Divider style={{ margin: "8px 0" }} />
            <div className="filter-menu-form-item filter-menu-form-item-vertical">
                <span className="filter-menu-form-label">Subsearch:</span>
                <DebouncedInput
                    setValue={ setSubsearch }
                    inputProps={{ placeholder: "Find specific terms...", style: { width: "100%" } }}
                />
            </div>
            <div className="filter-menu-form-item">
                <span className="filter-menu-form-label">Group by study:</span>
                <Checkbox checked={ !collapseIntoVariables } onChange={ (e) => setCollapseIntoVariables(!e.target.checked) } />
            </div>
            <Divider style={{ margin: "4px 0" }} />
            <div className="filter-menu-form-item filter-menu-form-item-vertical">
                <span className="filter-menu-form-label">Sort by:</span>
                <div style={{ display: "flex", gap: 8 }}>
                    <Select
                        options={ sortOptions }
                        value={ sortOption }
                        onChange={ setSortOption }
                        style={{ flexGrow: 1, minWidth: 125 }}
                    />
                    <Select
                        options={ sortOrderOptions }
                        value={ sortOrderOption }
                        onChange={ setSortOrderOption }
                        style={{ flexGrow: 1, minWidth: 125 }}
                    />
                </div>
            </div>
        </div>
    )
}

export const VariableFilterMenuButton = () => {
    return (
        <Popover trigger="click" placement="bottomRight" content={
            <VariableFilterMenuContent />
        }>
            <Button type="primary" style={{
                display: "inline-flex",
                alignItems: "center",
                height: 28,
                padding: "4px 8px",
            }}>
                Filters
                <CaretDownFilled style={{ fontSize: 12 }} />
            </Button>
        </Popover>
    )
}