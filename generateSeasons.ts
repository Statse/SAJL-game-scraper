import fs from 'fs';
import path from 'path';

import playwright from 'playwright';
import { gameLinks } from './seasons/gameLinks';
import { gameParser } from './gameParser';

export const baseLegacyStatsUrl = "http://www.sajl.org/selaus/otteluohjelma.php?sarja=1&kausi="

const legacyFirstSeason = 2012
const legacyLastSeason = 2022

type GameLinks = {
    [key: string]: string[];
};

const generateJSONfromLegacyStats = async () => {

    const browser = await playwright.chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        const gameLinks: GameLinks = {};

        for (let season = legacyFirstSeason; season <= legacyLastSeason; season++) {
            await page.goto(baseLegacyStatsUrl + season);

            const seasonLinks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll("a"));
                return links
                    .filter(link => link.href.includes('images/tilastot'))
                    .map(link => link.href)
            });

            gameLinks[season] = seasonLinks;
        }

        //wirte gameLinks to a ts file as an array
        const dir = `./seasons/`;
        fs.mkdirSync(dir, { recursive: true }); // This will create the directory if it doesn't exist
        const fileName = path.join(dir, `gameLinks.ts`);
        fs.writeFileSync(fileName, `export const gameLinks = ${JSON.stringify(gameLinks)}`);
    }
    finally {
        await browser.close();
    }
}

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
            const dir = `./seasons/${key}`;
            fs.mkdirSync(dir, { recursive: true });

            const fileName = game?.title?.replace(/\s+/g, "_").replace(",", "").replace(/\\|\/|:|\*|\?|"|<|>|\||\(/g, "_") || index.toString();

            const filePath = path.join(dir, `${fileName}.ts`);
            fs.writeFileSync(filePath, `export const game = ${JSON.stringify(game)}`);
        }
    }
}

// generateJSONfromLegacyStats()
generateGameData()