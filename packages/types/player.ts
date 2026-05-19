// types.ts
export type PlayerMode = 'DHPlayer' | 'WSPlayer'
export type WindowType = 0 | 1           // 0-实时预览，1-录像回放
export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'stopped'
export type StreamType = 1 | 2 | 3        // 主码流/辅码流/辅码流2
export type LayoutType = 1 | 4 | 9 | 16 | 25

export interface ShowIcons {
    streamChangeSelect?: boolean
    talkIcon?: boolean
    localRecordIcon?: boolean
    audioIcon?: boolean
    snapshotIcon?: boolean
    closeIcon?: boolean
}

export interface RealPlayOptions {
    channelId: string
    streamType?: StreamType
    path?: string
    token?: string
    stdRtsp?: boolean
}

export interface PlaybackOptions {
    channelId: string
    beginTime: string               // yyyy-MM-dd HH:mm:ss
    endTime: string
    recordSource?: 2 | 3            // 2-设备，3-中心服务器（默认）
    streamType?: StreamType
    path?: string
    token?: string
}

export interface PlayerConfig {
    mode: PlayerMode
    containerId: string             // 容器 DOM ID（页面内需唯一）
    windowType: WindowType
    layout?: LayoutType
    showControl?: boolean
    showIcons?: ShowIcons
    openIvs?: boolean
    useH265MSE?: boolean
    autoPlay?: boolean
    muted?: boolean
    scale?: number

    // --- 资源路径配置（可选） ---
    /** WSPlayer 资源根路径，默认 /static/WSPlayer/ */
    wsBasePath?: string
    /** DHPlayer 桥接文件 URL（如需动态加载） */
    dhPluginJs?: string
}

export interface PlayerError {
    code: number | string
    message: string
    type: 'permission' | 'connection' | 'decode' | 'timeout' | 'unknown'
    raw?: any
}

export interface DahuaPlayerProps {
    config: PlayerConfig
    width?: string | number
    height?: string | number
    customClass?: string
    showLoading?: boolean
    showErrorMask?: boolean
}

export interface DahuaPlayerEmits {
    (e: 'ready', playerInstance?: any): void
    (e: 'play'): void
    (e: 'pause'): void
    (e: 'stop'): void
    (e: 'error', error?: PlayerError): void
    (e: 'timeUpdate', time?: number): void
    (e: 'statusChange', status?: PlayerStatus): void
    (e: 'snapshot', base64?: string): void
}
