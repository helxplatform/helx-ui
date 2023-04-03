import { thisExpression } from '@babel/types'
import React from 'react'
import ReactAvatarEditor from 'react-avatar-editor'

export class CustomReactAvatarEditor extends ReactAvatarEditor {
    static defaultProps = {
        showGrid: false,
        gridOnlyOnDrag: false,
        minimumCropSize: 36,
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

    calculateXYWithScaling() {
        const dimensions = this.getDimensions()
        const [x, y] = this.getBorders(dimensions.border)
        if (!this.state.scaling) return [x, y]
        return [x, y]
    }
    computeCropWithScaling(scalingFactor) {
        if (!scalingFactor) scalingFactor = this.state.scalingFactor
        const dimensions = this.getDimensions()
        let [x, y] = this.getBorders(dimensions.border)
        let width = dimensions.canvas.width - x * 2
        let height = dimensions.canvas.height - y * 2
        if (!this.state.scaling) return [x, y, width, height]
        width *= scalingFactor
        height *= scalingFactor
        switch (this.state.scalingHandle) {
            case "top-left":
                x = x + dimensions.width - width
                y = y + dimensions.height - height
                break
            case "top-right":
                x = x
                y = y + dimensions.height - height
                break
            case "bottom-left":
                x = x + dimensions.width - width
                y = y
                break
            case "bottom-right":
                x = x
                y = y
                break
        }
        return [x, y, width, height]
    }

    computeCropHandles() {
        const [handleLong, handleShort] = this.cropHandleDimensions

        const dimensions = this.getDimensions()
        // const [x, y] = this.calculateXYWithScaling()
        // const width = dimensions.canvas.width - x * 2
        // const height = dimensions.canvas.height - y * 2
        const [x, y, width, height] = this.computeCropWithScaling()

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
        const [x, y] = this.calculateXYWithScaling()
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
        const [x, y, width, height] = this.computeCropWithScaling()

        context.save()
        context.translate(x, y)
        // if (this.state.scaling) context.scale(this.state.scalingFactor, this.state.scalingFactor)

        context.beginPath()
        context.strokeStyle = 'rgba(' + gridColor.join(',') + ')'
        context.lineWidth = 1
        // Don't want to scale the grid's line sizing, or it becomes difficult to see.
        // if (this.state.scaling) context.lineWidth /= this.state.scalingFactor

        const thirdsX = width / 3
        const thirdsY = height / 3
        
        context.moveTo(0, 0)
        context.lineTo(0, height)
        if (threesGrid) {
            context.moveTo(thirdsX * 1, 0)
            context.lineTo(thirdsX * 1, height)
            context.moveTo(thirdsX * 2, 0)
            context.lineTo(thirdsX * 2, height)
        }
        context.moveTo(thirdsX * 3, 0)
        context.lineTo(thirdsX * 3, height)

        // The -1/+1 here are to make sure the line goes the full distance (not noticeable on the other lines because they connect to border lines)
        context.moveTo(-1, 0)
        context.lineTo(width + 1, 0)
        if (threesGrid) {
            context.moveTo(0, thirdsY * 1)
            context.lineTo(width, thirdsY * 1)
            context.moveTo(0, thirdsY * 2)
            context.lineTo(width, thirdsY * 2)
        }
        context.moveTo(-1, thirdsY * 3)
        context.lineTo(width + 1, thirdsY * 3)

        context.stroke()

        context.restore()
    }
    drawCropHandles(context, gridColor) {
        context.save()
        if (this.state.scaling) {
            context.scale(this.state.sclaingFactor, this.state.scalingFactor)
        }
        
        context.beginPath()
        context.fillStyle = 'rgb(246, 246, 246)'
        
        const rects = this.computeCropHandles()
        Object.values(rects).forEach(([ horizontalRect, verticalRect ]) => {
            context.fillRect(...horizontalRect)
            context.fillRect(...verticalRect)
        })

        context.stroke()
        context.restore()
    }
    drawBorderRadius(context, fill) {
        const dimensions = this.getDimensions()
        // const [x, y] = this.calculateXYWithScaling()
        // const width = dimensions.canvas.width - x * 2
        // const height = dimensions.canvas.height - y * 2
        const [x, y, width, height] = this.computeCropWithScaling()

        const borderRadius = Math.min(width / 2, height / 2)

        context.beginPath()
        context.fillStyle = fill

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
    }

    paint(context) {
        if (!this.state.image.resource) return
        const imagePosition = this.calculatePosition(this.state.image, this.props.border)

        const backgroundColorChannels = this.props.color.slice(0, 3)
        const alpha = this.props.color[3]

        context.save()
        context.scale(this.pixelRatio, this.pixelRatio)
        context.translate(0, 0)

        // Paint the foreground mask over the image
        context.fillStyle = 'rgba(' + [...backgroundColorChannels, alpha].join(',') + ')'
        context.fillRect(imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height)

        // Paint the circle that is fully transparent as a clipping path over the foreground mask
        context.beginPath()
        this.drawBorderRadius(context)

        context.save()
        context.clip()
        // Redraw the image over the clipping path so that it isn't obscured by the foreground mask
        context.drawImage(
            this.state.image.resource,
            imagePosition.x,
            imagePosition.y,
            imagePosition.width,
            imagePosition.height,
        )
        context.restore()

        this.drawGrid(
            context,
            this.props.gridColor,
            this.state.drag || this.state.scaling
        )
        this.drawCropHandles(
            context,
            this.props.gridColor
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
    calculateNewScalingFactor(e) {
        const { scalingHandle } = this.state
        const rect = e.target.getBoundingClientRect()
        const mousePositionX = e.clientX - rect.x
        const mousePositionY = e.clientY - rect.y
        const [prevCropX, prevCropY, prevCropWidth, prevCropHeight] = this.computeCropWithScaling()
        let cropX, cropY
        switch (scalingHandle) {
            case "top-left":
                cropX = prevCropX + prevCropWidth
                cropY = prevCropY + prevCropHeight
                break
            case "top-right":
                cropX = prevCropX
                cropY = prevCropY + prevCropHeight
                break
            case "bottom-left":
                cropX = prevCropX + prevCropWidth
                cropY = prevCropY
                break
            case "bottom-right":
                cropX = prevCropX
                cropY = prevCropY
                break
        }
        const dx = mousePositionX - cropX
        const dy = mousePositionY - cropY
        const distance = Math.sqrt(dx ** 2 + dy ** 2)
        const imageDistance = Math.sqrt(this.props.width ** 2 + this.props.height ** 2)
        const scaleDelta = distance / imageDistance
        return scaleDelta
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
            e.preventDefault()
            this.setState({ scaling : true, scalingFactor: 1, scaleStartX: e.clientX, scaleStartY: e.clientY })
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
    _handleMouseMove = (e) => {
        if (this.state.scaling) {
            let scalingFactor = this.calculateNewScalingFactor(e)
            const croppingRect = this.getCroppingRect()
            let newCropWidth = croppingRect.width * scalingFactor * this.state.image.resource.width
            let newCropHeight = croppingRect.height * scalingFactor * this.state.image.resource.height
            const newCrop = Math.max(newCropWidth, newCropHeight)
            /** Verify the crop is larger than the minimum crop, if not, clamp it to the minimum. */
            if (newCrop < this.props.minimumCropSize) {
                scalingFactor = this.props.minimumCropSize / croppingRect.width / this.state.image.resource.width
            }
            /** Verify that the crop doesn't go outside the image boundaries, if it does, clamp it inside the boundaries. */
            const [newX, newY, newWidth, newHeight] = this.computeCropWithScaling(scalingFactor)
            const newCropX = croppingRect.x * this.state.image.resource.width
            const newCropY = croppingRect.y * this.state.image.resource.height
            // if (newX < border)
            this.setState({ scalingFactor })

        } else {
            this.handleMouseMove(e)
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
            onMouseUp: this._handleMouseUp,
            onMouseMove: this._handleMouseMove
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