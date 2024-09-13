import { useMemo } from 'react'
import { Button } from 'antd'
import { useEnvironment, useTourContext } from '../../contexts'
import classNames from 'classnames'
import './guided-tour.css'

export const GuidedTourButton = ({ }) => {
    const { tour } = useTourContext()!
    const { context } = useEnvironment() as any

    return (
        <div className="guided-tour-button-container">
            <Button
                className={ classNames("guided-tour-button", context.brand) }
                onClick={ () => tour.start() }
            >
                Take a Tour
            </Button>
        </div>
    )
}