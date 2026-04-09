<template>
    <!-- 推荐歌单 -->
    <div class="hall-wrapper">
        <div class="hall-inner">
            <h2 class="section-title">推荐歌单</h2>
            <ul class="playlist-list">
                <li v-for="item in playlists" :key="item.id" class="playlist-item">
                    <div class="cover-wrapper">
                        <img :src="item.cover" :alt="item.title">
                    </div>
                    <div class="info">
                        <p class="title">{{ item.title }}</p>
                        <p class="desc">{{ item.desc }}</p>
                    </div>
                </li>
            </ul>
            <!-- 推荐新音乐 -->
            <h2 class="section-title section-title--sub">推荐新音乐</h2>
            <ul class="song-list">
                <li class="song-item" v-for="song in newSongs" :key="song.id">
                    <div class="song-cover">
                        <img :src="song.cover" :alt="song.name">
                    </div>
                    <div class="song-info">
                        <p class="song-name">{{ song.name }}</p>
                        <p class="song-artist">{{ song.artist }}</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import {get} from "@/utils/http"
import { ref, onMounted } from 'vue';
//推荐歌单
const playlists = ref([])
//推荐新音乐
const newSongs = ref([])
const fetchPlaylists = async () => {
    try {
        const res = await get("/personalized", { limit: 5 })
        playlists.value = (res.result || []).map(item => ({
            id: item.id,
            title: item.name,
            desc: item.copywriter || "",
            cover: item.picUrl
        })) 
    } catch(error) {
        console.log("获取推荐歌单失败：",error)
    }
}
const fetchNewSongs = async () => {
    try {
        const res = await get("/personalized/newsong")
        newSongs.value = (res.result || []).map(item => ({
            id: item.id,
            name: item.name,
            cover: item.picUrl,
            artist: item.song?.artists?.map(item => item.name).join("/") || ""
        }))
    } catch (error) {
        console.log("推荐新音乐失败：", error)
    }
}
onMounted(() => {
    fetchPlaylists()
    fetchNewSongs()
})
</script>

<style scoped>
.hall-wrapper {
    display: flex;
    justify-content: center;
}

.hall-inner {
    width: 100%;
    max-width: 1200px;
}

.section-title {
    margin: 0 0 16px;
    margin-top: 40px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
}

.section-title--sub {
    margin-top: 40px;
}

.section-title--singer {
    margin-top: 68px;
    font-size: 22px;
    text-align: center;
}

.playlist-list {
    display: flex;
    gap: 20px;
    list-style: none;
    padding: 0;
    margin: 0;
}

.playlist-item {
    flex: 1;
    max-width: 220px;
    cursor: pointer;
}

.cover-wrapper {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 4px;
    overflow: hidden;
    background: #eee;
    cursor: pointer;
}

.cover-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

.cover-wrapper:hover img {
    transform: scale(1.06);
}

.info {
    margin-top: 8px;
}

.title {
    font-size: 14px;
    color: #333;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.desc {
    font-size: 12px;
    color: #999;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 40px;
    list-style: none;
    padding: 0;
    margin: 0;
}

.song-item {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.song-cover {
    width: 82px;
    height: 82px;
    border-radius: 4px;
    overflow: hidden;
    background: #eee;
    flex-shrink: 0;
    cursor: pointer;
}

.song-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}

.song-cover:hover img {
    transform: scale(1.2);
}

.song-info {
    flex: 1;
}

.song-name {
    font-size: 14px;
    color: #333;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-artist {
    font-size: 12px;
    color: #999;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.singer-list {
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    justify-content: space-between;
}

.singer-item {
    width: 20%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.singer-avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    overflow: hidden;
    background: #eee;
    flex-shrink: 0;
}

.singer-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.singer-name {
    font-size: 16px;
    color: #333;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.singer-carousel {
    margin-top: 12px;
    position: relative;
}

.singer-carousel-track {
    position: relative;
    min-height: 200px;
}

.singer-slide {
    width: 100%;
}

.singer-carousel-controls {
    position: absolute;
    inset: 0;
    margin: 0;
    pointer-events: none;
}

.singer-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: #f2f2f2;
    cursor: pointer;
    font-size: 22px;
    line-height: 1;
    pointer-events: auto;
}

.singer-arrow:first-of-type {
    left: -30px;
}

.singer-arrow:last-of-type {
    right: -30px;
}

.singer-arrow:hover {
    background: #e5e5e5;
}
</style>
