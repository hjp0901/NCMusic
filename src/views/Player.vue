<template>
    <div class="player-page">
        <div class="player-inner">
            <div class="player-main">
                <!-- 左侧：封面与基本信息 -->
                <div class="player-left">
                    <div class="cover-wrap">
                        <div class="cover-disc">
                            <img class="cover-img" :src="songCover" alt="封面">
                        </div>
                    </div>
                    <div class="song-meta">
                        <h2 class="song-title">{{ songTitle }}</h2>
                        <p class="song-artist">{{ songArtist }}</p>
                        <p class="song-album">{{ songAlbum }}</p>
                    </div>
                </div>
                <!-- 右侧：歌词 -->
                <div class="player-right">
                    <div class="lyrics-card">
                        <h3 class="lyrics-title">歌词</h3>
                        <div class="lyrics-content">
                            <template v-if="lyrics.length">
                                <p v-for="(line, index) in lyrics" :key="index"
                                    :class="{ 'lyrics-line--highlight': index === 0 }" class="lyrics-line">
                                    {{ line }}
                                </p>
                            </template>
                            <p v-else class="lyrics-line">暂无歌词</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 底部：控制区 -->
            <div class="player-controls">
                <div class="controls-main">
                    <button class="btn-circle btn-large" @click="handleTogglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
                </div>
                <div class="progress-wrap">
                    <span class="time-label">{{ formatTime(currentTime) }}</span>
                    <div class="progress-bar" @click="handleProgressClick">
                        <div class="progress-inner"
                            :style="{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }"></div>
                    </div>
                    <span class="time-label">{{ formatTime(duration) }}</span>
                </div>
                <audio :src="audioUrl" v-if="audioUrl" ref="audioRef" class="audio-hidden"
                    @loadedmetadata="handleLoadedMetadata" @timeupdate="handleTimeUpdate"
                    @ended="handleAudioEnded"></audio>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute } from "vue-router"
import {get} from "@/utils/http"

const route = useRoute()
//歌曲ID
const songId = computed(() => route.query.id)

//audio标签
const audioRef = ref(null)

//歌曲歌词
const lyrics = ref([])

// 歌曲信息
const songTitle = ref("正在播放的歌曲")
const songArtist = ref("歌手姓名")
const songAlbum = ref("专辑名称")
const songCover = ref("https://via.placeholder.com/260x260.png?text=Cover")

// 音乐播放地址
const audioUrl = ref('')
//音乐播放当前时间
const currentTime = ref(0)
//音乐总时长
const duration = ref(0)
//音乐是否正在播放
const isPlaying = ref(false)

// 获取歌曲详情
const fetchSongDetail = async (id) => {
    if (!id) return
    try {
        const res = await get("/song/detail", { ids: id })
        const detail = (res.songs || [])[0]
        if (detail) {
            songTitle.value = detail.name || '未知歌曲'
            songArtist.value = (detail.ar || detail.artists || []).map((a) => a.name).join("/") || "未知歌手"
            songAlbum.value = (detail.al || detail.album)?.name || '未知专辑'
            songCover.value = (detail.al || detail.album)?.picUrl || songCover.value
        }
    } catch (err) {
        console.log("获取歌曲详情失败", err);
        songTitle.value = "正在播放的歌曲"
        songArtist.value = "歌手姓名"
        songAlbum.value = "专辑名称"
        songCover.value = "https://via.placeholder.com/260x260.png?text=Cover"
    }
}

// 解析歌词
const parseLyric = (raw = '') => {
    return raw.split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => {
            // 去掉歌词里的时间标签 例如：[00:12.34]  但是有些歌词里面只有时间标签
            const text = line.replace(/^\[[^\]]*]/g, '').trim()
            //这里的代码我之前写的是：return text || '' 但是这么写的话如果是歌词只有时间标签的情况下，最终实际上处理完return的还是时间标签
            return text || null
        })
        .filter(text => text !==null) //所以这里通过再次调用filter函数把只有时间标签的歌词过滤掉
}

// 获取歌词
const fetchLyric = async (id) => {
    if (!id) return
    try {
        const res = await get("/lyric", { id })
        const raw = res.lrc?.lyric || ''
        console.log(raw)
        lyrics.value = parseLyric(raw)
    } catch (err) {
        console.log("获取歌词失败", err);
        lyrics.value = []
    }
}

// 获取播放地址
const fetchSongUrl = async (id) => {
    if (!id) return
    try {
        const res = await get("/song/url", { id })
        const item = (res.data || [])[0]
        audioUrl.value = item?.url || ''
        currentTime.value = 0
        duration.value = 0
        isPlaying.value = false
    } catch (err) {
        console.log("获取歌曲播放地址失败", err);
        audioUrl.value = ""
        isPlaying.value = false
    }
}

// 加载歌曲元数据  当浏览器成功获取到音频的 ** 基础信息（元数据）** 时触发
const handleLoadedMetadata = () => {
    const audio = audioRef.value
    if (!audio) return
    duration.value = audio.duration || 0
    currentTime.value = audio.currentTime || 0
}

