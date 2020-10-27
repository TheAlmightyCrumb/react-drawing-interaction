import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CanvasProps {
    width: number;
    height: number;
}

type Coordinate = {
    x: number;
    y: number;
};

// interface DrawOptions {
//     strokeStyle: string | CanvasGradient | CanvasPattern; 
//     lineJoin: CanvasLineJoin;
//     lineWidth: number;
// }

type DrawOptions = Pick<CanvasPathDrawingStyles, "lineJoin" | "lineWidth"> | CanvasFillStrokeStyles;
interface Vector {
    startPoint: Coordinate;
    endPoint: Coordinate;
}

class Line implements Vector {
    draw(context: CanvasRenderingContext2D, options: DrawOptions): void {
        Object.assign(context, options);

        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.lineTo(this.endPoint.x, this.endPoint.y);
        context.closePath();

        context.stroke();
    }

    get startPoint() {
        return this._startPoint;
    }

    get endPoint() {
        return this._endPoint;
    }

    constructor(private _startPoint: Coordinate, private _endPoint: Coordinate) {

    }
}

class Point implements Coordinate {
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    constructor(private _x: number, private _y: number) {
    }

    fromOffSet(offX: number, offY: number): Point {
        return new Point(this._x - offX, this._y - offY);
    }
}

const Canvas = ({ width, height }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPainting, setIsPainting] = useState(false);
    const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(undefined);

    const togglePaint = useCallback((event: MouseEvent | undefined = undefined) => {
        const coordinates = getCoordinates(event);
        setMousePosition(coordinates);
        setIsPainting(event != null);
    }, []);
    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousedown', togglePaint);

        canvas.addEventListener('mouseup', () => togglePaint());
        canvas.addEventListener('mouseleave', () => togglePaint());
        return () => {
            canvas.removeEventListener('mousedown', togglePaint);

            canvas.removeEventListener('mouseup', () => togglePaint());
            canvas.removeEventListener('mouseleave', () => togglePaint());
        };
    }, [togglePaint]);

    const paint = useCallback(
        (event: MouseEvent) => {
            if (isPainting) {
                const newMousePosition = getCoordinates(event);
                if (mousePosition && newMousePosition) {
                    drawLine(mousePosition, newMousePosition);
                    setMousePosition(newMousePosition);
                }
            }
        },
        [isPainting, mousePosition]
    );

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousemove', paint);
        return () => {
            canvas.removeEventListener('mousemove', paint);
        };
    }, [paint]);

    const getCoordinates = (event?: MouseEvent): Point | undefined => {
        if (!canvasRef.current || !event) {
            return;
        }

        const canvas: HTMLCanvasElement = canvasRef.current;
        return new Point(event.pageX, event.pageY).fromOffSet(canvas.offsetLeft, canvas.offsetTop);
    };

    const drawLine = (originalMousePosition: Coordinate, newMousePosition: Coordinate) => {
        const context = canvasRef?.current?.getContext('2d');
        if (!context) {
            return;
        }

        const line = new Line(originalMousePosition, newMousePosition);
        const drawOptions: DrawOptions = {
            strokeStyle: 'yellow',
            lineJoin: 'bevel',
            lineWidth: 5
        }
        line.draw(context, drawOptions);
    };

    return <canvas ref={canvasRef} height={height} width={width} />;
};

Canvas.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export default Canvas;
