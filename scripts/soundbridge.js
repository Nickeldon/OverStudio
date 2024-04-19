reversed = parent.reversed

const parentTarget = parent.document

function NextSong(playlist, position, state, promise){
    if(!reversed){
    parentTarget.getElementById('current-track').childNodes.forEach((elem) => {
      let toppos = parentTarget.getElementById('current-track').childNodes[parentTarget.getElementById('current-track').childNodes.length - 1].style.top
      if(elem.id === 'child-track' && parseInt(toppos.replace('px', '')) < 280){
        let ipos = elem.style.top 
        let fpos = parseInt(ipos.replace('px', '')) + 150
        elem.style.top = `${fpos}px`}
    })}
    else{
      try {
        let bottompos = parentTarget.getElementById('current-track').childNodes[parentTarget.getElementById('current-track').childNodes.length - 1].style.top
        parentTarget.getElementById('current-track').childNodes.forEach((elem) => {
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
      let bottompos = parentTarget.getElementById('current-track').childNodes[3].style.top
      parentTarget.getElementById('current-track').childNodes.forEach((elem) => {
        if(elem.id === 'child-track' && parseInt(bottompos.replace('px', '')) > 280){
          let ipos = elem.style.top 
          let fpos = parseInt(ipos.replace('px', '')) - 150
          elem.style.top = `${fpos}px`}
    })}else{
        let toppos = parentTarget.getElementById('current-track').childNodes[3].style.top
        parentTarget.getElementById('current-track').childNodes.forEach((elem) => {
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
    let btn = parentTarget.getElementById('play-pause')
    if(audio){
    if(!audio.isPlaying()){
      parentTarget.getElementById('state-track').innerHTML = 'Now Playing'
      parentTarget.getElementById('disk').style.animationPlayState = 'running'
      btn.src = './Addons/icons/play.png'
      audio.play()
    } else{
      parentTarget.getElementById('disk').style.animationPlayState = 'paused'
      parentTarget.getElementById('state-track').innerHTML = 'Paused'
      btn.src = './Addons/icons/pause.png'
      audio.pause()
    }}
    else{
      if(state === 'paused'){
        parentTarget.getElementById('state-track').innerHTML = 'Now Playing'
        parentTarget.getElementById('disk').style.animationPlayState = 'running'
        btn.src = './Addons/icons/play.png'
        //audio.play()
      } else{
        parentTarget.getElementById('disk').style.animationPlayState = 'paused'
        parentTarget.getElementById('state-track').innerHTML = 'Paused'
        btn.src = './Addons/icons/pause.png'
        //audio.pause()
      }
    }
  }
  
  function MoveToCurrent(url, playlist){
    let array = parentTarget.getElementById('current-track').childNodes
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
      parentTarget.getElementById('current-track').childNodes.forEach((elem) => {
        if(elem.id === 'child-track'){
        let ipos = elem.style.top 
        let fpos = parseInt(ipos.replace('px', '')) + (150*(difference))
        elem.style.top = `${fpos}px`}
      })}
      else{
        try {
          parentTarget.getElementById('current-track').childNodes.forEach((elem) => {
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