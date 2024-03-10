let audio, volumeSlider, playpausebtn, refresh, amplitude, playlist, next, prev, refralt, volbtn
//let url = "C:\\Users\\Mohamed\\Desktop\\Projects\\OverPrompt\\test\\OverPrompt-API\\Output\\AAC\\Alter Musiques\\TVアニメ『呪術廻戦』第2期「懐玉・玉折」ノンクレジットOPムービー／OPテーマ：キタニタツヤ「青のすみか」｜毎週木曜夜11時56分～MBS_TBS系列全国28局にて放送中__.aac"
var isPlaying = true;
var release = true
var state = 'paused'
var plpos = 0;
var prevnul = false
var refreshbuttons = []
var started = false
var audioreact = document.getElementById('alternate-audio-react')
var rs = getComputedStyle(audioreact)
var vol
document.getElementById('play-pause').style.opacity = '0%'
document.getElementById('loading').style.opacity = '100%'
console.log(localStorage)

if(!localStorage.getItem('vol')){
    vol = 10
    localStorage.setItem('vol', 10)
} else{
    vol = localStorage.getItem('vol') 
}

document.getElementById('volslide').value = vol

fetchPlaylist().then((data) => {
    if(data === 'nothing') console.log('nothing')
    else{
    ManageData(data)
    playlist = data}
})
var interval = setInterval(() => {
    if(playlist){
        started = true   
        clearInterval(interval)
    }
}, 10)

function setup(){
    if(started){
    try {
        if(playlist[0][plpos]){
        audio = loadSound(playlist[0][plpos].url, loaded) }  
    } catch (e) {
        console.error(e)
    }
    console.log(playlist)
    plpos = 0
    try {
        amplitude = new p5.Amplitude();
    } catch (e) {
        window.location.reload()
    }
    volumeSlider = document.getElementById('volslide')}
}

document.getElementById('div-inp').addEventListener('change', () => {
    addPlaylist()

    fetchPlaylist().then((data) => {
        if(data === 'nothing') console.log('nothing')
        else{
        ManageData(data)
        playlist = data}
    })
    var interval = setInterval(() => {
        if(playlist && playlist[0].length > 0){
            prevnul = true
            document.getElementById('refr-alt').click()
            clearInterval(interval)}
    }, 10)
})

refreshbuttons.push(document.getElementById('refr-alt'))
refreshbuttons.push(document.getElementById('Refresh'))

refreshbuttons.forEach((refresh) => {
    refresh.addEventListener('click', () => {
        if(prevnul) {
            plpos = 0; 
            prevnul = false
            console.log(playlist)
            try {
                audio = loadSound(playlist[0][plpos].url, loaded)
            } catch (e) {
                console.error(e)
                prevnul = true
        }}
        started = false
        ready = false
        document.getElementById('play-pause').style.opacity = '0%'
        document.getElementById('loading').style.opacity = '100%'
        deletePLCache().then(() => fetchPlaylist().then((data) => {
            console.log(data)
            if(data === 'nothing') {
                console.log('nothing')
                }
            else{
        console.log('refreshed')
            ManageData(data); playlist = data}}))
            if(audio){
        var interval = setInterval(() => {
            if(playlist){
                console.log(playlist)
                started = true
                if(audio.isLoaded()){
                    document.getElementById('timeslide').max = audio.duration()
                    var verifyifload = setInterval(() => {
                        if(ready){
                            plpos = MoveToCurrent(audio, playlist)
                            console.log('playlist fetched')
                            clearInterval(verifyifload)
                            ready = false
                        }
                    }, 10)
                }
                clearInterval(interval)
            }
        }, 10)}
    })
})

