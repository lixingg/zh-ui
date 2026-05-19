// errorHandler.ts
import type { PlayerError } from '../../../types'

const ERROR_MAP: Record<string, string> = {
    '0': '操作成功', '-1': '未知错误', '1': '参数错误', '2': '内存不足',
    '3': 'SDK未初始化', '4': '登录失败', '5': '设备不在线', '6': '流媒体连接失败',
    '7': '获取视频流失败', '8': '播放句柄无效', '9': '通道号错误', '10': '码流类型错误',
    '401': '认证失败，Token可能已过期', '403': '权限不足', '404': '视频资源未找到',
    '500': '服务器内部错误', '2128': '不支持的视频编码', '2129': '解码器初始化失败',
    'ws-close': 'WebSocket连接关闭', 'ws-error': 'WebSocket连接失败',
    'ws-timeout': 'WebSocket连接超时', 'connect-failed': '流媒体连接失败',
    'decode-failed': '视频解码失败', 'token-expired': 'RTSP Token已过期',
    'no-permission': '无播放权限', 'device-offline': '设备离线', 'stream-timeout': '拉流超时',
}

function classify(code: string): PlayerError['type'] {
    if (['401', '403', 'no-permission'].includes(code)) return 'permission'
    if (['ws-close', 'ws-error', 'ws-timeout', 'connect-failed', 'stream-timeout'].includes(code)) return 'connection'
    if (['2128', '2129', 'decode-failed'].includes(code)) return 'decode'
    if (['token-expired'].includes(code)) return 'timeout'
    return 'unknown'
}

export function parseError(raw: any): PlayerError {
    const code = raw?.code ?? raw?.errorCode ?? '-1'
    const message = raw?.message || ERROR_MAP[String(code)] || `未知错误(code:${code})`
    return { code, message, type: classify(String(code)), raw }
}

export function getFriendlyMessage(error: PlayerError): string {
    const map: Record<PlayerError['type'], string> = {
        permission: '权限验证失败：',
        connection: '网络连接异常：',
        decode: '视频解码失败：',
        timeout: '请求超时：',
        unknown: '',
    }
    return `${map[error.type]}${error.message}`
}
