import { AssetURL } from "@/extra.types";

export default class AssetManager {
    images: Map<AssetURL, HTMLImageElement>
    audioBuffers: Map<AssetURL, AudioBuffer>
    audioCtx = new window.AudioContext();

    constructor() {
        this.images = new Map();
        this.audioBuffers = new Map();
    }

    async loadImage(src: AssetURL) {
        if(this.images.has(src)) return this.images.get(src);

        const img = new Image();
        img.src = src;
        await img.decode();

        this.images.set(src, img);
        console.log("AssetManager loaded image:", src, img);

        return img;
    }

    getImage(src: AssetURL) {
        return this.images.get(src);
    }

    async loadAudio(src: AssetURL) {
        if (this.audioBuffers.has(src)) return this.audioBuffers.get(src);

        const res = await fetch(src);
        const buffer = await res.arrayBuffer();
        const decoded = await this.audioCtx.decodeAudioData(buffer);

        this.audioBuffers.set(src, decoded);
        return decoded;
    }

    unloadImage(src: AssetURL) {
        this.images.delete(src);
    }

    unloadAudio(src: AssetURL) {
        this.audioBuffers.delete(src);
    }
}