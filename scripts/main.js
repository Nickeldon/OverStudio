var EffectChangeTimeout = true
var completesplash = false
var corrupt = false

var BackgroundData = []
var BGready = false

var BGrefresh = localStorage.getItem('Background-Cooldown') || 10000
localStorage.setItem('Background-Cooldown', BGrefresh)
console.log(BGrefresh)
if(BGrefresh < 60000){
document.getElementById('BG-cooldown-txt0').innerText = `${BGrefresh/1000}s`}
else{
  document.getElementById('BG-cooldown-txt0').innerText = `${BGrefresh/60000}min`
}

var BGpos = 0

console.log(localStorage.getItem('Sound_boot'))

var BGchoice = localStorage.getItem('Background-Type') || 'Reactor'
localStorage.setItem('Background-Type', BGchoice)
BGchoice === 'Reactor' ? document.getElementById('BG-choice-txt0').innerText = 'Reactor' : document.getElementById('BG-choice-txt0').innerText = 'Custom'

console.log(localStorage.getItem('Reactor-Speed'))
var BGspeed = localStorage.getItem('Reactor-Speed') || '.2'
localStorage.setItem('Reactor-Speed', BGspeed)
document.getElementById('amp-speed-txt0').innerText = BGspeed

const speeds = {
  baseSpeed: [1, 1, 1, 1, 1, 1000],
  fast: [0.5, 0.5, 0.5, 0.5, 0.5, 600]
}

var chosenSpeed = localStorage.getItem('animations') || 'baseSpeed'
localStorage.setItem('animations', (chosenSpeed))
animationSpeeds(speeds[chosenSpeed])

if(chosenSpeed === 'fast'){document.getElementById('anim-txt0').innerHTML = 'Animations speed: 2x'}
else {document.getElementById('anim-txt0').innerHTML = 'Animations speed: 1x'}

var bootsoundbool = (localStorage.getItem('Sound_boot')) || 'true'
if(bootsoundbool == 'false') bootsoundbool = false
else bootsoundbool = false
localStorage.setItem('Sound_boot', bootsoundbool)
console.log(bootsoundbool)
if(bootsoundbool){
  document.getElementById('boot-snd-txt0').innerText = 'Disable Sound at boot'
}
else{
  document.getElementById('boot-snd-txt0').innerText = 'Enable Sound at boot'
}

effectsArray = JSON.parse(localStorage.getItem('effectsState')) || {dust: 'true', amplitude: 'true'}
var goback = false
var enDust = (/true/).test(effectsArray['dust']) || false
var enAmpl = (/true/).test(effectsArray['amplitude']) || false

document.getElementById('dust-txt0').innerText = 'Disable dust particles'
document.getElementById('dust').style.display = 'block'
document.getElementById('ampl-txt0').innerText = 'Disable Amplitude Reactor'
document.getElementById('alternate-audio-react').style.display = 'block'

if(!enDust) {
  document.getElementById('dust-txt0').innerText = 'Enable dust particles'
  document.getElementById('dust').style.display = 'none'}
if(!enAmpl) {
  document.getElementById('ampl-txt0').innerText = 'Enable Amplitude Reactor'
  document.getElementById('alternate-audio-react').style.display = 'none'}
localStorage.setItem('effectsState', JSON.stringify(effectsArray))


var idle = 0;
var idletimeout = parseInt(localStorage.getItem('idletimeout')) || 25
localStorage.setItem('idletimeout', idletimeout)
console.log(idletimeout)
if(idletimeout == 25){
document.getElementById('idle-txt0').innerText = '25s'}
else if(idletimeout == 10){
  document.getElementById('idle-txt0').innerText = '10s'
}
else{
  document.getElementById('idle-txt0').innerText = `${idletimeout/60} min`
}

var noError = false
var prevautochanged = false
$(document).ready(() => {

    setInterval(() => {if(idletimeout > 0){IdleIncrease()} else idle = 0}, 1000);

    $(this).mousemove(() => {
        idle = 0;
        if(rotdeg === 0 && prevautochanged){
          prevautochanged = false
          changeState()
        }
    })
    $(this).keypress(() => {
        idle = 0;
        if(rotdeg === 0 && prevautochanged){
          prevautochanged = false
          changeState()
        }
    })
})

var cooldownBGState = true

