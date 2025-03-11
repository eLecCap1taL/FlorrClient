// ==UserScript==
// @name         上层 Canvas
// @match        https://florr.io/*
// ==/UserScript==


const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '9999';
canvas.style.pointerEvents = 'none';
const scale = window.devicePixelRatio; 
canvas.width = window.innerWidth * scale;
canvas.height = window.innerHeight * scale;
canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

window.drawTextCenter = function(text, x, y, color = 'white', size = 16, scolor = 'black', sL=2) {
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.clearRect(x - 50, y - size, 100, size * 2);

    // 描黑边
    ctx.strokeStyle = scolor;
    ctx.lineWidth = sL; // 边框粗细
    ctx.strokeText(text, x, y,100,false);

    // 填充文字
    ctx.fillStyle = color;
    ctx.fillText(text, x, y,100,false);
};

window.addEventListener('resize', () => {
    const scale = window.devicePixelRatio;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
});