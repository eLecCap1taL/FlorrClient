
const musicStyle = document.getElementById('musicStyle');
const volumeSlider = document.getElementById('volumeSlider');
const volumeInput = document.getElementById('volumeInput');
const resetButton = document.getElementById('resetMusic');
const player = document.getElementById('player');
const curmusic = document.getElementById('music-id');

volumeSlider.addEventListener('input', () => {
    volumeInput.value = volumeSlider.value;
    player.volume = volumeSlider.value / 100.0;
    window.myAPI.changeSettings(['musicVolume',volumeInput.value/100.0]);
});
volumeInput.addEventListener('input', () => {
    if (volumeInput.value < 0) volumeInput.value = 0;
    if (volumeInput.value > 100) volumeInput.value = 100;
    volumeSlider.value = volumeInput.value;
    player.volume = volumeSlider.value / 100.0;
    window.myAPI.changeSettings(['musicVolume',volumeInput.value/100.0]);
});

musicStyle.addEventListener('change', () => {
    player.src = ''
    curmusic.textContent = ''
    player.currentTime = 0
    player.volume = volumeSlider.value / 100.0;
    player.pause();
    window.myAPI.changeMusicKit(musicStyle.value);
    window.myAPI.changeSettings(['musicKit',musicStyle.value]);
});

resetButton.addEventListener('click', () => {
    musicStyle.value = 'terraria';
    volumeSlider.value = 20;
    volumeInput.value = 20;

    player.src = ''
    curmusic.textContent = ''
    player.currentTime = 0
    player.volume = volumeSlider.value / 100.0;
    player.pause();
    window.myAPI.updMapCode();
    window.myAPI.changeSettings(['musicKit',musicStyle.value]);
    window.myAPI.changeSettings(['musicVolume',volumeInput.value/100.0]);
    window.myAPI.changeMusicKit(musicStyle.value);
});


window.myAPI.onPlaySound((soundpath) => {
    const audio = new Audio(soundpath);
    audio.play();
});

window.myAPI.onSetMusic((musicpath) => {
    player.src = musicpath[0]
    player.currentTime = 0
    player.volume = volumeSlider.value / 100.0;
    player.play()
    curmusic.textContent = musicpath[1]
    // alert(musicpath[1])
});

window.myAPI.onSetPause((val) => {
    if (val == 0) {
        player.play();
    } else if (val == 1) {
        player.pause();
    } else {
        if (player.paused) {
            player.play();
        } else {
            player.pause();
        }
    }
});



player.src = ''
player.valume = 0.2
player.loop = true
curmusic.textContent = ''
player.pause()

window.myAPI.onInit((ls)=>{
    _musicKit=ls[0]
    _musicVolume=ls[1]
    musicStyle.value = _musicKit;
    volumeInput.value=Math.floor(_musicVolume*100);
    volumeSlider.value=Math.floor(_musicVolume*100);
    player.volume = volumeSlider.value / 100.0;
})