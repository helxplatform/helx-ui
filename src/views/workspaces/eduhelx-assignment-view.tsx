import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Layout, Progress, Result, Spin, StepProps, Steps, Typography } from 'antd'
import { DownloadOutlined, RocketOutlined, LoadingOutlined, CheckOutlined, WarningOutlined } from '@ant-design/icons'
import { withWorkspaceAuthentication } from './workspace-protected-view'
import { useTitle } from '../view'
import { Breadcrumbs } from '../../components/layout'
import { validateLocalstorageValue } from '../../components/workspaces'
import { useEnvironment, useWorkspacesAPI } from '../../contexts'
import { AppInstance, AvailableApp } from '../../contexts/workspaces-context/api.types'
import { toBytes, bytesToMegabytes } from '../../utils/memory-converter'
/* eslint-disable */
const { useLocation, useNavigate } = require('@gatsbyjs/reach-router')

const { Title, Text } = Typography
const { Content } = Layout

export const EDUHELX_ASSN_QS_PARAM = "eduassn"

interface StepDone {
    (): void
}

interface StepPaneProps {
    done: StepDone
}

interface LaunchingPaneProps extends StepPaneProps {
    appIcon: string | undefined
    appReady: boolean
}

const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

const DownloadPane = ({ done }: StepPaneProps) => {
    const [percent, setPercent] = useState<number>(0)
    
    useEffect(() => {
        let timeout: number
        const startTime = Date.now()
        const targetDuration = 2000
        const update = () => {
            const currentTime = Date.now()
            const elapsedTime = currentTime - startTime
            const trueProgress = Math.min(elapsedTime / targetDuration, 1)
            // This gives the progress a slight jitteriness.
            const randomnessFactor = Math.random() * 0.01
            const progress = easeInOutCubic(trueProgress) + randomnessFactor

            const stallChance = 0.025 + 0.0125 * progress
            const stallDuration = 50 + 150 * progress
            // const stall = Math.random() < stallChance
            const stall = false

            setPercent(progress * 100)

            if (progress >= 1) {
                setTimeout(() => done(), 1000)
            } else {
                timeout = window.setTimeout(update, stall ? stallDuration : 25)
            }
        }
        timeout = window.setTimeout(update, 25)
        return () => {
            window.clearTimeout(timeout)
        }
    }, [done])

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            flexGrow: 1
        }}>
            <Progress percent={ percent } showInfo={ false } style={{ width: 600, marginBottom: 8 }} />
            <Text type="secondary">We're getting your assignment ready, please wait a few seconds...</Text>
        </div>
    )
}
const LaunchingPane = ({ appIcon, appReady, done }: LaunchingPaneProps) => {
    useEffect(() => {
        if (appReady) done()
    }, [appReady, done])

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            flexGrow: 1
        }}>
            { appIcon && (
                <img
                    src={ appIcon }
                    alt="App Icon"
                    width="100"
                />
            ) }
            <h2 style={{ marginTop: 16 }}>Connecting...</h2>
            <Spin size="large" style={{ marginTop: 16 }} />
        </div>
    )
}
const RedirectingPane = ({ done }: StepPaneProps) => {
    const location = useLocation()

    useEffect(() => {
        const timeout = setTimeout(() => {
            done()
        }, 1500)
        return () => {
            clearTimeout(timeout)
        }
    }, [location.search])

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            flexGrow: 1
        }}>
            <Result
                status="success"
                title="Successfully launched Jupyter"
                subTitle="Redirecting..."
            />
        </div>
    )
}

