import React from 'react'
import ReactAvatarEditor from 'react-avatar-editor'

export class CustomReactAvatarEditor extends ReactAvatarEditor {
    static defaultProps = {
        showGrid: false,
        gridOnlyOnDrag: false,
        ...ReactAvatarEditor.defaultProps
    }
    pixelRatio = typeof window !== 'undefined' && window.devicePixelRatio
      ? window.devicePixelRatio
      : 1

      cropHandleDimensions = [24, 5]

    pageX = undefined
    pageY = undefined
    
    constructor(props) {
        super(props)

        this.state = {
            ...this.state,
            scalingHandle: undefined,
            scaling: false
        }
    }

    computeCropHandles() {
        const [handleLong, handleShort] = this.cropHandleDimensions

        const dimensions = this.getDimensions()
        const [x, y] = this.getBorders(dimensions.border)
        const width = dimensions.canvas.width - x * 2
        const height = dimensions.canvas.height - y * 2

        const GRID_OFFSET = 0.5

        const CORNER_UPPER_LEFT_X = x + GRID_OFFSET
        const CORNER_UPPER_LEFT_Y = y + GRID_OFFSET
        
        const CORNER_UPPER_RIGHT_X = x + width - GRID_OFFSET
        const CORNER_UPPER_RIGHT_Y = y + GRID_OFFSET
        
        const CORNER_BOTTOM_LEFT_X = x + GRID_OFFSET
        const CORNER_BOTTOM_LEFT_Y = y + height - GRID_OFFSET

        const CORNER_BOTTOM_RIGHT_X = x + width - GRID_OFFSET
        const CORNER_BOTTOM_RIGHT_Y = y + height - GRID_OFFSET

        return {
            "top-left" : [
                [CORNER_UPPER_LEFT_X - handleShort, CORNER_UPPER_LEFT_Y - handleShort, handleShort, handleLong],
                [CORNER_UPPER_LEFT_X - handleShort, CORNER_UPPER_LEFT_Y - handleShort, handleLong, handleShort]
            ],
            "top-right" : [
                [CORNER_UPPER_RIGHT_X, CORNER_UPPER_RIGHT_Y - handleShort, handleShort, handleLong],
                [CORNER_UPPER_RIGHT_X + handleShort, CORNER_UPPER_RIGHT_Y - handleShort, -handleLong, handleShort]
            ],
            "bottom-left" : [
                [CORNER_BOTTOM_LEFT_X - handleShort, CORNER_BOTTOM_LEFT_Y + handleShort, handleShort, -handleLong],
                [CORNER_BOTTOM_LEFT_X - handleShort, CORNER_BOTTOM_LEFT_Y, handleLong, handleShort]
            ],
            "bottom-right" : [
                [CORNER_BOTTOM_RIGHT_X, CORNER_BOTTOM_RIGHT_Y + handleShort, handleShort, -handleLong],
                [CORNER_BOTTOM_RIGHT_X + handleShort, CORNER_BOTTOM_RIGHT_Y, -handleLong, handleShort]
            ]
        }
    }
    computeCropHandleSquares() {
        const [handleLong, handleShort] = this.cropHandleDimensions

        const squareSize = handleLong

        const dimensions = this.getDimensions()
        const [x, y] = this.getBorders(dimensions.border)
        const width = dimensions.canvas.width - x * 2
        const height = dimensions.canvas.height - y * 2

        const GRID_OFFSET = 0.5

        const CORNER_UPPER_LEFT_X = x + GRID_OFFSET
        const CORNER_UPPER_LEFT_Y = y + GRID_OFFSET
        
        const CORNER_UPPER_RIGHT_X = x + width - GRID_OFFSET
        const CORNER_UPPER_RIGHT_Y = y + GRID_OFFSET
        
        const CORNER_BOTTOM_LEFT_X = x + GRID_OFFSET
        const CORNER_BOTTOM_LEFT_Y = y + height - GRID_OFFSET

        const CORNER_BOTTOM_RIGHT_X = x + width - GRID_OFFSET
        const CORNER_BOTTOM_RIGHT_Y = y + height - GRID_OFFSET
        
        return {
            "top-left" : [CORNER_UPPER_LEFT_X - handleShort, CORNER_UPPER_LEFT_Y - handleShort, squareSize, squareSize],
            "top-right" : [CORNER_UPPER_RIGHT_X + handleShort, CORNER_UPPER_RIGHT_Y - handleShort, -squareSize, squareSize],
            "bottom-left" : [CORNER_BOTTOM_LEFT_X - handleShort, CORNER_BOTTOM_LEFT_Y + handleShort, squareSize, -squareSize],
            "bottom-right" : [CORNER_BOTTOM_RIGHT_X + handleShort, CORNER_BOTTOM_RIGHT_Y + handleShort, -squareSize, -squareSize]
        }
    }
    drawGrid(context, gridColor, threesGrid) {
        const dimensions = this.getDimensions()
        const [x, y] = this.getBorders(dimensions.border)
        const width = dimensions.canvas.width - x * 2
        const height = dimensions.canvas.height - y * 2

        context.beginPath()
        context.strokeStyle = 'rgba(' + gridColor.join(',') + ')'
        context.lineWidth = 1

        const thirdsX = width / 3
        const thirdsY = height / 3
        
        context.moveTo(x, y)
        context.lineTo(x, y + height)
        if (threesGrid) {
            context.moveTo(thirdsX * 1 + x, y)
            context.lineTo(thirdsX * 1 + x, y + height)
            context.moveTo(thirdsX * 2 + x, y)
            context.lineTo(thirdsX * 2 + x, y + height)
        }
        context.moveTo(thirdsX * 3 + x, y)
        context.lineTo(thirdsX * 3 + x, y + height)

        // The -1/+1 here are to make sure the line goes the full distance (not noticeable on the other lines because they connect to border lines)
        context.moveTo(x - 1, y)
        context.lineTo(x + width + 1, y)
        if (threesGrid) {
            context.moveTo(x, thirdsY * 1 + y)
            context.lineTo(x + width, thirdsY * 1 + y)
            context.moveTo(x, thirdsY * 2 + y)
            context.lineTo(x + width, thirdsY * 2 + y)
        }
        context.moveTo(x - 1, thirdsY * 3 + y)
        context.lineTo(x + width + 1, thirdsY * 3 + y)

        context.stroke()
    }
    drawCropHandles(context, gridColor) {
        context.beginPath()
        context.fillStyle = 'rgb(246, 246, 246)'
        
        const rects = this.computeCropHandles()
        Object.values(rects).forEach(([ horizontalRect, verticalRect ]) => {
            context.fillRect(...horizontalRect)
            context.fillRect(...verticalRect)
        })

        context.stroke()
    }
    drawBorderRadius(context) {
        const dimensions = this.getDimensions()
        const [x, y] = this.getBorders(dimensions.border)
        const width = dimensions.canvas.width - x * 2
        const height = dimensions.canvas.height - y * 2

        const borderRadius = Math.min(width / 2, height / 2)

        context.beginPath()
        context.strokeStyle = "rgba(0, 0, 0, 0)"

        if (borderRadius === 0) {
            context.rect(x, y, width, height)
        } else {
            const widthMinusRad = width - borderRadius
            const heightMinusRad = height - borderRadius
            context.translate(x, y)
            context.arc(
                borderRadius,
                borderRadius,
                borderRadius,
                Math.PI,
                Math.PI * 1.5,
            )
            context.lineTo(widthMinusRad, 0)
            context.arc(
                widthMinusRad,
                borderRadius,
                borderRadius,
                Math.PI * 1.5,
                Math.PI * 2,
            )
            context.lineTo(width, heightMinusRad)
            context.arc(
                widthMinusRad,
                heightMinusRad,
                borderRadius,
                Math.PI * 2,
                Math.PI * 0.5,
            )
            context.lineTo(borderRadius, height)
            context.arc(
                borderRadius,
                heightMinusRad,
                borderRadius,
                Math.PI * 0.5,
                Math.PI,
            )
            context.translate(-x, -y)
        }
        context.stroke()
    }
    paint(context) {
        const dimensions = this.getDimensions()
        const [borderSizeX, borderSizeY] = this.getBorders(dimensions.border)
        const width = dimensions.canvas.width
        const height = dimensions.canvas.height
        const imagePosition = this.calculatePosition(this.state.image, this.props.border)

        const backgroundColorChannels = this.props.color.slice(0, 3)
        const alpha = this.props.color[3]

        context.save()
        context.scale(this.pixelRatio, this.pixelRatio)
        context.translate(0, 0)
        
        context.fillStyle = 'rgba(' + [...backgroundColorChannels, alpha].join(',') + ')'
        context.rect(imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height) // outer rect, drawn "counterclockwise"
        context.fill('evenodd')
        
        // context.fillStyle = 'rgba(' + [...backgroundColorChannels, alpha].join(',') + ')'
        // context.rect(width, 0, -width, height)
        // context.fill('evenodd')
        
        this.drawGrid(
            context,
            this.props.gridColor,
            this.state.drag
        )
        this.drawCropHandles(
            context,
            this.props.gridColor
        )
        this.drawBorderRadius(
            context
        )
        context.restore()
    }

