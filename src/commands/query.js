import { listLocal, listAll, listMarketplace, listRemote } from '../core/list.js';

export function handleList(options) {
    if (options.marketplace) {
        listMarketplace()
    } else if (options.remote) {
        listRemote()
    } else if (options.all) {
        listAll()
    } else {
        listLocal()
    }
}

export function handleDescribe(skill) {
    console.log(`Printing deep description structure definitions for: ${skill}`);
}

export function handleInfo(skill) {
    console.log(`Extracting functional metadata information values from: ${skill}`);
}

export function handleSearch(keyword) {
    console.log(`Broadcasting aggregated search indices lookup criteria for keyword: ${keyword}`);
}
