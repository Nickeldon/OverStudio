let audio, volumeSlider, playpausebtn, refresh, playlist, next, prev, refralt, volbtn, eqbands, vol, unlockkey = false;
var prevnul, rand, started = false
let isPlaying, release = true;
var follow = true
var timemode = 'normal'
var startloaddate = Date.now()
var PlayBackMode = 'linear'
var state = 'paused'
var plpos = 0;
var refreshbuttons = []
var eq = new p5.EQ(8)
var BGspeed = '.2s'
var audioreact = document.getElementById('alternate-audio-react')
var rs = getComputedStyle(audioreact)
var timeoutplaypause = Date.now()

try {
    eqbands = localStorage.getItem('eq').split(',') || [0, 0, 0, 0, 0, 0, 0, 0];
} catch (e) {
    eqbands = [0, 0, 0, 0, 0, 0, 0, 0];    
}

document.getElementsByClassName('eq-range').forEach((range, index) => {
    document.getElementsByClassName('eq-range')[index].value = eqbands[index]
})

eqbands = []
document.getElementsByClassName('eq-range').forEach((range) => {
    eqbands.push(range.value)
})
for(let i = 0; i < eqbands.length; i++){
    let value = parseInt(eqbands[i])
    try {
        eq.bands[i].gain(value)
    } catch (e) {
        console.log(e)
        //console.log(eqbands[i])
    }
}
localStorage.setItem('eq', eqbands)

document.getElementById('play-pause').style.opacity = '0%'
document.getElementById('loading').style.opacity = '100%'

if(!localStorage.getItem('vol')){
    vol = 10
    localStorage.setItem('vol', 10)
} else{
    vol = localStorage.getItem('vol') 
    if(Math.max(vol) === 0){
        document.getElementById('vol-btn').src = './Addons/icons/SVG/mute.svg'
    } else if(Math.max(vol) === 20){
        document.getElementById('vol-btn').src = './Addons/icons/SVG/max.svg'
    } else{
        document.getElementById('vol-btn').src = './Addons/icons/SVG/volume.svg'
    }

}

document.getElementById('volslide').value = vol

fetchPlaylist().then((data) => {
    if(data === 'nothing') console.log('nothing')
    else{
    ManageData(data)
    playlist = data[0]}
})
let interval = setInterval(() => {
    if(playlist){
        started = true   
        clearInterval(interval)
    }
}, 10)

//Verification if all the required modules are loaded

function setup(){
    if(started){
    try {
        if(playlist[plpos]){
        audio = loadSound(playlist[plpos].url, loaded) }  
    } catch (e) {
        console.log(e)
    }
    //console.log(playlist)
    plpos = 0

    try {
        //Start the p5.Amplitude module
        amplitude = new p5.Amplitude();
    } catch (e) {
    
        //If not, then the error is logged and the app restarts
        if(document.getElementById('opt-menu2').style.display === 'block') localStorage.setItem('PlMenuOpened', true)
        else localStorage.setItem('PlMenuOpened', false)
        localStorage.setItem('emptyreload', true)
        window.location.reload()
    }
    //If all the required modules are loaded, then Keyboard support is set to true
    if(amplitude) noError = true}
}

volumeSlider = document.getElementById('volslide')
volumeSlider.addEventListener('input', () => {
    localStorage.setItem('vol', volumeSlider.value) 
    if(Math.max(volumeSlider.value) === 0){
        document.getElementById('vol-btn').src = './Addons/icons/SVG/mute.svg'
    } else if(Math.max(volumeSlider.value) === 20){
        document.getElementById('vol-btn').src = './Addons/icons/SVG/max.svg'
    } else{
        document.getElementById('vol-btn').src = './Addons/icons/SVG/volume.svg'
    }
    if(audio){
        if(audio.isLoaded()){
            if(release){
                audio.setVolume(volumeSlider.value / 20, .06, 0)}
        }
    }
})

