import { AssetURL } from "@/extra.types";


// !!! Deprecated / Unused, keeping for reference. !!!
export default class AssetManager {
    images: Map<AssetURL, HTMLImageElement>
    videos: Map<AssetURL, HTMLVideoElement>

    // ofc I switch to something unified like howler I can remove these.
    audioBuffers: Map<AssetURL, AudioBuffer>
    audioCtx = new window.AudioContext();

    constructor() {
        this.images = new Map();
        this.videos = new Map();
        this.audioBuffers = new Map();
    }

    async loadImage(src: AssetURL) {
        if(this.images.has(src)) return this.images.get(src);

        const img = new Image();
        img.src = src;

        // Move to own function. Tbh if the images are so big that I need to decode them preemptively that's a different issue.
        // img.decode();

        this.images.set(src, img);

        return img;
    }

    async loadVideo(src: AssetURL): Promise<HTMLVideoElement> {
        if(this.videos.has(src)) return this.videos.get(src)!;

        const video = document.createElement("video");
        video.src = src;
        video.preload = "auto";
        video.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
            video.onloadeddata = () => resolve(null);
            video.onerror = reject;
        });

        this.videos.set(src, video);
        return video;
    }

    async loadAudio(src: AssetURL) {
        if (this.audioBuffers.has(src)) return this.audioBuffers.get(src);

        const res = await fetch(src);
        const buffer = await res.arrayBuffer();
        const decoded = await this.audioCtx.decodeAudioData(buffer);

        this.audioBuffers.set(src, decoded);
        return decoded;
    }

    getImage(src: AssetURL) {
        return this.images.get(src);
    }

    getAudio(src: AssetURL) {
        return this.audioBuffers.get(src);
    }

    getVideo(src: AssetURL) {
        return this.videos.get(src);
    }

    unloadImage(src: AssetURL) {
        this.images.delete(src);
    }

    unloadAudio(src: AssetURL) {
        this.audioBuffers.delete(src);
    }

    unloadVideo(src: AssetURL) {
        this.videos.delete(src);
    }
}