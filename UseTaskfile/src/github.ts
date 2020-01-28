import * as tl from 'azure-pipelines-tool-lib/tool';
import * as rp from 'request-promise-native';
import * as semver from 'semver';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

const BASE = "https://api.github.com";

const DEFAULT_HEADERS = { 'User-Agent': 'taskfile-pipeline-task' };


let releases: IRelease[] = [];

export function initCache() {
    if (releases.length !== 0) {
        return;
    }
    const contents = fs.readFileSync(path.join(__dirname, '../releases.json'), 'utf-8');
    releases = JSON.parse(contents);
}

export interface IAsset {
    url: string;
    id: number;
    node_id: string;
    name: string;
    label: string;
    content_type: string;
    size: number;
    download_count: number;
    browser_download_url: string;
}

export interface IRelease {
    url: string;
    assets_url: string;
    id: number;
    node_id: string;
    tag_name: string;
    assets: IAsset[];
}

export interface IMachineProfile {
    os: 'windows'|'darwin'|'linux';
    arch: '386'|'amd64';
}

export function getReleasesCache() {
    return releases;
}

export async function getReleases(owner: string, repo: string): Promise<IRelease[]> {
    return await rp.get(`${BASE}/repos/${owner}/${repo}/releases`, { json: true, headers: DEFAULT_HEADERS });
}

export function findReleaseWithVersion(releases: IRelease[], version: string): IRelease|undefined {
    const stdVersion = semver.coerce(version);
    if (!stdVersion) {
        throw new Error(`Could not parse invalid version '${version}'`);
    }
    return releases.find(release => stdVersion.compare(release.tag_name) == 0);
}

function parseArch(arch: string) {
    return arch === 'x64' ? 'amd64' : '386';
}

export function getMachineProfile(): IMachineProfile {
    const o = os.platform();
    const arch = os.arch();

    if (o === 'win32') {
        return {
            os: 'windows',
            arch: parseArch(arch),
        }
    } else if (o === 'darwin') {
        return {
            os: 'darwin',
            arch: parseArch(arch),
        }
    } else if (o === 'linux') {
        return {
            os: 'linux',
            arch: parseArch(arch),
        }
    }

    throw new Error(`Could not parse machine profile. Unkonwn OS or CPU architecture: '${o}', '${arch}'`);
}

export function getAssetName(name: string, p: IMachineProfile) {
    let assetName = `${name}_${p.os}_${p.arch}`;
    if (p.os === 'windows') {
        assetName += '.zip';
    } else {
        assetName += '.tar.gz';
    }
    return assetName;
}

export function findAssetWithName(assets: IAsset[], name: string) {
    return assets.find(asset => asset.name === name);
}

export async function install(downloadUrl: string) {
    const temp = await tl.downloadTool(downloadUrl);
    let extractRoot: string|null = null;
    if (downloadUrl.endsWith('.tar.gz')) {
        extractRoot = await tl.extractTar(temp);
    } else if (downloadUrl.endsWith('.zip')) {
        extractRoot = await tl.extractZip(temp);
    } else {
        throw new Error(`Could not extract archive: File downloaded at '${downloadUrl}' is niether a .tar.gz nor a .zip`);
    }

    tl.prependPath(extractRoot);
}