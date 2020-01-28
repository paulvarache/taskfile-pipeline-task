import tl = require('azure-pipelines-task-lib/task');
import { getReleases, findReleaseWithVersion, getMachineProfile, getAssetName, findAssetWithName, install, getReleasesCache, IRelease, initCache } from './github';

const DEFAULT_VERSION = '2.8.0';
const OWNER = 'go-task';
const REPO = 'task';
const BINARY_NAME = 'task';

async function getRelease(version: string, noCache = false): Promise<IRelease> {
    initCache();
    // Get releases from github or the cache
    let releases = noCache ? await getReleases(OWNER, REPO) : await Promise.resolve(getReleasesCache());
    const release = findReleaseWithVersion(releases, version);
    if (!release) {
        if (noCache) {
            throw new Error(`Could not find release for version '${version}'`);
        }
        // No release found for this version, but we haven't looked online, try again without the cache
        return await getRelease(version, true);
    }
    return release;
}

async function run() {
    try {
        let inputVersion: string | undefined = tl.getInput('version', false);
        if (!inputVersion) {
            inputVersion = DEFAULT_VERSION;
        }
        const release = await getRelease(inputVersion);
        const p = getMachineProfile();
        const assetName = getAssetName(BINARY_NAME, p);
        const asset = findAssetWithName(release.assets, assetName);
        if (!asset) {
            throw new Error(`Could not find asset in release with name '${assetName}'`);
        }
        await install(asset.browser_download_url);
        tl.setResult(tl.TaskResult.Succeeded, `Installed task ${inputVersion} succesfully`);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();