// useDahuaPlayer.ts
import { ref, onUnmounted } from 'vue'
import type { PlayerConfig, RealPlayOptions, PlaybackOptions, PlayerStatus, PlayerError } from '../../../types'
import { parseError } from './errorHandler'
import { loadScript, loadCSS } from '../../../utils/utils'
import WSPlayer from "./PlayerManager";
export function useDahuaPlayer(config: PlayerConfig, emit: (event: string, ...args: any[]) => void) {
    const playerInstance = ref<any>(null)
    const status = ref<PlayerStatus>('idle')
    const errorInfo = ref<PlayerError | null>(null)

    /**
     * 动态加载 WSPlayer 所需资源（按顺序）
     */
    async function loadWSResources(): Promise<void> {
        const base = config.wsBasePath || window.location.origin || '/static/WSPlayer/'
        // 1. jQuery
        await loadScript(`${base}/jquery-3.6.0.min.js`, 'ws-jquery')
        // 2. 解码库
        await loadScript(`${base}/PlaySDKInterface.js`, 'ws-player-PlaySDKInterface')
        // 3. 播放器入口
        await loadScript(`${base}/WSPlayer.js`, 'ws-player')
        // 4. 样式
        await loadCSS(`${base}/player.css`, 'ws-player-css')
        await loadCSS(`${base}/window.division.css`, 'ws-player-division-css')
    }

    /**
     * 动态加载 DHPlayer 桥接文件（如有配置）
     */
    async function loadDHResources(): Promise<void> {
        if (config.dhPluginJs) {
            await loadScript(config.dhPluginJs, 'dh-plugin-js')
        }
    }

    /** 检测浏览器是否安装 DHPlayer 插件 */
    function checkDHPlugin(): boolean {
        return !!(window as any).DHPlayer || !!(window as any).ActiveXObject
    }

    /** 初始化 DHPlayer（插件模式） */
    async function initDHPlayer(): Promise<any> {
        // 实际开发中需要引入大华提供的 DHPlayer.vue 组件并注册
        // 此处展示核心调用逻辑，具体可参考官方示例
        const container = document.getElementById(config.containerId)
        if (!container) throw new Error(`容器 #${config.containerId} 不存在`)
        const Player = (window as any).DHPlayerSDK
        if (!Player) throw new Error('DHPlayer SDK 未加载')
        return new Player({
            container: config.containerId,
            windowType: config.windowType,
            layout: config.layout ?? 1,
            showControl: config.showControl ?? true,
            showIcons: config.showIcons,
        })
    }

    /** 初始化 WSPlayer（无插件模式） */
    async function initWSPlayer(): Promise<any> {
        if (!WSPlayer) throw new Error('WSPlayer SDK 未加载，请检查资源路径')
        return new WSPlayer({
            mode: config.windowType === 0 ? 'live' : 'replay',
            container: document.getElementById(config.containerId),
            MSE: true,
            displayErrorPrompt: true,
            displayLoading: true,
            displayBufferProgress: config.windowType === 1,
            keepPlaying: true,
            useH265MSE: config.useH265MSE ?? false,
            mediaOptions: {
                muted: config.muted ?? false,
                autoplay: config.autoPlay ?? true,
                scale: config.scale ?? 1,
            },
            events: {
                onConnectSuccess: () => { status.value = 'playing'; emit('play'); emit('statusChange', 'playing') },
                onPlay: () => { status.value = 'playing'; emit('play'); emit('statusChange', 'playing') },
                onPause: () => { status.value = 'paused'; emit('pause'); emit('statusChange', 'paused') },
                onError: (e: any) => {
                    const err = parseError(e)
                    errorInfo.value = err
                    status.value = 'error'
                    emit('error', err)
                    emit('statusChange', 'error')
                },
                onTimeUpdate: (t: number) => emit('timeUpdate', t),
                onConnectClose: () => {
                    if (status.value === 'playing') {
                        status.value = 'stopped'
                        emit('stop')
                        emit('statusChange', 'stopped')
                    }
                },
            },
        })
    }

    /**
     * 完整初始化流程：加载资源 -> 检测模式 -> 创建实例
     */
    async function initialize() {
        try {
            status.value = 'loading'
            emit('statusChange', 'loading')

            if (config.mode === 'DHPlayer') {
                // 先加载桥接资源（如有）
                await loadDHResources()
                if (checkDHPlugin()) {
                    playerInstance.value = await initDHPlayer()
                } else {
                    console.warn('[DahuaPlayer] 未检测到 DHPlayer 插件，自动降级为 WSPlayer')
                    await loadWSResources()
                    playerInstance.value = await initWSPlayer()
                }
            } else {
                await loadWSResources()
                playerInstance.value = await initWSPlayer()
            }

            status.value = 'idle'
            emit('ready', playerInstance.value)
        } catch (e: any) {
            const err = parseError(e)
            errorInfo.value = err
            status.value = 'error'
            emit('error', err)
            emit('statusChange', 'error')
        }
    }

    async function playReal(options: RealPlayOptions) {
        if (!playerInstance.value) throw new Error('播放器未初始化')
        status.value = 'loading'
        emit('statusChange', 'loading')
        try {
            if (config.mode === 'DHPlayer' && playerInstance.value.setRealTime) {
                playerInstance.value.setRealTime(options)
            } else if (playerInstance.value.playRealVideo) {
                playerInstance.value.playRealVideo({
                    channelList: [{ id: options.channelId, deviceCode: '', deviceType: '', channelSeq: 0 }],
                })
            }
        } catch (e: any) {
            const err = parseError(e)
            errorInfo.value = err
            status.value = 'error'
            emit('error', err)
            emit('statusChange', 'error')
            throw err
        }
    }

    async function playRecord(options: PlaybackOptions) {
        if (!playerInstance.value) throw new Error('播放器未初始化')
        status.value = 'loading'
        emit('statusChange', 'loading')
        try {
            if (config.mode === 'DHPlayer' && playerInstance.value.playRecord) {
                playerInstance.value.playRecord(options)
            } else if (playerInstance.value.playRecordVideo) {
                playerInstance.value.playRecordVideo({
                    channelId: options.channelId,
                    beginTime: options.beginTime,
                    endTime: options.endTime,
                    recordSource: options.recordSource ?? 3,
                })
            }
        } catch (e: any) {
            const err = parseError(e)
            errorInfo.value = err
            status.value = 'error'
            emit('error', err)
            emit('statusChange', 'error')
            throw err
        }
    }

    function stop() {
        if (playerInstance.value?.stop) {
            playerInstance.value.stop()
            status.value = 'stopped'
            emit('stop')
            emit('statusChange', 'stopped')
        }
    }

    function pause() {
        if (playerInstance.value?.pause) {
            playerInstance.value.pause()
            status.value = 'paused'
            emit('pause')
            emit('statusChange', 'paused')
        }
    }

    function resume() {
        if (playerInstance.value?.resume) {
            playerInstance.value.resume()
            status.value = 'playing'
            emit('play')
            emit('statusChange', 'playing')
        }
    }

    function snapshot(): string | null {
        try {
            const base64 = playerInstance.value?.snapshot?.()
            if (base64) emit('snapshot', base64)
            return base64
        } catch { return null }
    }

    function destroy() {
        if (playerInstance.value) {
            try {
                playerInstance.value.destroy?.()
                document.getElementById(config.containerId)!.innerHTML = ''
            } catch {}
            playerInstance.value = null
            status.value = 'idle'
            errorInfo.value = null
        }
    }

    onUnmounted(destroy)

    return {
        playerInstance,
        status,
        errorInfo,
        initialize,
        playReal,
        playRecord,
        stop,
        pause,
        resume,
        destroy,
        snapshot,
    }
}
