var idle = 0;
var idletimeout = 20
var noError = false
var prevautochanged = false
$(document).ready(() => {
    setInterval(IdleIncrease, 1000);

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

function IdleIncrease() {
    idle++
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

if(!emptyreload){
  document.querySelector('audio').play()
  document.querySelector('audio').volume = '0.3'
  window.onload = () => {
  setTimeout(() => {
    document.getElementById('splash-scr').style.opacity = '0%'

    setTimeout(() => {
      document.getElementById('splash-scr').style.display = 'none'
    }, 600)
  }, 1000)
 
}
}else{
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

function displayERR(){
  var err = document.getElementById('err-message')
  err.style.display = 'block'
  setTimeout(() => {
    err.style.right = '0%'
    setTimeout(() => {
      err.style.opacity = '100%'
      setTimeout(() => {
        document.getElementById('err-icon-parent').classList.add('jump')
        document.getElementById('err-icon').classList.add('shake')
        setTimeout(() => {
          document.getElementById('err-icon-parent').classList.remove('jump')
          document.getElementById('err-icon').classList.remove('shake')
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
  optprev.style.display = 'block'
  setTimeout(() => {
    document.getElementById('opt-menu2').style.display = 'none'
    document.getElementById('opt-menu3').style.display = 'none'
    document.getElementById('opt-menu4').style.display = 'none'
    document.getElementById('opt-menu5').style.display = 'none'
  }, 800)

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
  document.getElementById('app-title').style.filter = 'blur(0px) brightness(100%)'
  document.getElementById('eq-menu').style.top = '-500px'
  document.getElementById('eq-menu').style.opacity = '0%'
  setTimeout(() => {
    document.getElementById('eq-menu').style.display = 'none'
  }, 1000);
  switch(choice){
    case 1: {
      document.getElementById('options').style.left = '-380px'
      document.getElementById('opt-menu1').style.opacity = '0%'
      document.getElementById('opt-preview').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('opt-menu2').style.display = 'block'
        setTimeout(() => {
          setTimeout(() => {
            document.getElementById('opt-preview').style.display = 'none'
          }, 200)
          
          document.getElementById('options').style.left = '0%'
          document.getElementById('opt-menu2').style.opacity = '100%'
        }, 10)
      }, 1000)

    }break;

    case 2: {
      document.getElementById('options').style.left = '-380px'
      document.getElementById('opt-menu1').style.opacity = '0%'
      document.getElementById('opt-preview').style.opacity = '0%'
      setTimeout(() => {
        document.getElementById('opt-menu3').style.display = 'block'
        setTimeout(() => {
          setTimeout(() => {
            document.getElementById('opt-preview').style.display = 'none'
          }, 200)
          
          document.getElementById('options').style.left = '0%'
          document.getElementById('opt-menu3').style.opacity = '100%'
        }, 10)
      }, 1000)
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
      }, 1000)
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
      }, 1000)
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
  }
}

function NextSong(playlist, position){
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
  const audio = loadSound(playlist[position].url, loaded)
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
    const audio = loadSound(playlist[position].url, loaded)
    //console.log(playlist[position].url, audio)
    return audio
    } else{
      console.log('did not passed', position, playlist.length - 1)
      return undefined
    }
}

function PlayPause(audio){
  const btn = document.getElementById('play-pause')
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

function PlayShuffleSong(playlist, position, initialPos){
  /*if(!reversed){
    console.log(document.getElementById('current-track').childNodes)
    document.getElementById('current-track').childNodes.forEach((elem) => {
      if(elem.id === 'child-track'){
      var ipos = elem.style.top 
      ipos = ipos.replace('px', '')
      const fpos = parseInt(ipos) + (150*(position))
      elem.style.top = `${fpos}px`}
    })}
    else{
      try {
        document.getElementById('current-track').childNodes.forEach((elem) => {
        if(elem.id === 'child-track'){
        var ipos = elem.style.top 
        ipos = ipos.replace('px', '')
        var fpos
        console.log(initialPos, position)
        if(initialPos < position){
        fpos = parseInt(ipos) - (150*(position))}
        else{
          console.log('yes')
          fpos = parseInt(ipos) + (150*(position))
        }
        elem.style.top = `${fpos}px`}
      }) 
      } catch (e) {
        console.log(e)
      }
    }*/
    //MoveToCurrent(playlist[position].url, playlist)
    if(playlist[position] !== undefined){
    const audio = loadSound(playlist[position].url, loaded)
    //console.log(playlist[position].url, audio)
    return audio
    } else{
      console.log('did not passed', position, playlist.length - 1, playlist)
      return undefined
    }
}