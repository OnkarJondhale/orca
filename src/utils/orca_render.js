#!/usr/bin/env node

const cleanOrca = [
    "  ____       ____       ______       ___   ",
    " / __ \\     / __ \\     / ____/      /   |  ",
    "/ / / /    / /_/ /    / /          / /| |  ",
    "/ /_/ /    / _, _/    / /___       / ___ |  ",
    "\\____/     /_/ |_|    \\____/      /_/  |_|  "
];

function colorizeClean3D(char, rowIndex) {
    if (char === ' ') return ' ';

    let r, g, b;

    // Isolate the 3D depth slants from the flat letter faces
    if (char === '/' || char === '\\' || char === '_') {
        // Deep Ocean Blue Shadow
        r = 12; 
        g = Math.max(45, 95 - (rowIndex * 6)); 
        b = Math.max(125, 185 - (rowIndex * 2));
    } else {
        // Bright Sea-Foam Teal Face
        r = 0; 
        g = Math.max(185, 245 - (rowIndex * 9)); 
        b = Math.max(165, 225 - (rowIndex * 3));
    }

    return `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
}

function renderClean3D() {
    // Clear console screen buffer
    console.log("\x1b[2J\x1b[H\n");
    
    // Print the 3D text layout
    cleanOrca.forEach((line, y) => {
        let coloredLine = "      "; // Margin padding
        for (let x = 0; x < line.length; x++) {
            coloredLine += colorizeClean3D(line[x], y);
        }
        console.log(coloredLine);
    });

    // Generate a sleek horizontal rule right under the text
    const hrLength = cleanOrca[0].length;
    const horizontalRule = "━".repeat(hrLength);
    
    // Color the horizontal line to match the deep ocean base gradient
    console.log("      " + `\x1b[38;2;12;50;130m${horizontalRule}\x1b[0m\n`);
}

renderClean3D();