/**
 * Note: This has been designed specifically for the Spring 23 semester implementation, not for Eduhelx v2.
 */

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Modal } from 'antd'
import { useLocation } from '@gatsbyjs/reach-router'
import { useWorkspacesAPI } from './'

export const EDUHELX_ASSN_QS_PARAM = "eduassn"

// interface IEduhelxAssignment {
//     download: () => File[]
// }


export interface IEduhelxContext {
}

interface IEduhelxProvider {
    children: ReactNode
}

export const EduhelxContext = createContext<IEduhelxContext|undefined>(undefined)

export const EduhelxProvider = ({ children }: IEduhelxProvider) => {
    return <EduhelxContext.Provider value={{}}>{ children }</EduhelxContext.Provider>
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false)

    const { api, loggedIn } = useWorkspacesAPI()!
    const location = useLocation()
    
    const eduhelxAssn = useMemo(() => {
        const qs = new URLSearchParams(window.location.search)
        const eduassn = qs.get(EDUHELX_ASSN_QS_PARAM)
        return eduassn
    }, [location])

    const handleOk = useCallback(async () => {
        setConfirmLoading(true)
        await new Promise((r) => setTimeout(r, 2500))
        setConfirmLoading(false)
        setModalOpen(false)
    }, [eduhelxAssn])

    const handleCancel = useCallback(() => {
        setModalOpen(false)
    }, [])

    /**
     * States:
     * 1) Not logged in: wait until logged in.
     * 2) Logged in: `eduassn` not in QS, do nothing.
     * 3) Else, `eduhelx` in QS: prompt student if they want work on it
     * 4) Yes: launch Jupyter (if not already launched), then redirect to it with `eduassn` retained in QS. 
     * 5) No: do nothing, but make sure the QS is retained when opening apps
     */
    useEffect(() => {
        if (!loggedIn) return
        if (!eduhelxAssn) return
        setModalOpen(true)
    }, [api, loggedIn, eduhelxAssn])

    return (
        <EduhelxContext.Provider value={{}}>
            { children }
            <Modal
                title="Eduhelx Assignment"
                open={ modalOpen }
                confirmLoading={ confirmLoading }
                onOk={ handleOk }
                onCancel={ handleCancel }
                okText="Yes"
                cancelText="No"
            >
                We{`'`}ve noticed that you may be trying to work on an assignment.
                Would you like to open Jupyter?
            </Modal>
        </EduhelxContext.Provider>
    )
}

export const useEduhelxContext = () => useContext(EduhelxContext) 