function SwitchBackgrounds(choice){
  if(cooldownBGState){
    cooldownBGState = false;
  if(choice === 'Reactor'){
    BGready = false
    var prevTransition = document.getElementById('alternate-audio-react').style.transition
    document.getElementById('alternate-audio-react').style.transition = 'none'
    document.getElementById('Audio-react').style.transition = 'none'

    document.getElementById('alternate-audio-react').style.opacity = '0%'
    document.getElementById('alternate-audio-react').style.display = 'block'
    document.getElementById('Audio-react').style.opacity = '100%'

    document.getElementById('Audio-react').style.transition = 'all 1s ease-out'
    setTimeout(() => {
      document.getElementById('Audio-react').style.opacity = '0%'
      document.getElementById('alternate-audio-react').style.opacity = '100%'
      setTimeout(() => {
        document.getElementById('Audio-react').style.display = 'none'
        document.getElementById('alternate-audio-react').style.transition = prevTransition
        cooldownBGState = true
      }, 1000)
    }, 100)
    
} else if(choice === 'Custom'){
    document.getElementById('Audio-react').style.transition = 'none'
    document.getElementById('Audio-react').style.display = 'none'
    setTimeout(() => {
      document.getElementById('alternate-audio-react').style.display = 'block'
      document.getElementById('Audio-react').style.opacity = '0%'
      document.getElementById('Audio-react').style.display = 'block'
      document.getElementById('Audio-react').style.transition = 'all 1s ease-out'
      setTimeout(() => {
        document.getElementById('Audio-react').style.opacity = '100%'
      }, 100)
      var prevTransition = document.getElementById('alternate-audio-react').style.transition
        document.getElementById('alternate-audio-react').style.transition = 'all 1s ease-out'
        document.getElementById('alternate-audio-react').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('alternate-audio-react').style.display = 'none'
        document.getElementById('alternate-audio-react').style.transition = prevTransition
        document.getElementById('Audio-react').style.transition = 'none'
        document.getElementById('Audio-react').style.opacity = '0%'
        document.getElementById('Audio-react').style.transition = 'all 1s ease-out'
        document.getElementById('Audio-react').src = BackgroundData[BGpos]
        setTimeout(() => {
            document.getElementById('Audio-react').style.opacity = '100%'
        }, 100)
        cooldownBGState = true
        BGready = true
      }, 1000)
    }, 100)
  
  }}
}

function FetchBackgrounds(State, Bypass){
    //console.log('loaded')
  fetch(`http://localhost:${PORT}/getBackgrounds`)
  .then((res) => res.json())
  .then((res) => {
      //console.log(res)
      BackgroundData = shuffleArray(res)
      if(!Bypass){
        if(State === 'Reactor'){
          document.getElementById('Audio-react').style.display = 'none'
          document.getElementById('alternate-audio-react').style.display = 'none'
          setTimeout(() => {
            var prevTransition = document.getElementById('alternate-audio-react').style.transition
            document.getElementById('alternate-audio-react').style.transition = 'all 1s ease-out'
            document.getElementById('alternate-audio-react').style.display = 'block'
            setTimeout(() => {
                document.getElementById('alternate-audio-react').style.opacity = '100%'
                setTimeout(() => {
                    document.getElementById('alternate-audio-react').style.transition = prevTransition
                }, 1000)
            }, 10)
          }, 100)
          
        } else if(State === 'Custom'){
          if(BackgroundData){
            if(BackgroundData.length > 0){
              console.log(BackgroundData[BGpos]) 
                try {
                  document.getElementById('Audio-react').style.transition = 'all 1s ease-out'
                  document.getElementById('Audio-react').style.display = 'none'
                  document.getElementById('alternate-audio-react').style.display = 'none'

                    document.getElementById('Audio-react').src = BackgroundData[BGpos]
                    document.getElementById('Audio-react').onerror = () => {
                    BGpos++
                    document.getElementById('Audio-react').src = BackgroundData[BGpos]
                  }
                document.getElementById('Audio-react').style.display = 'block'
                setTimeout(() => {
                    document.getElementById('Audio-react').style.opacity = '100%'
                }, 10)
                var prevTransition = document.getElementById('alternate-audio-react').style.transition
                document.getElementById('alternate-audio-react').style.transition = 'all 1s ease-out'
                document.getElementById('alternate-audio-react').style.opacity = '0%'
                setTimeout(() => {
                    document.getElementById('alternate-audio-react').style.display = 'none'
                    document.getElementById('alternate-audio-react').style.transition = prevTransition
                    BGready = true
                }, 1000)
                } catch (e) {
                    console.log(e)
                }
            }
        }
        else{
            console.log('no data')
            document.getElementById('BG-choice-txt0').innerText = 'Reactor'
        }
        }}
    return BackgroundData
      })
}

