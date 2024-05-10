import fs from 'fs';
import path from 'path';

import playwright from 'playwright';
import { gameParser } from './gameParser';

export const baseLegacyStatsUrl = "http://www.sajl.org/selaus/otteluohjelma.php?sarja=1&kausi="
// export const legacyFirstSeason = 2003
const legacyFirstSeason = 2012
export const legacyLastSeason = 2022

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

generateJSONfromLegacyStats()