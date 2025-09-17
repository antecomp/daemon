import { AssetURL } from "../types/misc.types";

const alreadyPrefetched = new Set<AssetURL>();

// Exploit head link prefetcher
export default function requestAssetPrefetch(assetURLs: AssetURL[]) {
    for(const url of assetURLs) {
        if(alreadyPrefetched.has(url)) continue;

        console.log(`Prefetching ${url}`);

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = url.endsWith('.webm') ? 'video' : 'image'; // Add more dynamic mapping here?
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);

        alreadyPrefetched.add(url);
    }
}