function loaded(){
    try {
        if(started){
            document.getElementById('timeslide').max = audio.duration()
            volbtn = document.getElementById('bg-vol')
            next = document.getElementById('next')
            prev = document.getElementById('back')
            playpausebtn = document.getElementById('play-pause')
        
            document.getElementById('timeslide').addEventListener('input', () => {
                if(audio.isLoaded()) audio.setVolume(0)
                    if(audio.isLoaded() && release){
                        release = false
                    document.getElementById('play-pause').style.opacity = '0%'
                    document.getElementById('loading').style.opacity = '100%'
                    console.log(document.getElementById('timeslide').value / 10, audio.currentTime())
                    audio.jump(document.getElementById('timeslide').value)
                    var interval = setInterval(() => {
                        if(audio.isLoaded()){
                            release = true
                            started = true
                            clearInterval(interval)
                        }
                    }, 10)} else{
                        console.log('not released')
                    }
            })
        
            volbtn.addEventListener('click', () => {
                if(volbtn.style.height !== '350px'){
                document.getElementById('vol-btn').style.transform = 'scale(0.7)'
                document.getElementById('vol-btn').style.filter = 'invert(10%)'
                volbtn.style.height = '350px'
                volbtn.style.backgroundColor = 'gray'}
                else{
                document.getElementById('vol-btn').style.transform = 'scale(1)'
                document.getElementById('vol-btn').style.filter = 'invert(70%)'
                volbtn.style.height = '70px'
                volbtn.style.backgroundColor = 'transparent'
                }
            })
        
            next.addEventListener('click',  () => {
                console.log('clicked')
                if(plpos <= playlist[0].length - 1 && started){
                plpos++
                document.getElementById('play-pause').style.opacity = '0%'
                document.getElementById('loading').style.opacity = '100%'
                if(audio._paused) state = 'paused'
                audio.pause()
                audio = NextSong(playlist, plpos, state) || audio
                console.log(audio)
                started = false
                const interval = setInterval(() => {
                    if(audio.isLoaded() && !started){
                    document.getElementById('timeslide').max = audio.duration()
                    started = true
                    PlayPause(audio)
                    if(state === 'playing'){
                      console.log('yes')
                      PlayPause(audio)}
                      clearInterval(interval)
                    }
                  }, 10)
                setTimeout(() => {
                    document.getElementById('alternate-audio-react').style.transition = 'all .2s ease-out'
                }, 1000)}
            })
            prev.addEventListener('click',  () => {
                if(plpos > 0 && started){
                plpos--
                document.getElementById('play-pause').style.opacity = '0%'
                document.getElementById('loading').style.opacity = '100%'
                if(audio._paused) state = 'paused';
                audio.pause()
                console.log(playlist[0], plpos)
                audio = PrevSong(playlist, plpos, state) || audio
                console.log(audio)
                started = false
                const interval = setInterval(() => {
                    if(audio.isLoaded() && !started){
                    document.getElementById('timeslide').max = audio.duration()
                    started = true
                    PlayPause(audio)
                    if(state === 'playing'){
                    PlayPause(audio)}
                    clearInterval(interval)
                    }
                  }, 10)
                setTimeout(() => {
                    document.getElementById('alternate-audio-react').style.transition = 'all .2s ease-out'
                }, 1000)}
            })
            playpausebtn.addEventListener('click', () => PlayPause(audio))
        
            window.addEventListener('keydown', (event) => {
                var key
                if(event.key.length === 1){
                    key = event.key.toLowerCase()}
                    else{
                        key = event.key
                    }
        
                switch(key){
                    case 'f':{
                        document.getElementById('change-state').click()
                    }break;

                    case ' ':{
                        playpausebtn.click()
                    }break;
        
                    case 'ArrowLeft':{
                        prev.click()
                    }break;
        
                    case 'ArrowRight':{
                        next.click()
                    }break;
        
                    case 'ArrowUp':{
                        volumeSlider.value = Math.max((volumeSlider.value + volumeSlider.step)/10) + 0.9
                    }break;
        
                    case 'ArrowDown':{
                        volumeSlider.value = volumeSlider.value - volumeSlider.step
                    }break;
                }
            })
        }    
    } catch (e) {
        console.log('not loaded')
        console.error(e)
    }
    
}

document.getElementById('alternate-audio-react').style.transition = 'all .2s ease-out'

var trackinterval = setInterval(() => {
    if(audio){
    try {
        if(audio.isLoaded()){
            clearInterval(trackinterval)
        }   
    } catch (e) {
        console.log('not loaded')
    }}
}, 100)

function draw(){
    try {
        if(audio){
        if(started){
            try {
                var vol = amplitude.getLevel()
            } catch (e) {
                window.location.reload()
            }
            if(audio.isLoaded()){
                var time = Math.max(Math.floor(audio.currentTime() % 60), 0)
                const seconds = time < 10? '0' + time: time.toString()
                document.getElementById('current-time').innerHTML = Math.max(Math.floor(audio.currentTime() / 60), 0) + ':' + seconds
                var temptime = Math.max(Math.floor(audio.duration() % 60), 0)
                var totalseconds = temptime < 10? '0' + temptime: temptime.toString()
                var totaltime = Math.max(Math.floor(audio.duration() / 60), 0) + ':' + totalseconds
                document.getElementById('total-time').innerHTML = totaltime
                document.getElementById('play-pause').style.opacity = '100%'
                document.getElementById('loading').style.opacity = '0%'
                document.getElementById('timeslide').max = audio.duration()
                document.getElementById('timeslide').style.backgroundSize = `${(((audio.currentTime() / audio.duration()) * 100) + 1)}% 100%`
                document.getElementById('timeslide').value = (audio.currentTime())
               if(document.getElementById('alternate-audio-react').style.display === 'block' && vol*20 > 0.1){
                document.getElementById('alternate-audio-react').style.transform = `scale(${vol*10})`
                //document.getElementById('gradient').style.animationDuration =`${50/(vol*100)}s`
                }
                if(release){
                audio.setVolume(volumeSlider.value / 20)}
                localStorage.setItem('vol', volumeSlider.value) 
                //console.log(Math.max(volumeSlider.value))
                if(Math.max(volumeSlider.value) === 0){
                    document.getElementById('vol-btn').src = './Addons/icons/no-vol.png'
                } else if(Math.max(volumeSlider.value) === 20){
                    document.getElementById('vol-btn').src = './Addons/icons/high-volume.png'
                } else{
                    document.getElementById('vol-btn').src = './Addons/icons/vol.png'
                }
                document.getElementById('track-artist').innerHTML = playlist[0][plpos].artist || 'Unknown'
                document.getElementById('track-name').innerHTML = playlist[0][plpos].title || 'Unknown'
            }
            audio.onended(() => {
                document.getElementById('timeslide').max = 100
                document.getElementById('timeslide').value = 0
                if(!audio._paused){
                if(plpos >= playlist[0].length - 1){
                document.getElementById('alternate-audio-react').style.transition = 'all 3s ease-out'
                document.getElementById('alternate-audio-react').style.transform = `scale(1)`
        
                setTimeout(() => {
                    document.getElementById('alternate-audio-react').style.transition = 'all .2s ease-out'
                }, 3000)} 
                else{
                if(started && audio.isLoaded() && !audio._paused && release){
                next.click()
                }
                document.getElementById('alternate-audio-react').style.transition = 'all 1s ease-out'
                document.getElementById('alternate-audio-react').style.transform = `scale(1)`
                }
            }
            })} else{
                document.getElementById('play-pause').style.opacity = '0%'
                document.getElementById('loading').style.opacity = '100%'
                //console.log('not loaded')
            }   } else{
                prevnul = true
                //console.log('not started')
            }
    } catch (e) {
            //console.error(e)
    }
}

