import { Fragment, useEffect, useMemo, useState } from 'react'
import { Button, Typography, Form, Divider, Space, Alert } from 'antd'
import Icon, { AppstoreOutlined, GoogleCircleFilled, GithubFilled } from '@ant-design/icons'
import { LoginForm } from '@ant-design/pro-form'
import classNames from 'classnames'
import { FormWrapper } from './form-wrapper'
import { UsernameInput, PasswordInput } from './form-fields'
import { GithubSSO, GoogleSSO, UNCSSO } from './sso'
import { withAPIReady } from '../'
import { useDest, useWorkspacesAPI } from '../../../contexts'
import '@ant-design/pro-form/dist/form.css'
import  './login.css'

const { Text, Paragraph } = Typography
const { useForm } = Form

const SSOLoginOptions = ({main, unc, google, github }) => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <Divider plain style={{ marginTop: main ? 0 : undefined }}>
            <Text style={{ color: main ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.25)", fontWeight: "normal", fontSize: 14 }}>
                { main ? "Please sign in with one of the following options" : "Or sign in with one of the following" }
            </Text>
        </Divider>
        <Space size="large" style={{ justifyContent: "center", marginTop: 8 }}>
            { unc && (
                <UNCSSO />
            ) }
            { google && (
                <GoogleSSO />
            ) }
            { github && (
                <GithubSSO />
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
    const [revalidateForm, setRevalidateForm] = useState(false)

    const [form] = useForm()
    const { api, user, loginProviders } = useWorkspacesAPI()
    const { redirectToDest } = useDest()

    const allowBasicLogin = useMemo(() => loginProviders.includes("Django"), [loginProviders])
    const allowUncLogin =  useMemo(() => loginProviders.includes("UNC Chapel Hill Single Sign-On"), [loginProviders])
    const allowGoogleLogin = useMemo(() => loginProviders.includes("Google"), [loginProviders])
    const allowGithubLogin =  useMemo(() => loginProviders.includes("GitHub"), [loginProviders])

    const hasAdditionalProviders = useMemo(() => (
        allowUncLogin ||
        allowGithubLogin ||
        allowGithubLogin
    ), [allowUncLogin, allowGoogleLogin, allowGithubLogin])

    useEffect(() => {
        if (revalidateForm) {
            form.validateFields()
            setRevalidateForm(false)
        }
    }, [revalidateForm])

    useEffect(() => {
        if (user) {
            // User has logged in, redirect back.
            redirectToDest()
        }
    }, [user])

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
                    actions={
                        hasAdditionalProviders && (
                            <SSOLoginOptions main={ !allowBasicLogin } unc={ allowUncLogin } google={ allowGoogleLogin } github={ allowGithubLogin } />
                        )
                    }
                    onFinish={ async () => {

                    } }
                    onFieldsChange={ () => setErrors([]) }
                    form={ form }
                >
                    {/* <Alert type="error" message="Your session has expired due to prolonged inactivity. Please login to continue." style={{ marginBottom: 16 }} /> */}
                    <UsernameInput name="username" { ...formFieldProps } />
                    <PasswordInput name="password" { ...formFieldProps } />
                </LoginForm>
            </FormWrapper>
        </div>
    )
})