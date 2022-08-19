import { useState } from 'react'
import { Button, Typography, Form } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'
import { LoginForm } from '@ant-design/pro-form'
import classNames from 'classnames'
import { FormWrapper } from './form-wrapper'
import { UsernameInput, PasswordInput } from './form-fields'
import '@ant-design/pro-form/dist/form.css'
import  './login.css'

const { Text, Paragraph } = Typography
const { useForm } = Form

export const WorkspaceLoginView = ({
    // If true, changes the presentation so that it can be embedded within a view rather than as its own standalone page view.
    asComponent=false
}) => {
    const [currentlyValidating, setCurrentlyValidating] = useState(false)
    const [errors, setErrors] = useState([])
    const [form] = useForm()

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
    if (!asComponent) formFieldProps.overrides.fieldProps.size = "large"

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
                                size={ asComponent ? "middle" : "large" }
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
                    // actions={}
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