function IdleIncrease() {
    idle++
    //console.log(idle, idletimeout)
    if (idle > idletimeout) {
      if(rotdeg === 11){
        prevautochanged = true
        changeState()}
    }
}

var opentab = new Howl({
  src: ['./Addons/SF/openmenu1.mp3'],
  volume: 1,
  stereo: true,
});
document.getElementById('eq-menu').style.top = '0px'
var emptyreload = (/true/).test(localStorage.getItem('emptyreload')) || false
var PlMenuOpened = (/true/).test(localStorage.getItem('PlMenuOpened')) || false

var initx = 1777

window.addEventListener('online',  verifyConnection);
window.addEventListener('offline', verifyConnection);

function verifyConnection(){
  if(navigator.onLine){
    console.log('online')
  } else{
    console.log('offline')
  }

}

if(!emptyreload){
  window.onload = () => {
    FetchBackgrounds(BGchoice)
    document.getElementById('Audio-react').style.display = 'none'
      if(bootsoundbool){
        document.querySelector('audio').play()
        document.querySelector('audio').volume = '0.3'}
    setTimeout(() => {
      document.getElementById('splash-scr').style.opacity = '0%'
  
      setTimeout(() => {
        document.getElementById('splash-scr').style.display = 'none'
        completesplash = true
      }, 600)
    }, 1000)
}
}else{
  completesplash = true
  if(PlMenuOpened){
    var animation = [document.getElementById('options').style.transition, document.getElementById('opt-menu2').style.transition]
    document.getElementById('options').style.transition = 'none'
    document.getElementById('opt-menu2').style.transition = 'none'
    openMENU(); 
    options(1)
    localStorage.setItem('PlMenuOpened', false)
    setTimeout(() => {
      document.getElementById('options').style.transition = animation[0]
    document.getElementById('opt-menu2').style.transition = animation[1]
    }, 1000)
  }
  document.getElementById('splash-scr').style.display = 'none'
  localStorage.setItem('emptyreload', false)
}

/*
function InternetHandler(status){
  console.log(status)
}

function checkInternet(){
  var xhr = new XMLHttpRequest();
  setInterval(() => {
    console.log('checking')
    try {
      xhr.open('GET', 'https://www.google.com', true);
      xhr.send();

        if(xhr.readyState === 4 && xhr.status === 200){
          InternetHandler("Connected")
          console.log(xhr.status, xhr.readyState)
        } else{
          console.log(xhr.status, xhr.readyState)
          InternetHandler("Disconnected")
        }
    } catch (e) {
      console.log(e)
      //InternetHandler("Disconnected")
    }
  }, 1000)
}*/

function animationSpeeds(transitions){
  console.log(document.getElementById('eq-menu').style.transition,
  document.getElementById('opt-menu2').style.transition, 
  document.getElementById('opt-menu3').style.transition, 
  document.getElementById('opt-menu4').style.transition,
  document.getElementById('opt-menu5').style.transition,
  document.getElementById('opt-menu6').style.transition,
  document.getElementById('options').style.transition,
  document.getElementById('Audio-react').style.transition,
  document.getElementById('UI-scr1').style.transition)
  if(transitions){
    console.log('yes passed')
  document.getElementById('eq-menu').style.transition = `all ${transitions[0]}s ease-out`
  document.getElementById('opt-menu2').style.transition, 
  document.getElementById('opt-menu3').style.transition, 
  document.getElementById('opt-menu4').style.transition,
  document.getElementById('opt-menu5').style.transition,
  document.getElementById('opt-menu6').style.transition = `all ${transitions[1]}s opacity ${(transitions[1]) - 0.2}s ease-in-out`
  document.getElementById('options').style.transition = `all ${transitions[2]}s ease-in-out`
  document.getElementById('Audio-react').style.transition = `transform ${transitions[3]}s ease-out`
  document.getElementById('UI-scr1').style.transition = `opacity ${transitions[4]}s ease-out`
}
}

