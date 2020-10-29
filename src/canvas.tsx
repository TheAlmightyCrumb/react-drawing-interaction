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
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineJoin: CanvasLineJoin;
    lineWidth: number;
};

interface Drawable {
    draw(context: CanvasRenderingContext2D, opt: DrawOptions): void;
}

class Circle implements Drawable {
    radius: number;
    constructor(private center: Point, radiusToPoint: Point) {
        const sumSquares = (center.x - radiusToPoint.x) ** 2 + (center.y - radiusToPoint.y) **2
        this.radius = Math.sqrt(sumSquares);
    }

    draw(context: CanvasRenderingContext2D, opt: DrawOptions) {
        const options: DrawOptions = {
            strokeStyle: "red",
            lineJoin: "bevel",
            lineWidth: 5
        }
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.strokeStyle;
        context.lineJoin = options.lineJoin;

        context.beginPath();
        context.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        context.stroke();
    }
}

class Square implements Drawable {
    constructor(private edge: Line) {
    }

    public length():number {
        return (
            Math.sqrt((this.edge.getPointA().x - this.edge.getPointB().x) **2 + (this.edge.getPointA().y - this.edge.getPointB().y) **2)
        )
    }

    public draw(context: CanvasRenderingContext2D, opt: DrawOptions): void {
        const options: DrawOptions = {
            strokeStyle: "gray",
            lineJoin: "miter",
            lineWidth: 5
        }
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.strokeStyle;
        context.lineJoin = options.lineJoin;

        context.beginPath();
        context.rect(this.edge.getPointA().x, this.edge.getPointA().y, this.length(), this.length());
        context.stroke();
    }
}

class Line implements Drawable {
    constructor(private pointA: Point, private pointB: Point) {
    }

    public getPointA(): Coordinate {
        const obj = {
            x: this.pointA.x,
            y: this.pointA.y
        }
        return obj;
    }

    public getPointB(): Coordinate {
        const obj = {
            x: this.pointB.x,
            y: this.pointB.y
        }
        return obj;
    }

    public draw(context: CanvasRenderingContext2D, opt: DrawOptions): void {
        const options: DrawOptions = {
            strokeStyle: "gray",
            lineJoin: "bevel",
            lineWidth: 5
        }
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
                    drawShape(mousePosition, newMousePosition);
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

    const drawShape = (startPoint: Point, endPoint: Point) => {
        const context = canvasRef?.current?.getContext('2d');
        if (!context) {
            return;
        }

        const drawOptions: DrawOptions = {
            strokeStyle: 'red',
            lineJoin: 'round',
            lineWidth: 1,
        }
        // const circle = new Circle(startPoint, endPoint);
        // circle.draw(context, drawOptions);
        const line = new Line(startPoint, endPoint);
        // line.draw(context, drawOptions);
        const square = new Square(line);
        square.draw(context, drawOptions);
    };

    return <canvas ref={canvasRef} height={height} width={width} />;
};

Canvas.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export default Canvas;