// 格式化时间
const formatTime = (sec) => {
    if (!sec || !Number.isFinite(sec)) return "00:00"
    const s = Math.floor(sec)
    const m = Math.floor(s / 60)
    const rs = s % 60
    const mm = m.toString().padStart(2, "0")
    const ss = rs.toString().padStart(2, "0")
    return `${mm}:${ss}`
}

// 播放音乐事件
const handleTogglePlay = () => {
    const audio = audioRef.value
    if (!audio || !audioUrl.value) return
    if (audio.paused) {
        audio.play().then(() => {
            isPlaying.value = true
        }).catch(() => { })
    } else {
        audio.pause()
        isPlaying.value = false
    }
}

// 歌曲播放结束
const handleAudioEnded = () => {
    isPlaying.value = false
}

// 歌曲播放时间更新
const handleTimeUpdate = () => {
    const audio = audioRef.value
    if (!audio) return
    currentTime.value = audio.currentTime || 0
    // timeupdate 事件触发非常频繁（一秒几十次）
    // 音频刚加载时，duration 还是 NaN
    // 如果不判断，总时长会先显示 NaN，再闪成正确时间
    // 加了判断，只有拿到有效时长才更新，不会出现 NaN
    if (audio.duration) {
        duration.value = audio.duration
    }
}

//处理进度条点击事件
const handleProgressClick = (event) => {
    //获取绑定了点击事件的进度条DOM元素
    const bar = event.currentTarget
    //getBoundingClientRect() → 获取元素在页面中的位置和尺寸信息
    // rect.left：进度条左边距离屏幕左侧的距离
    // rect.width：进度条总宽度
    const rect = bar.getBoundingClientRect()
    // event.clientX:用户点击位置距离屏幕左侧的坐标
    //计算点击位置百分比
    const ratio = (event.clientX - rect.left) / rect.width
    const audio = audioRef.value
    //拿到要跳转的新时间
    const newTime = duration.value * ratio
    //如果audio元素还没加载出来，直接退出函数
    if (!audio) return
    //修改 currentTime 一定会触发 timeupdate
    audio.currentTime = newTime
    //同步更新 Vue 响应式数据，保证视图和播放状态一致
    currentTime.value = newTime
}

//页面挂载结束后立即调用
onMounted(() => {
    fetchSongDetail(songId.value)
    fetchLyric(songId.value)
    fetchSongUrl(songId.value)
})
</script>

<style scoped>
.player-page {
    min-height: calc(100vh - 90px);
    background: radial-gradient(circle at top left, #2b2b2b, #000);
    color: #f5f5f5;
    display: flex;
    justify-content: center;
    padding: 40px 0;
    box-sizing: border-box;
}

.player-inner {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 32px;
}

.player-main {
    width: 100%;
    display: flex;
    gap: 32px;
}

.player-left {
    width: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cover-wrap {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, #444, #111);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
}

.cover-disc {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    overflow: hidden;
}

.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.song-meta {
    margin-top: 20px;
    text-align: center;
}

.song-title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
}

.song-artist,
.song-album {
    margin: 6px 0 0;
    font-size: 13px;
    color: #cfcfcf;
}

.player-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.lyrics-card {
    width: 100%;
    max-height: 520px;
    padding: 18px 24px;
    border-radius: 16px;
    background: transparent;
    box-shadow: none;
    box-sizing: border-box;
}

.lyrics-title {
    margin: 0 0 16px;
    font-size: 18px;
    color: #fff;
    text-align: center;
    letter-spacing: 1px;
}

.lyrics-content {
    max-height: 460px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 0;
}

.lyrics-line {
    margin: 6px 0;
    font-size: 16px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.65);
    text-align: center;
    transition: color 0.2s ease, transform 0.2s ease;
    white-space: normal;
}

.lyrics-line--highlight {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    transform: scale(1.02);
}

.lyrics-content::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.lyrics-content {
    scrollbar-width: none;
    scrollbar-color: transparent transparent;
}

.player-controls {
    width: 100%;
    padding: 16px 24px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.audio-hidden {
    display: none;
}

.controls-main {
    display: flex;
    align-items: center;
    gap: 24px;
}

.btn-circle {
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: #fff;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.btn-large {
    width: 56px;
    height: 56px;
    font-size: 22px;
}

.btn-small {
    width: 40px;
    height: 40px;
    font-size: 18px;
}

.btn-circle:hover {
    transform: translateY(-1px);
}

.progress-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
}

.time-label {
    font-size: 12px;
    color: #c0c0c0;
}

.progress-bar {
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    overflow: hidden;
}

.progress-inner {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff4b2b, #ff416c);
}

.controls-extra {
    display: none;
}

.extra-left,
.extra-right {
    display: none;
}

.btn-text {
    display: none;
}

.btn-text:hover {
    color: #fff;
}

@media (max-width: 960px) {
    .player-inner {
        flex-direction: column;
    }

    .player-main {
        flex-direction: column;
        align-items: center;
    }

    .player-left {
        width: auto;
    }
}
</style>