function displayERR(type){
  if(type === 'directory-exists' || !type){
  var icparent = document.getElementById('err-icon-parent')
  var ic = document.getElementById('err-icon')
  var err = document.getElementById('err-message')}
  else if(type === 'corupted-file'){
    var icparent = document.getElementById('corrupt-icon-parent')
    var ic = document.getElementById('corrupt-icon')
    var err = document.getElementById('corrupt-message')
  } 
  else if(type === 'No-Background-file'){
    var icparent = document.getElementById('No-BG-icon-parent')
    var ic = document.getElementById('No-BG-icon')
    var err = document.getElementById('No-BG-message')
  }
  err.style.display = 'block'
  setTimeout(() => {
    err.style.right = '0%'
    setTimeout(() => {
      err.style.opacity = '100%'
      setTimeout(() => {
        icparent.classList.add('jump')
        ic.classList.add('shake')
        setTimeout(() => {
          icparent.classList.remove('jump')
          ic.classList.remove('shake')
        },1560)
      }, 500)
      setTimeout(() => {
        err.style.right = '-400px'
        setTimeout(() => {
          err.style.opacity = '0%'
          setTimeout(() => {
            err.style.display = 'none'
          }, 2000)
        }, 50)
      }, 3000)
    }, 200)
  }, 10)

}

var givenres
document.querySelector('body').style.transition = 'none'
document.querySelector('body').style.transform = `scale(${1024/initx})`
setTimeout(() => {
  document.querySelector('body').style.transition = 'transition: all 1s ease-out;'
}, 1000)

setInterval(() => {
  var givenres = window.innerHeight 
  document.querySelector('body').style.transform = `scale(${window.innerWidth/initx})`

}, 0)

var rotdeg = 11
var normscale = 1.3
document.getElementById('Audio-react').style.transform = `rotate(${rotdeg}deg) scale(${normscale})`

function changeState(){
  console.log('yes')
  if(rotdeg === 11){
    setTimeout(() => {
      document.getElementById('filter').style.opacity = '0%'
      document.getElementById('cont-bar').style.borderColor = 'transparent'
      document.getElementById('UI-scr1').style.opacity = '0'
    }, 10)
    
    rotdeg = 0
    normscale = 1
    document.getElementById('Audio-react').style.transform = `rotate(${rotdeg}deg) scale(${normscale})`
    setTimeout(() => {
      if(rotdeg === 0){
      document.getElementById('track-info').style.opacity = '70%'
      document.getElementById('track-info').style.right = '-50px'}
    }, 1500)
  } else{
    setTimeout(() => {
      document.getElementById('filter').style.opacity = '50%'
      document.getElementById('cont-bar').style.borderColor = 'white'
      document.getElementById('UI-scr1').style.opacity = '100%'
    }, 10)
    rotdeg = 11
    normscale = 1.3
    document.getElementById('Audio-react').style.transform = `rotate(${rotdeg}deg) scale(${normscale})`
    document.getElementById('track-info').style.opacity = '0%'
    document.getElementById('track-info').style.right = '-550px'
  }
}

