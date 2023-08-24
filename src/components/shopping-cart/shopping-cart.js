import { Fragment, useEffect, useMemo, useState } from 'react'
import { Space, Layout, Typography, Menu, Modal, Checkbox, Select, notification } from 'antd'
import { ShoppingCartOutlined, LoadingOutlined } from '@ant-design/icons'
import { CartListLayout, useShoppingCart } from 'antd-shopping-cart'
import YAML from 'yaml'
import download from 'js-file-download'
import './shopping-cart.css'

const { Title, Text } = Typography
const { Sider, Content } = Layout
const { Option } = Select

const ExportFormats = {
  JSON: {
    name: "JSON"
  },
  YAML: {
    name: "YAML"
  },
  CSV: {
    name: "CSV"
  }
}


export const ShoppingCart = () => {
  const { buckets, carts, activeCart, setActiveCart, updateCart } = useShoppingCart()
  const [exportItems, setExportItems] = useState([])
  const [exportFormat, setExportFormat] = useState("JSON")
  const [exportReadable, setExportReadable] = useState(true)
  const [deleteItemsAfterExport, setDeleteItemsAfterExport] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)

  const exportingFullCart = useMemo(() => exportItems.length === activeCart.items.length, [activeCart, exportItems])

  useEffect(() => {
    if (!showExportModal) {
      setExportItems([])
      setExportFormat("JSON")
      setExportReadable(true)
      setDeleteItemsAfterExport(true)
    }
  }, [showExportModal])

  return (
    <Fragment>
      <CartListLayout
        onCheckout={ (selectedItems) => {
          setExportItems(selectedItems.length === 0 ? activeCart.items : selectedItems )
          setShowExportModal(true)
        } }
        cartListProps={{
          extraProps: {
            renderCheckoutText: (selectedCount) => selectedCount > 0 ? `Export ${ selectedCount } selected item${ selectedCount !== 1 ? "s" : "" }` : "Export"
          }
        }}
      />
      <Modal
        title="Export items"
        okText="Confirm"
        cancelText="Cancel"
        destroyOnClose={ true }
        width={ 400 }
        visible={ showExportModal }
        onVisibleChange={ setShowExportModal }
        onOk={ () => {
          setShowExportModal(false)
          notification.open({
            message: "Download will begin shortly...",
            description: "",
            duration: 1.5,
            icon: <LoadingOutlined style={{ color: "#1890ff" }} />,
            placement: "bottomLeft"
          })
          const date = new Date()
          const name = `${ activeCart.name }_${ (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear() }`
          let fileName

          const items = exportItems.length > 0 ? exportItems : activeCart.items;

          const cart = {
            concept_id: [],
            study_id: [],
            variable_id: [],
            cde_id: [],
          }

          items.forEach(({bucketId, id}) => {
            switch (bucketId) {
              case 'concepts': cart.concept_id.push(id); break;
              case 'studies': cart.study_id.push(id); break;
              case 'variables': cart.variable_id.push(id); break;
              case 'cdes': cart.cde_id.push(id); break;
              default: break;
            }
          })

          let data
          if (exportFormat === "JSON") {
            fileName = `${ name }.json`
            data = exportReadable ? JSON.stringify(
            cart,
            undefined,
            4
            ) : JSON.stringify(cart)
          } else if (exportFormat === "YAML") {
            fileName = `${ name }.yaml`
            data = YAML.stringify(cart)
          } else if (exportFormat === "CSV") {
            fileName = `${ name }.csv`

            data = Object.keys(cart).join(',') + '\n';

            const getRow = (i) => Object.keys(cart).map((col) => cart[col][i]);

            for (let i = 0; getRow(i).some((col) => col !== undefined); ++i) {
              data += getRow(i).join(',') + '\n';
            }
          }

          if (deleteItemsAfterExport) {
            updateCart(activeCart, {
            items: activeCart.items.filter((item) => !exportItems.find((_item) => _item.id === item.id))
            })
          }

          setTimeout(() => download(
            data,
            fileName
          ), 2000)
        } }
        onCancel={ () => setShowExportModal(false) }
        zIndex={1032}
        maskStyle={{ zIndex: 1031 }}
      >
        <Title type="" style={{
          // textAlign: "center",
          color: "#434343",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 16
        }}>
          Exporting from { activeCart.name } - { exportItems.length } items
        </Title>
        <Space direction="vertical" size="middle">
          <div style={{ display: "flex", alignItems: "center" }}>
              <Text>
                Export format:
              </Text>
              <Select value={ exportFormat } onChange={ setExportFormat } style={{ marginLeft: 8 }}>
                { Object.keys(ExportFormats).map((formatKey) => <Option value={ formatKey }>{ ExportFormats[formatKey].name }</Option> ) }
              </Select>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={ exportReadable } onChange={ () => setExportReadable(!exportReadable) }>
                Export in human-readable format
              </Checkbox>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={ deleteItemsAfterExport } onChange={ () => setDeleteItemsAfterExport(!deleteItemsAfterExport) }>
                { exportingFullCart ? "Empty cart after export" : "Remove items from cart after export" }
              </Checkbox>
          </div>
        </Space>
      </Modal>
    </Fragment>
  )
}