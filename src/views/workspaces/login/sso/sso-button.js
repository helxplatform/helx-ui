import { Button, Typography } from 'antd'
import Icon from '@ant-design/icons'
import { useWorkspacesAPI } from '../../../../contexts'
import './sso-button.css'

const { Text } = Typography

export const SSOButton = ({
    // Icons should be 24x24
    icon,
    foreground,
    background,
    iconBackground=undefined,
    children,
    style,
    ...props
}) => {
    const hasIconBackground = iconBackground && iconBackground !== background
    return (
        <Button
            className="sso-button"
            icon={
                <div style={{
                    height: 36,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 2.5,
                    ...(hasIconBackground ? {
                        marginLeft: 1,
                        marginTop: -3,
                        marginBottom: -3,
                        paddingLeft: 7,
                        paddingRight: 7,
                        background: iconBackground
                    } : {
                        marginRight: 12
                    })
                }}>
                    { icon }
                </div>
            }
            style={{
                background,
                justifyContent: hasIconBackground ? "flex-start" : "center",
                ...style
            }}
            { ...props }
        >
            <Text
                strong
                style={{ 
                    color: foreground,
                    margin: 0,
                    flexGrow: hasIconBackground ? 1 : undefined,
                    fontSize: 15
                }}
            >
                { children }
            </Text>
        </Button>
    )
}

export const SAMLButton = ({
    login=() => {},
    onWhitelistRequired=() => {},
    ...props
}) => {
    const { api, loggedIn } = useWorkspacesAPI()
    return (
        <SSOButton
            { ...props }
            onClick={ async () => {
                try {
                    await login()
                    if (!loggedIn) onWhitelistRequired()
                } catch (e) {
                    console.log("SAML aborted")
                }
            } }
        />
    )
}