import fs from 'fs';
import path from 'path';

import { gameLinks } from '../seasons/gameLinks';
import { gameParser } from '../gameParser';

const generateGameData = async () => {
    const keys = Object.keys(gameLinks);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        //@ts-ignore
        const links = gameLinks[key] as string[];

        console.log(key, ": ", links)

        for (let index = 0; index < links.length; index++) {
            const link = links[index];
            console.log("link:", link)
            const game = await gameParser(link);
            const dir = `../seasons/${key}`;
            fs.mkdirSync(dir, { recursive: true });

            const fileName = game?.title?.replace(/\s+/g, "_").replace(",", "").replace(/\\|\/|:|\*|\?|"|<|>|\||\(/g, "_") || index.toString();

            const filePath = path.join(dir, `${fileName}.ts`);
            fs.writeFileSync(filePath, `export const game = ${JSON.stringify(game)}`);
        }
    }
}

generateGameData()