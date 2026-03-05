import type { CSSProperties, ReactNode } from "react";

interface StageProps {
	children?: ReactNode;
	width?: number;
	height?: number;
	style?: CSSProperties;
}

interface LayerProps {
	children?: ReactNode;
}

interface CircleProps {
	children?: ReactNode;
}

export function Stage({ children, style, width, height }: StageProps) {
	return (
		<div data-testid="konva-stage" style={style} data-width={width} data-height={height}>
			{children}
		</div>
	);
}

export function Layer({ children }: LayerProps) {
	return <>{children}</>;
}

export function Circle({ children }: CircleProps) {
	return <>{children}</>;
}