function openMENU(){
  
  opentab.play()
  var opt = document.getElementById('options')
  var optprev = document.getElementById('opt-preview')
  var optprevicns = document.getElementsByClassName('menu-icns')
  document.getElementById('opt-menu2').style.opacity = '0%'
  document.getElementById('opt-menu3').style.opacity = '0%'
  document.getElementById('opt-menu4').style.opacity = '0%'
  document.getElementById('opt-menu5').style.opacity = '0%'
  document.getElementById('opt-menu6').style.opacity = '0%'
  optprev.style.display = 'block'
  let deletespeed = parseInt(speeds[chosenSpeed][5]) - 200
  setTimeout(() => {
    document.getElementById('opt-menu2').style.display = 'none'
    document.getElementById('opt-menu3').style.display = 'none'
    document.getElementById('opt-menu4').style.display = 'none'
    document.getElementById('opt-menu5').style.display = 'none'
    document.getElementById('opt-menu6').style.display = 'none'
  }, deletespeed)

  document.getElementsByClassName('opt-txt').forEach((elem) => {
    if(elem.style.opacity === '0') elem.style.opacity = '100%'
    else elem.style.opacity = '0%'
  })

  if(opt.style.left === '-380px'){
    document.getElementById('app-title').style.filter = 'blur(0px) brightness(100%)'
    document.getElementById('eq-menu').style.top = '-500px'
  document.getElementById('eq-menu').style.opacity = '0%'
  setTimeout(() => {
    document.getElementById('eq-menu').style.display = 'none'
  }, 1000);
  document.getElementById('opt-menu2').style.opacity = '0%'
  document.getElementById('opt-menu3').style.opacity = '0%'
  document.getElementById('opt-menu4').style.opacity = '0%'
  document.getElementById('opt-menu5').style.opacity = '0%'
  document.getElementById('opt-menu6').style.opacity = '0%'
  document.getElementById('opt-menu1').style.opacity = '100%'
  document.getElementById('Audio-react').style.filter = 'blur(5px) brightness(60%)'
  document.getElementById('current-track').style.filter = 'blur(5px) brightness(60%)'
  opt.style.display = 'block'
  optprev.style.opacity = '100%'

  optprevicns.forEach((elem) => {
    elem.style.animation = '1s pop both'
  })

  setTimeout(() => {
    opt.style.opacity = '80%'
    opt.style.left = '0px'
  }, 100)} 
  
  else{
    document.getElementById('Audio-react').style.filter = 'blur(0px) brightness(60%)'
    document.getElementById('current-track').style.filter = 'blur(0px) brightness(120%)'
    optprev.style.opacity = '20%'
    opt.style.left = '-380px'

    optprevicns.forEach((elem) => {
      elem.style.animation = ''
    })

  setTimeout(() => {
    opt.style.opacity = '30%'
    opt.style.display = 'block'
  }, 100)
  }
}

function options(choice){
  console.log(parseInt(speeds[chosenSpeed][5]) + 100)
  document.getElementsByClassName('menu-icns').forEach((elem) => {
    elem.style.pointerEvents = 'none'
    setTimeout(() => {
      elem.style.pointerEvents = 'all'
      console.log('passed')
    }, (parseInt(speeds[chosenSpeed][5]) + 100))
  })
  document.getElementById('app-title').style.filter = 'blur(0px) brightness(100%)'
  document.getElementById('eq-menu').style.top = '-500px'
  document.getElementById('eq-menu').style.opacity = '0%'
  setTimeout(() => {
    document.getElementById('eq-menu').style.display = 'none'
  }, 1000);
  switch(choice){
    case 1: {
      //document.getElementById('menu-folder').style.pointerEvents = 'none'
      document.getElementById('options').style.left = '-380px'
      document.getElementById('opt-menu1').style.opacity = '0%'
      document.getElementById('opt-preview').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('opt-menu2').style.display = 'block'
        setTimeout(() => {
          setTimeout(() => {
            document.getElementById('opt-preview').style.display = 'none'
            //document.getElementById('menu-folder').style.pointerEvents = 'all'
          }, 200)
          
          document.getElementById('options').style.left = '0%'
          document.getElementById('opt-menu2').style.opacity = '100%'
        }, 10)
      }, parseInt(speeds[chosenSpeed][5]))

    }break;

    case 2: {
      //document.getElementById('menu-add').style.pointerEvents = 'none'
      document.getElementById('options').style.left = '-380px'
      document.getElementById('opt-menu1').style.opacity = '0%'
      document.getElementById('opt-preview').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('opt-menu3').style.display = 'block'
        setTimeout(() => {
          setTimeout(() => {
            document.getElementById('opt-preview').style.display = 'none'
            //document.getElementById('opt-menu3').style.pointerEvents = 'all'
          }, 200)
          
          document.getElementById('options').style.left = '0%'
          document.getElementById('opt-menu3').style.opacity = '100%'
        }, 10)
      }, parseInt(speeds[chosenSpeed][5]))
    }break;

    case 3: {
      document.getElementById('options').style.left = '-380px'
      document.getElementById('opt-menu1').style.opacity = '0%'
      document.getElementById('opt-menu3').style.opacity = '0%'
      document.getElementById('opt-preview').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('opt-menu4').style.display = 'block'
        setTimeout(() => {
          setTimeout(() => {
            document.getElementById('opt-preview').style.display = 'none'
          }, 200)
          
          document.getElementById('options').style.left = '0%'
          document.getElementById('opt-menu4').style.opacity = '100%'
        }, 10)
      }, parseInt(speeds[chosenSpeed][5]))
    }break;

    case 4: {
      document.getElementById('options').style.left = '-380px'
      document.getElementById('opt-menu1').style.opacity = '0%'
      document.getElementById('opt-menu3').style.opacity = '0%'
      document.getElementById('opt-preview').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('opt-menu5').style.display = 'block'
        setTimeout(() => {
          setTimeout(() => {
            document.getElementById('opt-preview').style.display = 'none'
          }, 200)
          
          document.getElementById('options').style.left = '0%'
          document.getElementById('opt-menu5').style.opacity = '100%'
        }, 10)
      }, parseInt(speeds[chosenSpeed][5]))
    }break;

    case 5: {
      if(document.getElementById('eq-menu').style.top === '-500px'){
      openMENU()
      document.getElementById('Audio-react').style.filter = 'blur(5px) brightness(40%)'
      document.getElementById('current-track').style.filter = 'blur(5px) brightness(10%)'
      document.getElementById('app-title').style.filter = 'blur(5px) brightness(10%)'
      document.getElementById('options').style.left = '-380px'
      document.getElementById('opt-menu1').style.opacity = '0%'
      document.getElementById('opt-menu3').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('eq-menu').style.display = 'block'
        setTimeout(() => {
          document.getElementById('eq-menu').style.display = 'block'
          document.getElementById('eq-menu').style.top = '0px'
          document.getElementById('eq-menu').style.opacity = '100%'
        }, 10)
      }, 1000)}
      else{
        document.getElementById('eq-menu').style.top = '-500px'
        document.getElementById('eq-menu').style.opacity = '0%'
        setTimeout(() => {
          document.getElementById('eq-menu').style.display = 'none'
        }, 1000)
      }
    }break;

    case 6: {
      document.getElementById('options').style.left = '-380px'
      document.getElementById('opt-menu1').style.opacity = '0%'
      document.getElementById('opt-menu3').style.opacity = '0%'
      document.getElementById('opt-preview').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('opt-menu6').style.display = 'block'
        setTimeout(() => {
          setTimeout(() => {
            document.getElementById('opt-preview').style.display = 'none'
          }, 200)
          
          document.getElementById('options').style.left = '0%'
          document.getElementById('opt-menu6').style.opacity = '100%'
        }, 10)
      }, parseInt(speeds[chosenSpeed][5]))
    }break;
  }
}

