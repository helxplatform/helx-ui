import { Fragment } from 'react'
import { Layout, Spin } from 'antd'

const { Content } = Layout

const Spinner = ({ loading, children }) => (
    <Spin className="login-spin" spinning={ loading }>
        { children }
    </Spin>
)

// This is a small wrapper component to facilitate using the login form as both a component and standalone page.
export const FormWrapper = ({ asComponent, loading, children }) => {
    if (asComponent) return (
        <Fragment>
            {/* <Spinner loading={ loading }> */}
                { children }
            {/* </Spinner> */}
        </Fragment>
    )
    return (
        <Fragment>
            {/* <Spinner loading={ loading }> */}
                <Content>
                    { children }
                </Content>
            {/* </Spinner> */}
        </Fragment>
        // <div className="ant-pro-form-login-page">
        //     <div className="ant-pro-form-login-page-notice"></div>
        //     <div className="ant-pro-form-login-page-container">
        //         <Spinner loading={ loading }>
        //             { children }
        //         </Spinner>
        //     </div>
        // </div>
    )
}