    recomputeCropHandles() {
        const canvas = this.canvas
        const pageX = this.pageX
        const pageY = this.pageY
        const canvasRect = canvas.getBoundingClientRect()
        const offset = {
            "top": canvasRect.top + window.pageYOffset,
            "left": canvasRect.left + window.pageXOffset
        }
        const mouseX = pageX - offset.left
        const mouseY = pageY - offset.top
        const cropHandleSquares = this.computeCropHandleSquares()
        const collision = Object.keys(cropHandleSquares).find((key) => {
            const [ startX, startY, width, height ] = cropHandleSquares[key]
            let x1 = startX
            let x2 = startX + width
            let y1 = startY
            let y2 = startY + height
            if (width < 0) [x1, x2] = [x2, x1]
            if (height < 0) [y1, y2] = [y2, y1]
            if (
                mouseX >= x1 && mouseY >= y1 &&
                mouseX <= x2 && mouseY <= y2
            ) {
                // Collision
                return key
            }
        })
        if (this.state.scalingHandle != collision && !this.state.scaling) {
            this.setState({ scalingHandle : collision })
        }
    }

    computeCursorStyle() {
        let cursor = "pointer"
        switch (this.state.scalingHandle) {
            case "top-left":
            case "bottom-right":
                cursor = "nwse-resize"
                break
            case "top-right":
            case "bottom-left":
                cursor = "nesw-resize"
                break
        }
        return cursor
    }

