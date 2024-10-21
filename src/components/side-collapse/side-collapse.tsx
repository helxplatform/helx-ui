import { ReactNode, useState } from 'react'
import { Collapse, CollapsePanelProps, CollapseProps } from 'antd'
import classNames from 'classnames'
import './side-collapse.css'

const { Panel } = Collapse

interface SideCollapseProps extends CollapseProps {
    collapsed: boolean
    onCollapse: (collapsed: boolean) => void
    header: ReactNode
    panelProps?: Partial<CollapsePanelProps>
    children?: ReactNode
}

/** A styled collapsible container with a side-bar handle for collapsing */
export const SideCollapse = ({
    collapsed,
    onCollapse,
    header,
    children,
    panelProps: { className: panelClassName, ...panelProps } = {},
    ...collapseProps
}: SideCollapseProps) => {
    return (
        <Collapse ghost activeKey={collapsed ? undefined : `side-collapse-panel`} onChange={ () => onCollapse(!collapsed) } { ...collapseProps } >
            <Panel
                key={`side-collapse-panel`}
                header={ header }
                className={ classNames("side-collapse-panel", panelClassName) }
                { ...panelProps }
            >
                <div className="side-collapse-container">
                    <div className="side-collapse-handle-container" onClick={ () => onCollapse(true) }>
                        <div className="side-collapse-handle" />
                    </div>
                    { children }
                </div>
            </Panel>
        </Collapse>
    )
}