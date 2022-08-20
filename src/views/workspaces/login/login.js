import { Fragment, useState } from 'react'
import { Button, Typography, Form, Divider, Space } from 'antd'
import Icon, { AppstoreOutlined, GoogleCircleFilled, GithubFilled } from '@ant-design/icons'
import { LoginForm } from '@ant-design/pro-form'
import classNames from 'classnames'
import { FormWrapper } from './form-wrapper'
import { UsernameInput, PasswordInput } from './form-fields'
import { GithubSSO, GoogleSSO, UNCSSO } from './sso'
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

export const WorkspaceLoginView = ({
    // If true, changes the presentation so that it can be embedded within a view rather than as its own standalone page view.
    asComponent=false
}) => {
    const [currentlyValidating, setCurrentlyValidating] = useState(false)
    const [errors, setErrors] = useState([])
    const [form] = useForm()

    const allowBasicLogin = true
    const allowUncLogin =  true
    const allowGoogleLogin = true
    const allowGithubLogin =  true

    const validateForm = async () => {
        setCurrentlyValidating(true)
        try {
            const { username, password } = await form.validateFields()
            try {
                // -- Make API request here --
                console.log(username, password)
                form.submit()
            } catch (error) {
                // Login was rejected
            }
        } catch (e) {
            // Frontend validation failed
        }
        await new Promise((res) => setTimeout(res, 1000))
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
                        <SSOLoginOptions main={ !allowBasicLogin } unc={ allowUncLogin } google={ allowGoogleLogin } github={ allowGithubLogin } />
                    }
                    onFinish={ async () => {

                    } }
                    onFieldsChange={ () => setErrors([]) }
                    form={ form }
                >
                    <UsernameInput name="username" { ...formFieldProps } />
                    <PasswordInput name="password" { ...formFieldProps } />
                </LoginForm>
            </FormWrapper>
        </div>
    )
}