    mouseTracker = (e) => {
        const { pageX, pageY } = e
        this.pageX = pageX
        this.pageY = pageY
        
        const canvas = this.canvas
        if (canvas) {
            this.recomputeCropHandles()
        }
    }

    // Because handleMouseDown is a arrow function stored as a field, it cannot be overriden like normal.
    _handleMouseDown = (e) => {
        if (this.state.scalingHandle) {
            this.setState({ scaling : true })
        } else {
            this.handleMouseDown(e)
        }
    }
    _handleMouseUp = (e) => {
        if (this.state.scaling) {
            this.setState({ scaling: false }, () => {
                // Make sure it updates the crop handle once scaling is set to false.
                this.recomputeCropHandles()
            })
        } else {
            this.handleMouseUp(e)
        }
    }

    componentDidMount() {
        super.componentDidMount()

        window.addEventListener("mousemove", this.mouseTracker)
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        
        window.removeEventListener("mousemove", this.mouseTracker)
    }

    render() {
        const renderedCanvas = super.render()
        const wrappedCanvas = React.cloneElement(renderedCanvas, {
            style: {
                ...renderedCanvas.props.style,
                cursor: this.computeCursorStyle()
            },
            onMouseDown: this._handleMouseDown,
            onMouseUp: this._handleMouseUp
        })
        return (
            <div>
                Collision: { JSON.stringify(this.state.scalingHandle ?? "none") }
                <br />
                Scaling: { JSON.stringify(this.state.scaling) }
                { wrappedCanvas }
            </div>
        )
    }
}