function NextSong(playlist, position){
  console.log(position)
  if(!reversed){
  document.getElementById('current-track').childNodes.forEach((elem) => {
    var toppos = document.getElementById('current-track').childNodes[document.getElementById('current-track').childNodes.length - 1].style.top
    if(elem.id === 'child-track' && parseInt(toppos.replace('px', '')) < 280){
    var ipos = elem.style.top 
    ipos = ipos.replace('px', '')
    const fpos = parseInt(ipos) + 150
    elem.style.top = `${fpos}px`}
  })}
  else{
    try {
      var bottompos = document.getElementById('current-track').childNodes[document.getElementById('current-track').childNodes.length - 1].style.top
      document.getElementById('current-track').childNodes.forEach((elem) => {
      if(elem.id === 'child-track' && parseInt(bottompos.replace('px', '')) > 290){
      var ipos = elem.style.top 
      ipos = ipos.replace('px', '')
      const fpos = parseInt(ipos) - 150
      elem.style.top = `${fpos}px`}
    }) 
    } catch (e) {
      console.log(e)
    }
  }
  if(playlist[position] !== undefined){
    var audio
    try {
      audio = loadSound(playlist[position].url, loaded, () => {corrupt = true})      
    } catch (e) {
      console.log('there was an error')
      console.log(e)
    }
  //console.log(playlist[position].url, audio)
  return audio
  } else{
    console.log('did not passed', position, playlist.length - 1, playlist)
    return undefined
  }
}

