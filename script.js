const symbols = [
    { name: 'Wild', image: 'images/s00.png' },
    { name: 'Watermelon', image: 'images/s01.png' },
    { name: 'Plum', image: 'images/s02.png' },
    { name: 'Cherry', image: 'images/s03.png' },
    { name: 'Grape', image: 'images/s04.png' },
    { name: 'Lemon', image: 'images/s05.png' },
    { name: 'Orange', image: 'images/s06.png' },
    { name: 'Seven', image: 'images/s07.png' },
    { name: 'Bell', image: 'images/s08.png' },
    { name: 'Horseshoe', image: 'images/s09.png' },
    { name: 'Free Spins', image: 'images/s10.png' },
    { name: 'Gift Box', image: 'images/s11.png' }
];
const winPrize = 100;
const bigWinPrize = 500;

// Preload images
const preloadedImages = {};
let imagesLoaded = 0;

symbols.forEach(symbol => {
    const img = new Image();
    img.src = symbol.image;
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === symbols.length) {
            drawAllSymbols(); // Draw all symbols once all images are loaded
        }
    };
    preloadedImages[symbol.name] = img;
});

// Function to generate a random spin
function generateSpin() {
    const spinResult = [];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        spinResult.push(symbols[randomIndex]);
    }
    return spinResult;
}

// Function to determine the prize based on spin result
function determinePrize(spinResult) {
    const uniqueSymbols = new Set(spinResult.map(symbol => symbol.name));

    if (uniqueSymbols.size === 1) {
        // All symbols are the same -> Big Win
        return { symbols: spinResult, prize: bigWinPrize };
    } else if (uniqueSymbols.size === 2) {
        // Two symbols are the same -> Win
        return { symbols: spinResult, prize: winPrize };
    } else {
        // All symbols are different -> Loss
        return { symbols: spinResult, prize: 0 };
    }
}

// Function to draw the spin result on canvas with rolling animation (like a slot machine)
function drawSpinResult(spinResult, callback) {
    const canvas = document.querySelector('.gameCanvas');
    const ctx = canvas.getContext('2d');

    const reelSymbols = []; // Array to hold symbols for each reel animation
    const numReels = 3;
    const spinDuration = 2000;
    const startTime = Date.now();
    const rollingSpeed = 30;

    // Populate reel symbols with a mixture of random symbols
    for (let i = 0; i < numReels; i++) {
        const reel = [];
        for (let j = 0; j < symbols.length * 3; j++) { // Add multiple sets to create a rolling effect
            const randomIndex = Math.floor(Math.random() * symbols.length);
            reel.push(symbols[randomIndex]);
        }
        reel.push(spinResult[i]); // Ensure the final symbol is the intended outcome
        reelSymbols.push(reel);
    }

    function drawRollingSymbols() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        reelSymbols.forEach((reel, reelIndex) => {
            const symbolIndex = Math.floor((elapsedTime / rollingSpeed) % reel.length);
            const symbol = reel[symbolIndex];
            const img = preloadedImages[symbol.name];
            if (img) {
                const x = 50 + reelIndex * 100;
                const y = canvas.height / 4;
                ctx.drawImage(img, x, y, 80, 80);
            }
        });

        if (elapsedTime < spinDuration) {
            requestAnimationFrame(drawRollingSymbols);
        } else {
            // Draw final symbols without rolling after the spin completes
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            spinResult.forEach((symbol, index) => {
                const img = preloadedImages[symbol.name];
                if (img) {
                    ctx.drawImage(img, 50 + index * 100, canvas.height / 4, 80, 80);
                }
            });
            if (callback) callback(); // Call the callback after rolling stops
        }
    }

    drawRollingSymbols();
}

// Function to play a round of the game
function playRound() {
    // Clear previous win/lose messages and images
    const messageElement = document.querySelector('.resultMessage');
    const resultContainer = document.querySelector('.resultContainer');
    messageElement.textContent = ''; // Clear previous message
    resultContainer.innerHTML = ''; // Clear previous win/lose images

    const spinResult = generateSpin();
    const result = determinePrize(spinResult);
    drawSpinResult(spinResult, () => {
        // Display result message or image after rolling stops
        setTimeout(() => {
            if (result.prize === bigWinPrize) {
                const bigWinImg = new Image();
                bigWinImg.src = 'images/megawin_title.png';
                resultContainer.appendChild(bigWinImg);
            } else if (result.prize === winPrize) {
                const winImg = new Image();
                winImg.src = 'images/bigwin_title.png';
                resultContainer.appendChild(winImg);
            } else {
                messageElement.textContent = 'Sorry, you lost this round.';
            }
        }, 500); // Add delay before showing the result
    });
}

// Function to draw all symbols initially in a sidebar
function drawAllSymbols() {
    const allSymbolsContainer = document.querySelector('.allSymbolsContainer');
    symbols.forEach(symbol => {
        const img = new Image();
        img.src = symbol.image;
        img.className = 'symbolImage';
        allSymbolsContainer.appendChild(img);
    });
}

// Set up the canvas and button to play the game
document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.querySelector('.playButton');
    playButton.addEventListener('click', playRound);
});
