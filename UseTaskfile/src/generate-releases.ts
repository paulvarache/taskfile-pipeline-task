import { getReleases, IRelease } from "./github";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Queries the Github API to generate a slim version of the release list
 */
export async function generateReleases(): Promise<IRelease[]> {
    const res = await getReleases('go-task', 'task');
    const stripped = res.map((r) => {
        return {
            url: r.url,
            assets_url: r.assets_url,
            id: r.id,
            node_id: r.node_id,
            tag_name: r.tag_name,
            assets: r.assets.map((a) => {
                return {
                    url: a.url,
                    id: a.id,
                    node_id: a.node_id,
                    name: a.name,
                    label: a.label,
                    content_type: a.content_type,
                    size: a.size,
                    download_count: a.download_count,
                    browser_download_url: a.browser_download_url,
                };
            }),
        }
    });
    return stripped;
}

generateReleases()
    .then((r) => {
        fs.writeFileSync(path.join(__dirname, '../releases.json'), JSON.stringify(r));
    });