function PrevSong(playlist, position){
  if(!reversed){
  var bottompos = document.getElementById('current-track').childNodes[3].style.top
  document.getElementById('current-track').childNodes.forEach((elem) => {
    if(elem.id === 'child-track' && parseInt(bottompos.replace('px', '')) > 280){
    var ipos = elem.style.top 
    ipos = ipos.replace('px', '')
    const fpos = parseInt(ipos) - 150
    elem.style.top = `${fpos}px`}
  })}else{
    var toppos = document.getElementById('current-track').childNodes[3].style.top
    document.getElementById('current-track').childNodes.forEach((elem) => {
        if(elem.id === 'child-track' && parseInt(toppos.replace('px', '')) < 280){
        var ipos = elem.style.top 
        ipos = ipos.replace('px', '')
        const fpos = parseInt(ipos) + 150
        elem.style.top = `${fpos}px`} else {
          //console.log(document.getElementById('current-track').childNodes)
        }
    })
  }
  if(position > -1){
    const audio = loadSound(playlist[position].url, loaded, () => {corrupt = true; goback = true})
    //console.log(playlist[position].url, audio)
    return audio
    } else{
      console.log('did not passed', position, playlist.length - 1)
      return undefined
    }
}

function PlayPause(audio, state){
  const btn = document.getElementById('play-pause')
  if(audio){
  if(!audio.isPlaying()){
    document.getElementById('state-track').innerHTML = 'Now Playing'
    document.getElementById('disk').style.animationPlayState = 'running'
    btn.src = './Addons/icons/play.png'
    audio.play()
  } else{
    document.getElementById('disk').style.animationPlayState = 'paused'
    document.getElementById('state-track').innerHTML = 'Paused'
    btn.src = './Addons/icons/pause.png'
    audio.pause()
  }}
  else{
    if(state === 'paused'){
      document.getElementById('state-track').innerHTML = 'Now Playing'
      document.getElementById('disk').style.animationPlayState = 'running'
      btn.src = './Addons/icons/play.png'
      //audio.play()
    } else{
      document.getElementById('disk').style.animationPlayState = 'paused'
      document.getElementById('state-track').innerHTML = 'Paused'
      btn.src = './Addons/icons/pause.png'
      //audio.pause()
    }
  }
}

function MoveToCurrent(url, playlist){
  const array = document.getElementById('current-track').childNodes
  var childarray = []
  var position;
  if(!reversed){

  playlist.forEach((elem) => {
    if(elem.url === url){
      position = playlist.indexOf(elem)
    }
  })

  array.forEach((elem) => {
    if(elem.id === 'child-track'){
      childarray.push(elem)
    }
  })
//console.log(position)
      //console.log('passed')
      array.forEach((elem) => {
        if(elem.id === 'child-track'){
        var ipos = elem.style.top 
        ipos = ipos.replace('px', '')
        const fpos = parseInt(ipos) + (150*position)
        elem.style.top = `${fpos}px`}
      })
      
      return position} 
      else{
        playlist.forEach((elem) => {
          if(elem.url === url){
            position = playlist.indexOf(elem)
          }
        })
      
        array.forEach((elem) => {
          if(elem.id === 'child-track'){
            childarray.push(elem)
          }
        })
      //console.log(position)
            //console.log('passed')
            array.forEach((elem) => {
              if(elem.id === 'child-track'){
              var ipos = elem.style.top 
              ipos = ipos.replace('px', '')
              const fpos = parseInt(ipos) - (150*position)
              elem.style.top = `${fpos}px`}
            })
            
            return position
      }
}

function PlayShuffleSong(playlist, position, initialPos, difference){
  if(!reversed){
    console.log(document.getElementById('current-track').childNodes)
    document.getElementById('current-track').childNodes.forEach((elem) => {
      if(elem.id === 'child-track'){
      var ipos = elem.style.top 
      ipos = ipos.replace('px', '')
      const fpos = parseInt(ipos) + (150*(difference))
      elem.style.top = `${fpos}px`}
    })}
    else{
      try {
        document.getElementById('current-track').childNodes.forEach((elem) => {
        if(elem.id === 'child-track'){
        var ipos = elem.style.top 
        ipos = ipos.replace('px', '')
        var fpos
        fpos = parseInt(ipos) - (150*(difference))
        elem.style.top = `${fpos}px`}
      }) 
      } catch (e) {
        console.log(e)
      }
    }
    if(playlist[position] !== undefined){
    const audio = loadSound(playlist[position].url, loaded)
    //console.log(playlist[position].url, audio)
    return audio
    } else{
      console.log('did not passed', position, playlist.length - 1, playlist)
      return undefined
    }
}