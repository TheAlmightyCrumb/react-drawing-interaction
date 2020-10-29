import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CanvasProps {
    width: number;
    height: number;
}

type Coordinate = {
    x: number;
    y: number;
};

interface DrawOptions {
    strokeStyle: Pick<CanvasFillStrokeStyles, "strokeStyle">;
    lineJoin: CanvasLineJoin;
    lineWidth: number;
};

class Line {
    constructor(private pointA: Point, private pointB: Point) {
    }

    draw(context: CanvasRenderingContext2D, options: DrawOptions) {
        context.strokeStyle
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.strokeStyle;
        context.lineJoin = options.lineJoin;

        context.moveTo(this.pointA.x, this.pointA.y);
        context.lineTo(this.pointB.x, this.pointB.y);
        context.closePath();

        context.stroke();
    }
}

class Point implements Coordinate {
 
    // public readonly _x: number;
    // public readonly _y: number;
    // constructor(x: number, y: number) {
    //     this._x = x;
    //     this._y = y;
    // }

    constructor(private _x: number, private _y: number, public name: string = "point"){}

    public toString(): string {
        return this.x + "," + this.y;
    }

    public offSet(offsetLeft: number, offsetTop: number): void {
        this._x -= offsetLeft;
        this._y -= offsetTop;
    }

    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
}

const Canvas = ({ width, height }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPainting, setIsPainting] = useState(false);
    const [mousePosition, setMousePosition] = useState<Point | null>(null);

    const startPaint = useCallback((event: MouseEvent) => {
        const coordinates = getCoordinates(event);
        if (coordinates) {
            setMousePosition(coordinates);
            setIsPainting(true);
        }
    }, []);
    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;

        canvas.addEventListener('mousedown', startPaint);
        return () => {
            canvas.removeEventListener('mousedown', startPaint);
        };
    }, [startPaint]);

    const paint = useCallback(
        (event: MouseEvent) => {
            if (isPainting) {
                const newMousePosition: Point | undefined = getCoordinates(event);
                if (mousePosition && newMousePosition) {
                    setMousePosition(newMousePosition);
                    drawLine(mousePosition, newMousePosition);
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

    const exitPaint = useCallback(() => {
        setIsPainting(false);
        setMousePosition(null);
    }, []);
    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mouseup', exitPaint);
        canvas.addEventListener('mouseleave', exitPaint);
        return () => {
            canvas.removeEventListener('mouseup', exitPaint);
            canvas.removeEventListener('mouseleave', exitPaint);
        };
    }, [exitPaint]);

    const getCoordinates = (event: MouseEvent): Point | undefined => {
        if (!canvasRef.current) {
            return;
        }

        const canvas: HTMLCanvasElement = canvasRef.current;
        const point = new Point(event.pageX, event.pageY);
        point.offSet(canvas.offsetLeft, canvas.offsetTop);
        return point;
    };

    const drawLine = (startPoint: Point, endPoint: Point) => {
        const context = canvasRef?.current?.getContext('2d');
        if (!context) {
            return;
        }

        const drawOptions: DrawOptions = {
            strokeStyle: 'red',
            lineJoin: 'round',
            lineWidth: 1,
        }
        const line = new Line(startPoint, endPoint);
        line.draw(context, drawOptions);

    };

    return <canvas ref={canvasRef} height={height} width={width} />;
};

Canvas.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export default Canvas;