export const EduhelxAssignmentView = withWorkspaceAuthentication(() => {
    const [currentStep, setCurrentStep] = useState<number>(0)
    const [app, setApp] = useState<AvailableApp>()
    const [appReady, setAppReady] = useState<boolean>(false)
    const [appIcon, setAppIcon] = useState<string>()
    const [failed, setFailed] = useState<boolean>(false)

    const { api, appstoreContext } = useWorkspacesAPI()!
    const { basePath } = useEnvironment() as any
    const location = useLocation()
    const navigate = useNavigate()
    
    useTitle("Assignment")

    const nextStep = useCallback(() => {
        setCurrentStep((currentStep) => currentStep + 1)
    }, [])

    const openJupyter = async () => {
        if (!app) return
        const instances = await api.getAppInstances()
        const appInstance = instances.find(({ aid }) => aid === app.app_id)!
        window.location.href = appInstance.url
    }

    const steps = useMemo(() => {
        const steps: any[] = [
            {
                key: 0,
                title: 'Downloading',
                icon: <DownloadOutlined />,
                content: <DownloadPane done={ () => nextStep() } />
            },
            {
                key: 1,
                title: 'Launching',
                icon: <RocketOutlined />,
                content: <LaunchingPane appIcon={ appIcon } appReady={ appReady } done={ () => nextStep() } />
            },
            {
                key: 2,
                title: 'Finished',
                icon: <CheckOutlined />,
                content: <RedirectingPane done={ () => openJupyter() } />
            }
        ]
        if (failed) {
            steps[currentStep].title = (
                <span style={{ color: "#ff4d4f" }}>{ steps[currentStep].title }</span>
            )
            steps[currentStep].icon = <span style={{ color: "#ff4d4f" }}>
                <WarningOutlined style={{ fontSize: 18, marginBottom: 4 }} />
            </span>
        }
        return steps
    }, [appIcon, appReady, currentStep, failed, nextStep])
    
    const breadcrumbs = [
        { text: 'Home', path: '/helx' },
        { text: 'Workspaces', path: '/helx/workspaces' },
        { text: 'Eduhelx', path: '/helx/workspaces/edu' },
        { text: 'Assignment', path: '/helx/workspaces/edu/assignment' },
    ]

    /** */

    useEffect(() => {
        setApp(undefined)
        setAppIcon(undefined)
        if (!api || !appstoreContext) return

        void async function() {
            try {
                const apps = await api.getAvailableApps()
                
                const jupyterApp = Object.values(apps).find(({ app_id }) => /jupyter/i.test(app_id))!
                const jupyterIconUrl = `${appstoreContext.dockstore_app_specs_dir_url}/${jupyterApp.app_id}/icon.png`

                setApp(jupyterApp)
                setAppIcon(jupyterIconUrl)
            } catch (e: any) {
                setFailed(true)
            }
        }()
    }, [api, appstoreContext])

    useEffect(() => {
        setFailed(false)
        setAppReady(false)
        if (!app) return

        let appInstance: AppInstance | undefined

        // Launch Jupyter if an instance does not already exist
        void async function() {
            try {
                const instances = await api.getAppInstances()
                appInstance = instances.find(({ aid }) => aid === app.app_id)
                if (!appInstance) {
                    console.log("Jupyter instance doesn't exist, launching new one...")
                    const { app_id: appId, minimum_resources: min, maximum_resources: max } = app
                    const cpu = validateLocalstorageValue('cpu', appId, min.cpus, max.cpus)
                    const gpu = validateLocalstorageValue('gpu', appId, min.gpus, max.gpus)
                    const mem = validateLocalstorageValue('memory', appId, toBytes(min.memory), toBytes(max.memory))
                    await api.launchApp(appId, cpu, gpu, bytesToMegabytes(mem))
                }
            } catch (e: any) {
                setFailed(true) 
            }
        }()

        let timeout: number
        const poll = async () => {
            try {
                const ready = !!appInstance && await api.getAppReady(appInstance.url)
                if (ready) setAppReady(true)
                else timeout = window.setTimeout(poll, 5000)
            } catch (e: any) {
                if (e.status === 404) {
                    // The app was deleted, don't retry.
                    setFailed(true)
                } else {
                    // Unclear, retry.
                    timeout = window.setTimeout(poll, 5000)
                }
            }
        }
        poll()

        return () => {
            window.clearTimeout(timeout)
        }
    }, [app])

    /** */


    const eduhelxAssn = useMemo(() => {
        const qs = new URLSearchParams(window.location.search)
        const eduassn = qs.get(EDUHELX_ASSN_QS_PARAM)
        return eduassn
    }, [location])

    useEffect(() => {
        // Redirect if query param not present.
        if (!eduhelxAssn) navigate(`${ basePath }workspaces/edu/`)
    }, [eduhelxAssn, navigate, basePath])

    return (
        <Layout>
            <Breadcrumbs crumbs={ breadcrumbs } />
            <Title level={ 3 } style={{ marginBottom: 16 }}>Eduhelx &bull; Assignment 01</Title>
            <Layout style={{ display: "flex", flexDirection: "column" }}>
                <Steps current={ currentStep } items={ steps } />
                { failed ? (
                    <Content style={{ }}>
                        <Result
                            status="error"
                            title={ `${ currentStep === 0 ? "Downloading " : currentStep === 1 ? "Launching " : "Assignment " }Failed` }
                            subTitle="Please refresh the page and try again or contact support."
                            extra={[
                                <Button key={ 0 } onClick={ () => {
                                    window.location.reload ()
                                } }>Try again</Button>
                            ]}
                            style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}
                        >   
                        </Result>
                    </Content>
                ) : (
                    <div style={{ flexGrow: "1", marginTop: 16, display: "flex" }}>{ steps[currentStep].content }</div>
                ) }
            </Layout>
        </Layout>
    )
})