document.getElementById('div-inp').addEventListener('change', () => {
    if(playlist){
        if(playlist.length === 0){
        prevnul = true}
        else{
            prevnul = false
        }
    } else{
        prevnul = true
    }
    console.log('changed')
    addPlaylist().then((response) => {
            if(response === 'AlreadyExists'){
                console.log('no change as it already exists')
            }else{
                playlist = null
            fetchPlaylist().then((data) => {
                if(data[1].length === 0){console.log('nothing'); playlist = []}
                else{
                ManageData(data)
                playlist = data[0]
                //console.log(playlist)
            }
            })
            let interval = setInterval(() => {
                if(playlist){
                    //console.log(playlist)
                    if(playlist.length > 0){
                    //console.log('entered')
                    console.log(playlist)
                    document.getElementById('refr-alt').click()
                    clearInterval(interval)}
                    else{
                        clearInterval(interval)
                    }}
            }, 10)
            }
    })
})

refreshbuttons.push(document.getElementById('refr-alt'))
refreshbuttons.push(document.getElementById('Refresh'))

refreshbuttons.forEach((refresh) => {
    refresh.addEventListener('click', () => {
        if(prevnul) {
            console.log('yes, it was')
            plpos = 0; 
            prevnul = false
            //console.log(playlist)
            try {
                audio = loadSound(playlist[plpos].url, loaded)
            } catch (e) {
                console.log(e)
                prevnul = true
        }}
        started = false
        ready = false
        document.getElementById('play-pause').style.opacity = '0%'
        document.getElementById('loading').style.opacity = '100%'
        playlist = null
        deletePLCache().then(() =>{fetchPlaylist().then((data) => {
             if(data[0].length === 0 && data[1].length === 0){
                 console.log('nothing')
             }
             else{
                //console.log(data[0])
                //console.log('refreshed')
                ManageData(data); playlist = data[0]}})})
            if(audio){
        let interval = setInterval(() => {
            if(playlist){
                let trackinplaylist = false
                if(playlist.length > 0 && audio){
                console.log('entered')
                playlist.forEach((song) => {
                    if(song.url === audio.url){
                        console.log('in playlist')
                        trackinplaylist = true
                    }
                })
                if(!trackinplaylist){
                    console.log('not in playlist')
                    plpos = 0
                    if(audio.isLoaded()) audio.stop();
                    audio = loadSound(playlist[plpos].url, loaded)
                    let interval2 = setInterval(() => {
                        if(audio.isLoaded()){
                            document.getElementById('refr-alt').click()
                            clearInterval(interval2)
                            manageAudioData()
                            audio.play()
                        }
                    }, 10)
                }}
                //console.log(playlist)
                started = true
                if(audio.isLoaded()){
                    let verifyifload = setInterval(() => {
                        if(ready){
                            plpos = MoveToCurrent(audio.url, playlist)
                            //console.log('playlist fetched')
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

document.getElementsByClassName('eq-range').forEach((range) => {
    range.addEventListener('input', () => {
        eqbands = []
        document.getElementsByClassName('eq-range').forEach((range) => {
            eqbands.push(range.value)
        })
        //console.log(eqbands)
        for(let i = 0; i < eqbands.length; i++){
            let value = parseInt(eqbands[i])
            try {
                eq.bands[i].gain(value)
            } catch (e) {
                console.log(e)
                //console.log(eqbands[i])
            }
        }
        localStorage.setItem('eq', eqbands)
    })
})

document.getElementById('current-time').addEventListener('click', () => timemode = timemode === 'normal'? 'inversed': 'normal')

volbtn = document.getElementById('bg-vol')
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

playpausebtn = document.getElementById('play-pause')
playpausebtn.addEventListener('click', () => {
    if(audio){
        if(Date.now() - timeoutplaypause > 50){
        timeoutplaypause = Date.now()
        PlayPause(audio)
        //console.log(audio)
    }
    }
})

function loaded(){
    try {
        if(started){
            audio.connect(eq)
            manageAudioData()
            audio.setVolume(volumeSlider.value / 20)
            audio.play()
            if(state === 'paused') audio.pause()
            
            next = document.getElementById('next')
            prev = document.getElementById('back')

            document.getElementById('shuffle').addEventListener('click', () => {
                if(PlayBackMode === 'linear'){
                    PlayBackMode = 'shuffle'
                    document.getElementById('shuffle').style.transition = 'transform 0s'
                    document.getElementById('shuffle').style.transform = 'rotate(0deg)'
                    document.getElementById('shuffle').src = './Addons/icons/SVG/shuffle.svg'
                } else if(PlayBackMode === 'shuffle'){
                    PlayBackMode = 'loop'
                    document.getElementById('shuffle').style.transition = 'transform 0s'
                    document.getElementById('shuffle').style.transform = 'rotate(0deg)'
                    document.getElementById('shuffle').src = './Addons/icons/SVG/loop.svg'
                } else{
                    PlayBackMode = 'linear'
                    document.getElementById('shuffle').style.transition = 'transform 0s'
                    document.getElementById('shuffle').style.transform = 'rotate(-90deg)'
                    document.getElementById('shuffle').src = './Addons/icons/SVG/linear.svg'
                }
                
                if(rand){
                rand = false}
                else{
                    rand = true
                }
            })

            document.getElementById('timeslide').addEventListener('input', () => {
                console.log('there was a change')
                follow = false
            })
        
            document.getElementById('timeslide').addEventListener('change', () => {
                    if(audio.isLoaded() && release){
                        release = false
                    document.getElementById('play-pause').style.opacity = '0%'
                    document.getElementById('loading').style.opacity = '100%'
                    //console.log(document.getElementById('timeslide').value / 10, audio.currentTime())
                    audio.jump(document.getElementById('timeslide').value)
                    let interval = setInterval(() => {
                        if(audio.isLoaded()){
                            follow = true
                            release = true
                            started = true
                            clearInterval(interval)
                        }
                    }, 10)} else{
                        console.log('not released')
                    }
            })
        
            next.addEventListener('click',  () => {
                if(started){
                switch(PlayBackMode){
                    case 'linear':{
                            console.log('clicked')
                            if(playlist[plpos+1] && started){
                            plpos++
                            document.getElementById('play-pause').style.opacity = '0%'
                            document.getElementById('loading').style.opacity = '100%'
                            if(audio._paused) state = 'paused'
                            else state = 'playing'
                            audio.stop()
                            audio = NextSong(playlist, plpos, state) || audio
                            //console.log(audio)
                            started = false
                            ready = false
                            const interval = setInterval(() => {
                                if(audio.isLoaded() && !started){
                                started = true
                                ready = true
                                manageAudioData()
                                audio.play()
                                if(state === 'paused') audio.pause()
                                  clearInterval(interval)
                                }
                              }, 10)
                            setTimeout(() => {
                                document.getElementById('alternate-audio-react').style.transition = `all ${BGspeed} ease-out`
                            }, 1000)}
                    }break;

                    case 'shuffle':{
                        if(started){
                            console.log(audio)
                            let ipos;
                            if(corrupt){
                                corrupt = false
                                ipos = plpos
                                plpos = 0
                            } else{
                                ipos = plpos
                                while (plpos === ipos){
                                plpos = Math.floor(Math.random() * playlist.length)}
                            }
                            
                            let diffpos = plpos - ipos
                            document.getElementById('play-pause').style.opacity = '0%'
                            document.getElementById('loading').style.opacity = '100%'
                            if(audio._paused) state = 'paused'
                            else state = 'playing'
                            audio.stop()
                            audio = PlayShuffleSong(playlist, plpos, ipos, diffpos)
                            started = false
                            ready = false

                            let interval = setInterval(() => {
                                if(audio.isLoaded() && !started){
                                started = true
                                manageAudioData()
                                audio.play()
                                if(state === 'paused') audio.pause()
                                //document.getElementById('refr-alt').click()
                                clearInterval(interval)
                                }
                                }, 10)
                            setTimeout(() => {
                                document.getElementById('alternate-audio-react').style.transition = `all ${BGspeed} ease-out`
                            }, 1000)}
                    }
                    break;

                    case 'loop':{
                        if(started){
                        let pos = plpos
                        started = false
                        ready = false
                        document.getElementById('play-pause').style.opacity = '0%'
                        document.getElementById('loading').style.opacity = '100%'
                        audio.stop()
                        audio = null
                        audio = loadSound(playlist[pos].url, loaded)
                        
                        let interval = setInterval(() => {
                            if(audio.isLoaded() && !started){
                                started = true
                                ready = true
                                manageAudioData()
                                audio.play()
                                if(state === 'paused') audio.pause()
                                clearInterval(interval)
                            }
                        })
                        //if(audio.isLoaded()) audio.play()
                    }
                    }break;
                }}
            })
            prev.addEventListener('click',  () => {
                if(plpos > 0 && started){
                plpos--
                document.getElementById('play-pause').style.opacity = '0%'
                document.getElementById('loading').style.opacity = '100%'
                if(audio._paused) state = 'paused';
                else state = 'playing'
                audio.stop()
                audio = PrevSong(playlist, plpos, state) || audio
                started = false
                const interval = setInterval(() => {
                    if(audio.isLoaded() && !started){
                    started = true
                    manageAudioData()
                    audio.play()
                    if(state === 'paused'){
                    audio.pause()}
                    clearInterval(interval)
                    }
                  }, 10)
                setTimeout(() => {
                    document.getElementById('alternate-audio-react').style.transition = `all ${BGspeed} ease-out`
                }, 1000)}
            })        
        }    
    } catch (e) {
        console.log('not loaded')
        console.log(e)
    }
    
}

window.addEventListener('keydown', (event) => {
    let key
    if(event.key.length === 1){
        key = event.key.toLowerCase()}
        else{
            key = event.key
        }

    if(noError && completesplash){
        switch(key){
            case 'f':{
                document.getElementById('change-state').click()
            }break;

            case ' ':{
                if(audio){
                    if(audio.isLoaded()){
                playpausebtn.click()}}
            }break;

            case 'ArrowLeft':{
                if(audio){
                    if(audio.isLoaded()){
                        prev.click()}}
            }break;

            case 'ArrowRight':{
                if(audio){
                    if(audio.isLoaded()){
                        next.click()}}
            }break;

            case 'ArrowUp':{
                volumeSlider.value = Math.max((volumeSlider.value + volumeSlider.step)/10) + 0.9
                volumeSlider.dispatchEvent(new Event('input', { bubbles: true}));
            }break;

            case 'ArrowDown':{
                volumeSlider.value = volumeSlider.value - volumeSlider.step
                volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
            }break;
            case 'Escape':{
                if(document.getElementById('options').style.left !== '-380px'){
                    openMENU()
                }
                document.getElementById('eq-menu').style.top = '-500px'
                document.getElementById('eq-menu').style.opacity = '0%'
                setTimeout(() => {
                document.getElementById('eq-menu').style.display = 'none'
                document.getElementById('app-title').style.filter = 'blur(0px) brightness(100%)'
                document.getElementById('Audio-react').style.filter = 'blur(0px) brightness(60%)'
                document.getElementById('current-track').style.filter = 'blur(0px) brightness(120%)'
                }, 1000)
            }break;
        }}
})

document.getElementById('alternate-audio-react').style.transition = `all ${BGspeed} ease-out`

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

var tempvol = 0

function manageAudioData(){
    if(audio){
        if(audio.isLoaded()){
            let temptime = Math.max(Math.floor(audio.duration() % 60), 0)
            let totalseconds = temptime < 10? '0' + temptime: temptime.toString()
            let totaltime = Math.max(Math.floor(audio.duration() / 60), 0) + ':' + totalseconds
            document.getElementById('total-time').innerHTML = totaltime
            //audio.output.channelCount = 8
            if(tempvol !== volumeSlider.value / 20){
            audio.setVolume(volumeSlider.value / 20)
            tempvol = volumeSlider.value / 20}
            //console.log(audio)
            document.getElementById('track-artist').innerHTML = playlist[plpos].artist || 'Unknown'
            document.getElementById('track-name').innerHTML = playlist[plpos].title || 'Unknown'
            //eq.process(audio)
        }
    }
}

function draw(){
    try {
        if(audio){
                if(started){
                    try {
                        vol = amplitude.getLevel()
                    } catch (e) {
                        if(document.getElementById('opt-menu2').style.display === 'block') localStorage.setItem('PlMenuOpened', true)
                        else localStorage.setItem('PlMenuOpened', false)

                        localStorage.setItem('emptyreload', true)
                        window.location.reload()
                    }
                    //console.log(amplitude, vol)

                    if(audio.isLoaded()){
                        startloaddate = Date.now()             
                        document.getElementById('play-pause').style.opacity = '100%'
                        document.getElementById('loading').style.opacity = '0%'
                        let time = Math.max(Math.floor(audio.currentTime() % 60), 0)
                        const seconds = time < 10? '0' + time: time.toString()
                        if(timemode === 'normal'){ 
                            document.getElementById('current-time').innerHTML = Math.max(Math.floor(audio.currentTime() / 60), 0) + ':' + seconds
                        }
                        else{
                            let RemainingtimeSec = (audio.duration() - audio.currentTime());
                            let rmin = Math.floor(RemainingtimeSec / 60);
                            let rs = Math.floor(RemainingtimeSec % 60);
                            var Remainingtime
                            Remainingtime = ('-') + rmin + ':' + (rs < 10 ? '0' : '') + rs;

                            if(Remainingtime === '-0:00'){  
                                Remainingtime = '0:00'
                            }
                            
                            document.getElementById('current-time').innerHTML = Remainingtime;
                        }   
                        document.getElementById('timeslide').max = audio.duration()
                        document.getElementById('timeslide').style.backgroundSize = `${(((audio.currentTime() / audio.duration()) * 100) + 1)}% 100%`
                        if(follow) document.getElementById('timeslide').value = (audio.currentTime())
                    if(document.getElementById('alternate-audio-react').style.display === 'block' && vol*20 > 0.1){
                        document.getElementById('alternate-audio-react').style.transform = `scale(${vol*10})`
                        //document.getElementById('gradient').style.animationDuration =`${50/(vol*100)}s`
                        }
                    }
                    audio.onended(() => {
                        document.getElementById('timeslide').max = 100
                        document.getElementById('timeslide').value = 0
                        if(!audio._paused){
                        if(plpos >= playlist.length - 1){
                        document.getElementById('alternate-audio-react').style.transition = 'all 1s ease-out'
                        document.getElementById('alternate-audio-react').style.transform = `scale(1)`
                
                        setTimeout(() => {
                            document.getElementById('alternate-audio-react').style.transition = `all ${BGspeed} ease-out`
                        }, 1000)} 
                        else{
                        if(started && audio.isLoaded() && !audio._paused && release){
                        next.click()
                        }
                        document.getElementById('alternate-audio-react').style.transition = 'all 1s ease-out'
                        document.getElementById('alternate-audio-react').style.transform = `scale(1)`

                        setTimeout(() => {
                            document.getElementById('alternate-audio-react').style.transition = `all ${BGspeed} ease-out`
                        }, 1000)
                        }
                    }
                    })}
                 else{
                //let difference = Date.now() - startloaddate
                //console.log(corrupt)
                if(corrupt){
                    if(audio.buffer === null || audio.duration() === 0){
                        if(corrupt){
                        corrupt = false
                        //console.log(audio)
                        started = true
                        displayERR('corupted-file')
                        if(!goback){
                        if(plpos < playlist.length - 1){
                        next.click()}
                        else{
                            let previousmode = PlayBackMode
                            PlayBackMode = 'shuffle'
                            next.click()
                            PlayBackMode = previousmode
                        }}
                        else{
                            goback = false
                            if(plpos > 0){
                                prev.click()
                            }
                        }
                    console.log('There might be an error in the audio file')}}
                    //startloaddate = Date.now()
                }
                document.getElementById('play-pause').style.opacity = '0%'
                document.getElementById('loading').style.opacity = '100%'
                //console.log('not loaded')
            }   } else{
                /*let difference = Date.now() - startloaddate
                if(difference > 2000){
                    startloaddate = Date.now()
                    //console.log('refreshed')
                    document.getElementById('refr-alt').click()
                } else{
                    //console.log(difference)
                }
                prevnul = true*/
                //console.log('not started')
            }
    } catch (e) {
            //console.log(e)
    }
}

setInterval(() => {
    if(playlist.length === 0 || !playlist){
        let difference = Date.now() - startloaddate
                if(difference > 2000){
                    startloaddate = Date.now()
                    //console.log('refreshed')
                    document.getElementById('refr-alt').click()
                }
                prevnul = true
                //console.log('not started')
    }
}, 1000)

