var opentab = new Howl({
  src: ['./Addons/SF/openmenu1.mp3'],
  volume: 1,
  stereo: true,
});

var initx = 1777
document.querySelector('audio').volume = '0.3'
window.onload = () => {
  setTimeout(() => {
    document.getElementById('splash-scr').style.opacity = '0%'

    setTimeout(() => {
      document.getElementById('splash-scr').style.display = 'none'
    }, 600)
  }, 1000)
 
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
  optprev.style.display = 'block'
  setTimeout(() => {
    document.getElementById('opt-menu2').style.display = 'none'
    document.getElementById('opt-menu3').style.display = 'none'
  }, 800)

  document.getElementsByClassName('opt-txt').forEach((elem) => {
    if(elem.style.opacity === '0') elem.style.opacity = '100%'
    else elem.style.opacity = '0%'
  })

  if(opt.style.left === '-380px'){
  document.getElementById('opt-menu2').style.opacity = '0%'
  document.getElementById('opt-menu3').style.opacity = '0%'
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
  if(playlist[0][position] !== undefined){
  const audio = loadSound(playlist[0][position].url, loaded)
  console.log(playlist[0][position].url, audio)
  return audio
  } else{
    console.log('did not passed', position, playlist[0].length - 1, playlist[0])
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
    const audio = loadSound(playlist[0][position].url, loaded)
    console.log(playlist[0][position].url, audio)
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

function MoveToCurrent(audio, playlist){
  const array = document.getElementById('current-track').childNodes
  var childarray = []
  var position;
  if(!reversed){

  playlist[0].forEach((elem) => {
    if(elem.url === audio.url){
      position = playlist[0].indexOf(elem)
    }
  })

  array.forEach((elem) => {
    if(elem.id === 'child-track'){
      childarray.push(elem)
    }
  })
console.log(position)
      console.log('passed')
      array.forEach((elem) => {
        if(elem.id === 'child-track'){
        var ipos = elem.style.top 
        ipos = ipos.replace('px', '')
        const fpos = parseInt(ipos) + (150*position)
        elem.style.top = `${fpos}px`}
      })
      
      return position} 
      else{
        playlist[0].forEach((elem) => {
          if(elem.url === audio.url){
            position = playlist[0].indexOf(elem)
          }
        })
      
        array.forEach((elem) => {
          if(elem.id === 'child-track'){
            childarray.push(elem)
          }
        })
      console.log(position)
            console.log('passed')
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