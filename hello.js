const puppeteer = require('puppeteer');

const botMemory = [];
let moveNMB = 0;
let compteur = 0;
let compteur2 = 0;
let moveVersCulDeSac = [];

let inverseR = 'l'
let inverseL = 'r'
let inverseU = 'd'
let inverseD = 'u'

let x = 0;
let y = 0;

let coordonneNextMove = "0,0"
let listeCoordonneParcourues = []



//THE CODE DOES NOT WORK ANYMORE SINCE https://ctf.ageei.org/ IS DOWN



  async function getPath(ThisPage) {
      let currentstate = await ThisPage.evaluate(() => {

          return atob(getCookie('path'));

      });
      return currentstate
  }

async function performMove(page, path, nextMove) {
    // Perform the move
    await page.evaluate((dir) => {
        send(dir);
    }, nextMove);


    // Wait for navigation to complete
    await page.waitForNavigation();

    // Add a delay to simulate human-like behavior
    //await page.waitForTimeout(1000)

    // Update the cookie with the new state
    const newPath = path + nextMove;
    try{
        await page.evaluate((newPath) => {
            document.cookie = `path=${btoa(newPath)};path=/`;
        }, newPath);
    }
    catch (triggerUncaughtException){

    }


}

function pathToXY(path, move) {
            let newPath =  path + move;
            for (let i=0; i<newPath.length; i++)
            {
                if(newPath.charAt(i) === "r")
                {
                    x++;
                }
                if(newPath.charAt(i) === "l")
                {
                    x--;
                }
                if(newPath.charAt(i) === "u")
                {
                    y++;
                }
                if(newPath.charAt(i) === "d")
                {
                    y--;
                }


            }
            coordonneNextMove = x + "," + y


}

async function getImage(page) {
    const imgSrc = await page.evaluate(() => {
        const imgElement = document.querySelector('img'); // Change the selector if needed
        return imgElement ? imgElement.src : null;


    });
return imgSrc
}

async function makeMove(direction) {
    const browser = await puppeteer.launch({ headless: false, timeout: 999999999 });
    const page = await browser.newPage();
    await page.goto('https://ctf.ageei.org/daedalusv3105/');


    // Check if the game has reached the end
    let isEndOfGame = await checkEndOfGame(page);

    // Continue making moves until the end of the game
    while (!isEndOfGame) {
        const path = await getPath(page)








        // Decide on the next move based on the current state and previous experience
       let move = decideNextMove(path);

        //If current state leads to a CulDeSac
        if(moveVersCulDeSac.includes(path))
        {
           await retourSpot(page, botMemory)

            // Retrieve the current state from the cookie
            const newPath = await getPath(page)
            moveNMB = 0;
            move = decideNextMove(newPath);
            await performMove(page, newPath, move)
        }

        else{


            pathToXY(path, move)
            console.log(coordonneNextMove)
            if (listeCoordonneParcourues.includes(coordonneNextMove) === false)
            {
                await performMove(page, path, move)
                const imgSrc = await getImage(page)

                if (imgSrc !== "https://ctf.ageei.org/daedalusv3105/static/img/bonk.jpeg") {
                    listeCoordonneParcourues.push(coordonneNextMove)
                }

                x = 0;
                y = 0;
            }

            else
            {
                moveNMB++;
                move = decideNextMove(path);
                await performMove(page, path, move)
            }

        }




            // Check again if the game has reached the end


            // Cherche le src de l image de la page
       const imgSrc = await getImage(page)

        isEndOfGame = await checkEndOfGame(page, imgSrc);
            if (imgSrc === "https://ctf.ageei.org/daedalusv3105/static/img/bonk.jpeg") {
                moveNMB++
                compteur++


                await retourSpot(page, botMemory)

            }

            else {
                botMemory.push(move);
                compteur = 0;
               // console.log(path)
            }

    }


}




 function decideNextMove(path) {
    // Define all possible moves
    const allMoves = ['r', 'u', 'l', 'd'];
    if (compteur === 3) {
         culDeSac(path)
        return ""
    } else {
        compteur2 = 0;
        if (moveNMB === 4) {
            moveNMB = 0;
        }
        while (allMoves.at(moveNMB) === inverseMove(botMemory.at(botMemory.length - 1)) || moveVersCulDeSac.includes(path + allMoves.at(moveNMB)))
        {
            moveNMB++;
            compteur2++;

            if (moveNMB === 4) {
                moveNMB = 0;
            }

            if (compteur2 === 4)
            {
                culDeSac(path)
                return ""
            }
        }

        return allMoves.at(moveNMB)
    }


}

function inverseMove(move) {
    if(move === 'r')
    {
        return inverseR;
    }

    if(move === 'l')
    {
        return inverseL;
    }

    if(move === 'u')
    {
        return inverseU;
    }

    if(move === 'd')
    {
        return inverseD;
    }


}





async function retourSpot(page, moves) {
    let movesConcat = "";
      for(let i=0; i<moves.length; i++)
    {
        movesConcat += moves[i]
    }
      await performMove(page, "", movesConcat)
}

 function culDeSac(path) {
    moveVersCulDeSac.push(path);
    botMemory.pop();
    compteur = 0;
}
async function checkEndOfGame(page, imgSRC) {
    // Implement the logic to check if the game has reached the end
    // For example, check for the presence of a specific element indicating the end of the game
    if(imgSRC !== undefined)
    {
        if(imgSRC !== "https://ctf.ageei.org/daedalusv3105/static/img/bonk.jpeg")
        {
            if(imgSRC !== "https://ctf.ageei.org/daedalusv3105/static/img/progress.png") {

                if (imgSRC !== "https://ctf.ageei.org/daedalusv3105/static/img/tiresias.png") {
                    return true;
                }
            }
        }
        else{
            return false;
        }
    }

}
makeMove();

