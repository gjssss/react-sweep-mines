export interface pos {
    x: number;
    y: number;
}

export interface block {
    pos: pos;
    boomFlag: boolean;
    adjacence: number;
    state: BlockState;
}

export enum BlockState {
    initial, // 未翻开
    display, // 已经翻开
    flag     // 炸弹加旗子
}