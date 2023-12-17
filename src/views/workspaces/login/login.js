import { Fragment, useEffect, useMemo, useState } from 'react'
import { Button, Typography, Form, Divider, Space, Alert, Result } from 'antd'
import Icon, { AppstoreOutlined, WarningOutlined } from '@ant-design/icons'
import { LoginForm } from '@ant-design/pro-form'
import classNames from 'classnames'
import { FormWrapper } from './form-wrapper'
import { UsernameInput, PasswordInput } from './form-fields'
import { GithubSSO, GoogleSSO, UNCSSO } from './sso'
import { withAPIReady } from '../'
import { useDest, useEnvironment, useWorkspacesAPI } from '../../../contexts'
import '@ant-design/pro-form/dist/form.css'
import  './login.css'
import { useTitle } from '../..'

const { Title, Text, Paragraph } = Typography
const { useForm } = Form

const WhitelistRequired = (props) => (
    <Alert
        showIcon
        type="warning"
        message={ <Title level={ 5 }>Approval Required</Title> }
        description={
            <Space direction="vertical">
                <>Your request to gain access to HeLx workspaces has been forwarded to the website administrator for review.</>
                <>Once your request is approved, you will be notified via an email. This security feature is only required one time, for your initial access.</>
            </Space>
        }
        { ...props }
    />
    // <Space direction="vertical" align="center">
    //     <Title level={ 4 }>
    //         <Text type="warning" style={{ marginRight: 8 }}>
    //             <WarningOutlined />
    //         </Text>
    //         Whitelisting required
    //     </Title>
    //     Your request to gain access to the Brain-I AppStore has been forwarded to website administrator for review and whitelisting. Once your request is approved, you will be notified via an email. This security feature is only required one time, for your initial access.
    // </Space>
)

const SSOLoginOptions = ({ main, unc, google, github, onWhitelistRequired, onSignupRequired }) => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <Divider plain style={{ marginTop: main ? 0 : undefined }}>
            <Text style={{ color: main ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.25)", fontWeight: "normal", fontSize: 14 }}>
                { main ? "Please sign in with one of the following options" : "Or sign in with one of the following" }
            </Text>
        </Divider>
        <Space size="large" style={{ justifyContent: "center", marginTop: 8 }}>
            { unc && (
                <UNCSSO onWhitelistRequired={ onWhitelistRequired } onSignupRequired={ onSignupRequired } />
            ) }
            { google && (
                <GoogleSSO onWhitelistRequired={ onWhitelistRequired } onSignupRequired={ onSignupRequired } />
            ) }
            { github && (
                <GithubSSO onWhitelistRequired={ onWhitelistRequired } onSignupRequired={ onSignupRequired } />
            ) }
        </Space>
    </div>
)

