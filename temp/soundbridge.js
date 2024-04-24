document.visibilityState = 'visible'
const reversed = parent.reversed
const ParentLocalStorage = parent.localStorage
const parentDocument = parent.document
var completesplash = parent.completesplash
var BackgroundData = parent.BackgroundData
var BGready = parent.BGready
const VisualMode = parent.VisualMode

function NextSong(playlist, position, state, promise){
  console.log('called')
    if(!reversed){
    parentDocument.getElementById('current-track').childNodes.forEach((elem) => {
      let toppos = parentDocument.getElementById('current-track').childNodes[parentDocument.getElementById('current-track').childNodes.length - 1].style.top
      if(elem.id === 'child-track' && parseInt(toppos.replace('px', '')) < 280){
        let ipos = elem.style.top 
        let fpos = parseInt(ipos.replace('px', '')) + 150
        elem.style.top = `${fpos}px`}
    })}
    else{
      try {
        let bottompos = parentDocument.getElementById('current-track').childNodes[parentDocument.getElementById('current-track').childNodes.length - 1].style.top
        parentDocument.getElementById('current-track').childNodes.forEach((elem) => {
        if(elem.id === 'child-track' && parseInt(bottompos.replace('px', '')) > 290){
          let ipos = elem.style.top 
          let fpos = parseInt(ipos.replace('px', '')) - 150
          elem.style.top = `${fpos}px`}
      }) 
      } catch (e) {
        console.log(e)
      }
    }
    if(playlist[position] !== undefined){
      try {
        return loadSound(playlist[position].url, promise ? promise : () => {}, () => {corrupt = true})      
      } catch (e) {
        console.log('there was an error')
        console.log(e)
        return undefined
      }
    } else{
      console.log('did not passed', position, playlist.length - 1, playlist)
      return undefined
    }
  }
  
  function PrevSong(playlist, position, state, promise){
    if(!reversed){
      let bottompos = parentDocument.getElementById('current-track').childNodes[3].style.top
      parentDocument.getElementById('current-track').childNodes.forEach((elem) => {
        if(elem.id === 'child-track' && parseInt(bottompos.replace('px', '')) > 280){
          let ipos = elem.style.top 
          let fpos = parseInt(ipos.replace('px', '')) - 150
          elem.style.top = `${fpos}px`}
    })}else{
        let toppos = parentDocument.getElementById('current-track').childNodes[3].style.top
        parentDocument.getElementById('current-track').childNodes.forEach((elem) => {
            if(elem.id === 'child-track' && parseInt(toppos.replace('px', '')) < 280){
              let ipos = elem.style.top 
              let fpos = parseInt(ipos.replace('px', '')) + 150
              elem.style.top = `${fpos}px`}
          })
        }
    if(position > -1){
      return loadSound(playlist[position].url, promise ? promise : () => {}, () => {corrupt = true; goback = true})
      } else{
        console.log('did not passed', position, playlist.length - 1)
        return undefined
      }
  }
  
  function PlayPause(audio, state){
    let btn = parentDocument.getElementById('play-pause')
    if(audio){
    if(!audio.isPlaying()){
      parentDocument.getElementById('state-track').innerHTML = 'Now Playing'
      parentDocument.getElementById('disk').style.animationPlayState = 'running'
      btn.src = './Addons/icons/play.png'
      audio.play()
    } else{
      parentDocument.getElementById('disk').style.animationPlayState = 'paused'
      parentDocument.getElementById('state-track').innerHTML = 'Paused'
      btn.src = './Addons/icons/pause.png'
      audio.pause()
    }}
    else{
      if(state === 'paused'){
        parentDocument.getElementById('state-track').innerHTML = 'Now Playing'
        parentDocument.getElementById('disk').style.animationPlayState = 'running'
        btn.src = './Addons/icons/play.png'
        //audio.play()
      } else{
        parentDocument.getElementById('disk').style.animationPlayState = 'paused'
        parentDocument.getElementById('state-track').innerHTML = 'Paused'
        btn.src = './Addons/icons/pause.png'
        //audio.pause()
      }
    }
  }
  
  function MoveToCurrent(url, playlist){
    let array = parentDocument.getElementById('current-track').childNodes
    let childarray = [];
    let position = 0
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
  
        array.forEach((elem) => {
          if(elem.id === 'child-track'){
          let ipos = elem.style.top 
          let fpos = parseInt(ipos.replace('px', '')) + (150*position)
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
                let ipos = elem.style.top 
                let fpos = parseInt(ipos.replace('px', '')) - (150*position)
                elem.style.top = `${fpos}px`}
              })
              
              return position
        }
  }
  
  function PlayShuffleSong(playlist, position, initialPos, difference, promise){
    if(!reversed){
      parentDocument.getElementById('current-track').childNodes.forEach((elem) => {
        if(elem.id === 'child-track'){
        let ipos = elem.style.top 
        let fpos = parseInt(ipos.replace('px', '')) + (150*(difference))
        elem.style.top = `${fpos}px`}
      })}
      else{
        try {
          parentDocument.getElementById('current-track').childNodes.forEach((elem) => {
          if(elem.id === 'child-track'){
          let ipos = elem.style.top 
          let fpos = parseInt(ipos.replace('px', '')) - (150*(difference))
          elem.style.top = `${fpos}px`}
        }) 
        } catch (e) {
          console.log(e)
        }
      }
      if(playlist[position] !== undefined){
      return loadSound(playlist[position].url, promise ? promise : () => {}, () => {corrupt = true})
      } else{
        console.log('did not passed', position, playlist.length - 1, playlist)
        return undefined
      }
  }