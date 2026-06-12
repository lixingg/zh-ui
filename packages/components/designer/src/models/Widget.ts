export interface WidgetStyle {
    left: number;
    top: number;
    width: number;
    height: number;
    rotate?: number;
    opacity?: number;
    [key: string]: any;
}

export type WidgetType =
    | 'text'
    | 'image'
    | 'video'
    | 'button'
    | 'text-input'
    | 'input'
    | 'select'
    | 'time-picker'
    | 'line-chart'
    | 'pie-chart'
    | 'bar-chart'
    | 'ring-chart'
    | 'scatter-chart'
    | 'gaode-map'
    | 'baidu-map'
    | 'tencent-map'
    | 'table'
    | 'border'
    | 'layout';

export class Widget {
    id: string;
    type: WidgetType;
    style: WidgetStyle;
    props: Record<string, any>;

    constructor(
        id: string,
        type: WidgetType,
        style: Partial<WidgetStyle> = {},
        props: Record<string, any> = {}
    ) {
        this.id = id;
        this.type = type;
        this.style = { left: 0, top: 0, width: 200, height: 100, ...style };
        this.props = props;
    }

    clone(): Widget {
        return new Widget(this.id, this.type, { ...this.style }, { ...this.props });
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            style: { ...this.style },
            props: { ...this.props },
        };
    }

    static fromJSON(json: any): Widget {
        return new Widget(json.id, json.type, json.style, json.props);
    }
}
