import { Fragment, useEffect, useMemo, useState } from 'react'
import { Button, Typography, Form, Divider, Space, Alert, Result, Spin } from 'antd'
import Icon, { AppstoreOutlined, WarningOutlined } from '@ant-design/icons'
import { LoginForm } from '@ant-design/pro-form'
import classNames from 'classnames'
import { FormWrapper } from './form-wrapper'
import { UsernameInput, EmailInput } from './form-fields'
import { GithubSSO, GoogleSSO, UNCSSO } from './sso'
import { withAPIReady } from '../'
import { useDest, useEnvironment, useWorkspacesAPI } from '../../../contexts'
import '@ant-design/pro-form/dist/form.css'
import  './login.css'
import { SocialSignupNotAuthorizedError } from '../../../contexts/workspaces-context/api.types'
import { useTitle } from '../..'

const { Title, Text, Paragraph } = Typography
const { useForm } = Form

const withSocialSignupAllowed = (View) => {
    return withAPIReady((viewProps) => {
        const { api } = useWorkspacesAPI()
        const { basePath } = useEnvironment()
        const { redirectWithCurrentDest } = useDest()

        const [allowed, setAllowed] = useState(undefined)

        useEffect(() => {
            setAllowed(undefined)
            void async function() {
                setAllowed(await api.socialSignupAllowed())
            }()
        }, [api])

        if (allowed === undefined) return (
            <Space direction="vertical" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", flex: 1 }}>
                <Spin />
            </Space>
        )
        else if (allowed === false) {
            redirectWithCurrentDest(`${ basePath }workspaces/login/`)
            return null
        }
        else return (
            <View { ...viewProps } />
        )
    })
}

export const WorkspaceSignupView = withSocialSignupAllowed(({
    // If true, changes the presentation so that it can be embedded within a view rather than as its own standalone page view.
    asComponent=false
}) => {
    const [currentlyValidating, setCurrentlyValidating] = useState(false)
    const [errors, setErrors] = useState([])
    const [revalidateForm, setRevalidateForm] = useState(false)

    const [form] = useForm()
    const { basePath } = useEnvironment()
    const { api, user, loggedIn, loginProviders } = useWorkspacesAPI()
    const { redirectToDest, redirectWithCurrentDest } = useDest()

    useTitle("Signup")
    
    useEffect(() => {
        if (loggedIn) {
            // User has logged in, redirect back.
            // If there is no "dest" qs param, then redirect to the provided default url
            // (e.g. the user manually navigated to the login view while already logged in).
            redirectToDest(`${ basePath }workspaces/`)
        }
    }, [loggedIn])

    useEffect(() => {
        if (revalidateForm) {
            form.validateFields()
            setRevalidateForm(false)
        }
    }, [revalidateForm])

    const validateForm = async () => {
        setCurrentlyValidating(true)
        try {
            const { username, email } = await form.validateFields()
            try {
                // -- Make API request here --
                await api.socialSignup(username, email)
                form.submit()
            } catch (error) {
                // Signup was rejected
                if (error.status === 400) {
                    const fields = error.axiosResponse.data.form.fields
                    Object.entries(fields).forEach(([fieldName, field]) => {
                        field.errors.forEach((message) => {
                            addError({
                                fieldName,
                                message
                            })
                        })
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
        <div className={ classNames("login-form", asComponent ? "component" : "page") }>
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
                                Sign up
                            </Button>
                        )
                    }}
                    title="HeLx Workspaces"
                    subTitle={
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            { !asComponent ? <Paragraph style={{ fontSize: 14, maxWidth: 800, margin: "0 auto" }}>
                                The HeLx Workspaces are the primary user experience component of the HeLx data science platform.
                                Through the Workspaces, users discover and interact with analytic tools and data to explore scientific problems.
                                Its ability to empower researchers to leverage advanced analytical tools without installation or other infrastructure concerns
                                has broad reaching benefits and can be applied in many domains.
                            </Paragraph> : null }
                            <Paragraph style={{ fontSize: 14, maxWidth: 800, margin: "0 auto", textAlign: "start" }}>
                                <Alert
                                    showIcon
                                    message={ <Title level={ 5 }>Signup required</Title> }
                                    description={
                                        <Space direction="vertical">
                                            <>The username or email associated with your account is already in use by another Workspaces account.</>
                                            <>Please register using a different email/password to gain access to Workspaces.</>
                                        </Space>
                                    }
                                    style={{ marginTop: 32, marginBottom: -8 }}
                                />
                            </Paragraph>
                        </div>
                    }
                    logo={ <AppstoreOutlined /> }
                    onFinish={ async () => {

                    } }
                    onValuesChange={ () => setErrors([]) }
                    form={ form }
                >
                    <UsernameInput name="username" { ...formFieldProps } />
                    <EmailInput name="email" { ...formFieldProps } />
                </LoginForm>
            </FormWrapper>
        </div>
    )
})