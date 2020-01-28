import tl = require('azure-pipelines-task-lib/task');
import { getReleases, findReleaseWithVersion, getMachineProfile, getAssetName, findAssetWithName, install } from './github';

const DEFAULT_VERSION = '2.8.0';
const OWNER = 'go-task';
const REPO = 'task';
const BINARY_NAME = 'task';

async function run() {
    try {
        let inputVersion: string | undefined = tl.getInput('version', false);
        if (!inputVersion) {
            inputVersion = DEFAULT_VERSION;
        }
        const releases = await getReleases(OWNER, REPO);
        const release = findReleaseWithVersion(releases, inputVersion);
        if (!release) {
            throw new Error(`Could not find release for version '${inputVersion}'`);
        }
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