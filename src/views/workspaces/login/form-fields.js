import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { ProFormText } from '@ant-design/pro-form'

const externalErrorValidator = (name, errors) => {
    return ({ getFieldValue }) => ({
        validator(_, value) {
            const error = errors.find((err) => err.fieldName === name);
            if (error) return Promise.reject(error.message);
            else return Promise.resolve();
        }
    })
}

export const UsernameInput = ({ name, errors, overrides={ fieldProps: {}, rules: [] } }) => (
    <ProFormText
        { ...overrides }
        name={ name }
        fieldProps={{
            size: "middle",
            prefix: <UserOutlined className="prefixIcon" />,
            ...overrides.fieldProps
        }}
        placeholder="Username"
        rules={[
            {
                required: true,
                message: "Please enter your username"
            },
            externalErrorValidator(name, errors),
            ...overrides.rules
        ]}
    />
)

export const PasswordInput = ({ name, errors, overrides={ fieldProps: {}, rules: [] } }) => (
    <ProFormText.Password
        { ...overrides }
        name={ name }
        fieldProps={{
            size: "middle",
            prefix: <LockOutlined className="prefixIcon" />,
            ...overrides.fieldProps
        }}
        placeholder="Password"
        rules={[
            {
                required: true,
                message: "Please enter your password"
            },
            externalErrorValidator(name, errors),
            ...overrides.rules
        ]}
    />
)