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
                 <!-- 底部：控制区 -->
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
// 歌曲信息
const songTitle = ref("正在播放的歌曲")
const songArtist = ref("歌手姓名")
const songAlbum = ref("专辑名称")
const songCover = ref("https://via.placeholder.com/260x260.png?text=Cover")
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
//页面挂载结束后立即调用
onMounted(() => {
    fetchSongDetail(songId.value)
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