export const WorkspaceLoginView = withAPIReady(({
    // If true, changes the presentation so that it can be embedded within a view rather than as its own standalone page view.
    asComponent=false
}) => {
    const [currentlyValidating, setCurrentlyValidating] = useState(false)
    const [errors, setErrors] = useState([])
    const [showWhitelistRequired, setShowWhitelistRequired] = useState(false)
    const [revalidateForm, setRevalidateForm] = useState(false)

    const [form] = useForm()
    const { basePath } = useEnvironment()
    const { api, user, loggedIn, loginProviders } = useWorkspacesAPI()
    const { redirectToDest, redirectWithCurrentDest } = useDest()

    useTitle("Login")

    useEffect(() => {
        if (loggedIn) {
            // User has logged in, redirect back.
            // If there is no "dest" qs param, then redirect to the provided default url
            // (e.g. the user manually navigated to the login view while already logged in).
            redirectToDest(`${ basePath }workspaces/`)
        }
    }, [loggedIn])

    const allowBasicLogin = useMemo(() => loginProviders.includes("Django"), [loginProviders])
    const allowUncLogin =  useMemo(() => loginProviders.includes("UNC Chapel Hill Single Sign-On"), [loginProviders])
    const allowGoogleLogin = useMemo(() => loginProviders.includes("Google"), [loginProviders])
    const allowGithubLogin =  useMemo(() => loginProviders.includes("GitHub"), [loginProviders])

    const hasAdditionalProviders = useMemo(() => (
        allowUncLogin ||
        allowGoogleLogin ||
        allowGithubLogin
    ), [allowUncLogin, allowGoogleLogin, allowGithubLogin])

    useEffect(() => {
        if (revalidateForm) {
            form.validateFields()
            setRevalidateForm(false)
        }
    }, [revalidateForm])

    const validateForm = async () => {
        setCurrentlyValidating(true)
        try {
            const { username, password } = await form.validateFields()
            try {
                // -- Make API request here --
                // await new Promise((res) => setTimeout(res, 500))
                await api.login(username, password)
                form.submit()
            } catch (error) {
                // Login was rejected
                if (error.status === 400) {
                    addError({
                        fieldName: "username",
                        message: "The username or password you entered was incorrect."
                    })
                } else {
                    addError({
                        fieldName: "username",
                        message: "Something went wrong."
                    })
                }
                setRevalidateForm(true)
            }
        } catch (e) {
            // Frontend validation failed
        }
        setCurrentlyValidating(false)
    }

    const addError = (error) => {
        // There can't be two errors on a single form field at once. Adding another will replace the old one.
        setErrors([
            ...errors.filter((err) => err.fieldName !== error.fieldName),
            error
        ])
    }

    const formFieldProps = {
        errors,
        overrides: {
            fieldProps: {
                onKeyDown: (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault()
                        validateForm()
                    }
                }
            },
            rules: []
        }
    }
    // If full page, make fields large.
    // if (!asComponent) formFieldProps.overrides.fieldProps.size = "large"

    // if (allowBasicLogin) return <SSOLoginOptions unc={ allowUncLogin } google={ allowGoogleLogin } github={ allowGithubLogin } />

    return (
        <div className={ classNames("login-form", asComponent ? "component" : "page", !allowBasicLogin && "no-basic-login") }>
            <FormWrapper asComponent={ asComponent } loading={ currentlyValidating }>
                <LoginForm
                    submitter={{
                        render: () => (
                            <Button
                                key="submit"
                                htmlType="submit"
                                type="primary"
                                size={ "middle" }
                                disabled={ currentlyValidating }
                                block
                                onClick={ (e) => {
                                    e.preventDefault()
                                    validateForm()
                                } }
                            >
                                Log in
                            </Button>
                        )
                    }}
                    title="HeLx Workspaces"
                    subTitle={
                        !asComponent ? <Paragraph style={{ fontSize: 14, maxWidth: 800, margin: "0 auto" }}>
                            The HeLx Workspaces are the primary user experience component of the HeLx data science platform.
                            Through the Workspaces, users discover and interact with analytic tools and data to explore scientific problems.
                            Its ability to empower researchers to leverage advanced analytical tools without installation or other infrastructure concerns
                            has broad reaching benefits and can be applied in many domains.
                        </Paragraph> : null
                    }
                    logo={ <AppstoreOutlined /> }
                    actions={ hasAdditionalProviders ? (
                            <SSOLoginOptions
                                main={ !allowBasicLogin }
                                unc={ allowUncLogin }
                                google={ allowGoogleLogin }
                                github={ allowGithubLogin }
                                onWhitelistRequired={ () => {
                                    setShowWhitelistRequired(true)
                                } }
                                onSignupRequired={ () => {
                                    redirectWithCurrentDest(`${ basePath }workspaces/signup/social`)
                                } }
                            />
                        ) : null
                    }
                    onFinish={ async () => {

                    } }
                    onValuesChange={ () => setErrors([]) }
                    form={ form }
                >
                    {/* <Alert type="error" message="Your session has expired due to prolonged inactivity. Please login to continue." style={{ marginBottom: 16 }} /> */}
                    <UsernameInput name="username" { ...formFieldProps } />
                    <PasswordInput name="password" { ...formFieldProps } />
                </LoginForm>
                { showWhitelistRequired && (
                    <WhitelistRequired
                        closable={ true }
                        onClose={ () => setShowWhitelistRequired(false) }
                        // align-self for auto width, instead of stretch.
                        style={{ marginTop: 16, alignSelf: "center" }}
                    />
                ) }
            </FormWrapper>
        </div>
    )
})