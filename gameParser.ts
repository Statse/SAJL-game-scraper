
import fs from 'fs';
import playwright from 'playwright';

export const gameParser = async (url: string) => {
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);

    const gameData = await page.evaluate(() => {
        const FIRST_QUARTER_SELECTOR =
            "body > center > font > font:nth-child(24) > center > table:nth-child(5)"
        const SECOND_QUARTER_SELECTOR =
            "body > center > font > font:nth-child(24) > center > table:nth-child(8)"
        const THIRD_QUARTER_SELECTOR =
            "body > center > font > font:nth-child(24) > center > table:nth-child(11)"
        const FOURTH_QUARTER_SELECTOR =
            "body > center > font > font:nth-child(24) > center > table:nth-child(14)"

        const QUARTER_SELECTORS = [
            FIRST_QUARTER_SELECTOR,
            SECOND_QUARTER_SELECTOR,
            THIRD_QUARTER_SELECTOR,
            FOURTH_QUARTER_SELECTOR
        ]

        return QUARTER_SELECTORS.map((selector) => {
            const table = document.querySelector(selector);
            const rows = table?.querySelectorAll("tr");

            const gameData: any[] = [];
            rows?.forEach((row) => {
                const cells = row.querySelectorAll("td");
                const rowData: any[] = [];
                cells.forEach(cell => {
                    rowData.push(cell.innerText);
                });
                gameData.push(rowData);
            });

            return gameData;
        })
    });

    console.log(gameData)

    return gameData
}

function getPlayType(description: string) {
    if (description.includes("punt")) return "punt";
    if (description.includes("kickoff")) return "kickoff";
    if (description.includes("pass")) return "pass";
    if (description.includes("rush")) return "rush";
    if (description.includes("field goal")) return "field goal";
    if (description.includes("Timeout")) return "timeout";
    if (description.includes("kick attempt")) return "pat";
    if (description.includes("2ptconv")) return "2pt";
    return "";
}

function getDirection(description: string) {
    if (description.includes("left")) return "left";
    if (description.includes("right")) return "right";
    if (description.includes("middle")) return "middle";
    return "";
}

function getPlayResult(description: string) {
    if (description.includes("incomplete")) return "incomplete";
    if (description.includes("downed")) return "downed";
    if (description.includes("complete")) return "complete";
    if (description.includes("MISSED")) return "MISSED";
    if (description.includes("good")) return "good";
    return "";
}


const getGameData = async () => {
    const game = await gameParser("http://www.sajl.org/images/tilastot/roosters-eagles-19-05-2022.shtml")
    // Uuden tyypinen tulospalvelu
    // "https://tulospalvelu.jenkkifutis.fi/ottelut/63"

    fs.writeFileSync(`./gameData.json`, JSON.stringify(game));
}

getGameData()