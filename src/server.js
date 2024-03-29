const express = require('express')
const http = require('http')
const fs = require('fs')
const WebSocket = require('ws')
const cors = require('cors')
const app = express()
let PORT = 8000
const path = require('path')
var ppos  = 0
var URIsend
var PLpos = 0
var server
var PlaylistURL
const YoutubeParser = require('youtube-sr')
var mediaarray = []

app.use(cors())
server = app.listen(PORT, () => {
    console.log('Server is listening on port', PORT)
    const CurrentTime = new Date().toUTCString()
    fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + 'Server is listening on port' + PORT + '\n\n')
}).addListener('error', (e) => {
    console.error('there was an error', e)
    var logfile = fs.readFileSync(__dirname + '\\errorlog.txt')
    logfile += '\n' + 'There was an error' + JSON.stringify(e)
    const CurrentTime = new Date().toUTCString()
    fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')

    if(e.code === 'EADDRINUSE'){
        console.log('port in use')
        PORT++
        server.closeAllConnections()
        server.listen(PORT)
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({PORT}))
        })
        const wss = new WebSocket.Server({ server })

        wss.on('connection', (ws) => {
            ws.send(JSON.stringify({PORT}))

            ws.on('message', (mes) => {
                console.log('received response from frontend', mes)
                const CurrentTime = new Date().toUTCString()
                fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + 'Received response from frontend: ' + mes + '\n\n')
            })
        })
        process.exit(1)
    }
})

app.get('/getThumbnail', (req, res, next) => {
    var title
    try {
        title = JSON.parse(req.query.title)   
    } catch (e) {
        console.log(e)
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
        res.sendStatus(206)
        return ''
    }

    if(title){
        YoutubeParser.YouTube.search(
            title,
            {limit: 1, safeSearch: true, type: 'video', sort: 'relevance', category: 'music'})
        .then((response) => {
            const data = {
                "author": response[0].channel.name,
                "thumbnail": response[0].thumbnail.url,
            }
            //console.log(response)
            res.json(JSON.stringify(data))
        })
        .catch((e) => {
            console.log(e)
            fs.appendFileSync('\\errorlog.txt', JSON.stringify(e) + '\n\n')
        })
    } else{
        res.sendStatus(206)
        return ''
    }

})

app.get('/follow', (req, res, next) => {
    var playlist
    try {
        playlist = res.json(JSON.parse(fs.readFileSync(__dirname + '\\saved_paths.json')).meta.links)
    } catch (e) {
        res.json('Could not fetch data')
        console.error('Could not fetch data', e)
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', + '[' + CurrentTime + '] => ' + JSON.stringify(e))
    }
})

app.get('/addPL', (req, res, next) => {
    var jsonPL, savedPL
    try {
        jsonPL = fs.readFileSync(__dirname + '/saved_paths.json')
        var object = JSON.parse(jsonPL)
    } catch (e) {
        console.error('Could not fetch data', e)
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', + '[' + CurrentTime + '] => ' + '\n' + JSON.stringify(e))
        
    } 
    try {
        PlaylistURL = JSON.parse(req.query.METADATA)
    } catch (e) {
        console.error('Error while parsing', e)
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', + '[' + CurrentTime + '] => ' + '\n' + JSON.stringify(e))
    }

    //console.log(PlaylistURL, object.meta.links)

    if(PlaylistURL){
        //console.log(PlaylistURL)
        if(verifyURIIntegrity(PlaylistURL)){

            var linkarray = []
            if(object.meta.links && object.meta.links.length > 0){
                //console.log(object.meta.links, path.resolve(PlaylistURL))
                if(!verifIfExist(object.meta.links, path.resolve(PlaylistURL))){
                object.meta.links.forEach((elem) => {
                    if(path.resolve(elem) !== path.resolve(PlaylistURL)){
                        linkarray.push(elem)
                    }
                })
                linkarray.push(path.resolve(PlaylistURL))
                object.meta.links = linkarray} 
                
                else{
                    res.sendStatus(207)
                    console.log('already exists')
                    const CurrentTime = new Date().toUTCString()
                    fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + 'already exists \n')

                    return undefined
                }

                //console.log(object)
            } else{
                object.meta = {
                    "links": [
                        path.resolve('../Media'),
                        path.resolve(PlaylistURL)]
                }
                //console.log(object)
            }
            res.sendStatus(204)
        } else{
            console.log('invalid uri')
            const CurrentTime = new Date().toUTCString()
            fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + 'invalid uri \n')
            res.sendStatus(206)
            return undefined
        }
        //console.log(object.meta)
    } else{
            res.sendStatus(206)
            return undefined
    }

    try {
        fs.writeFileSync(__dirname + '\\saved_paths.json', JSON.stringify(object, null, 2))
    } catch (e) {
        console.error('Could not fetch data', e)
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', + '[' + CurrentTime + '] => ' + '\n' + JSON.stringify(e))
    }
    //console.log(object)

})

app.get('/delPath', (req, res, next) => {
    try {
        const targetpath = req.query.link
        
        const json = fs.readFileSync(__dirname + '\\saved_paths.json')
        var object = JSON.parse(json)
        //console.log(object)
        const linkarray = object.meta.links
        if(linkarray.indexOf(targetpath) !== 0){
        linkarray.splice(linkarray.indexOf(targetpath), 1)}
        else {
            linkarray.shift()
        }
        object.meta.links = linkarray
        try {
            fs.writeFileSync(__dirname + '\\saved_paths.json', JSON.stringify(object, null, 2))
        } catch (e) {
            console.log(e)
            const CurrentTime = new Date().toUTCString()
            fs.appendFileSync(__dirname + '\\errorlog.txt', + '[' + CurrentTime + '] => ' + '\n' + JSON.stringify(e))
        }
        if(linkarray.length > 0){
        res.sendStatus(201)}
        else{
            res.sendStatus(205)
        }
    } catch (e) {
        console.log(e)
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', + '[' + CurrentTime + '] => ' + + JSON.stringify(e))
        res.sendStatus(206)
    }
})

app.get('/ParseLinks', (req, res, next) => {

    console.log('received call')
    const CurrentTime = new Date().toUTCString()
    fs.appendFileSync(__dirname + '\\errorlog.txt', + '[' + CurrentTime + '] => ' + 'Received call \n')

    var jsonPL, savedPL
    try {
        jsonPL = fs.readFileSync(__dirname + '\\saved_paths.json')
        savedPL = JSON.parse(jsonPL)   
    } catch (e) {
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
        process.exit(1)
    }
    var mediaarr = []
    if(!savedPL){
        try {
            mediaarr = getMediaArray(path.resolve('../Media'))
        } catch (e) {
            console.error('Could not fetch data', e)
            const CurrentTime = new Date().toUTCString()
            fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
        }
    } else{
        try {
            console.log('passed')
            //console.log(savedPL.meta)
            if(savedPL.meta.links.length === 0){
                console.log('no links')
                const CurrentTime = new Date().toUTCString()
                fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + 'No playlist detected' + '\n\n')
            }
            else{
            savedPL.meta.links.forEach((elem) => {
                //console.log(getMediaArray(elem))
                if(getMediaArray(elem).length > 0){
                mediaarr.push(getMediaArray(elem))}
            })}
        } catch (e) {
            console.error('Could not fetch data', e)
            const CurrentTime = new Date().toUTCString()
            fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
        }
        //console.log(mediaarr)
    }

    //console.log(mediaarr)
    console.log(savedPL.meta.links.length)
    if(savedPL.meta.links.length > 0){
    var combinedArray = []
    mediaarr.forEach((elem) => {
        elem.forEach((alt) => {
            combinedArray.push(alt)
        })
    })

    mediaarr = mediaarr[1]
    
    //console.log(mediaarr)


    var finalArray = []
    var completeArray = []
    //console.log(mediaarr.length)
    //console.log(mediaarr)
    if(combinedArray.length > 1){
        //console.log('YES')
    combinedArray.forEach((elem) => {
        //console.log(elem + '\n\n')
        try {
            finalArray.push({
                "url": elem,
                "title": getMediaMeta(elem).title || undefined,
                "cover": getMediaMeta(elem).cover || undefined,
                "artist": getMediaMeta(elem).artist || undefined,
                "album": getMediaMeta(elem).album || undefined,
                "File_format": getMediaMeta(elem).fformat || 'No specified File format'
            })   
        } catch (e) {
            console.log(e)
            const CurrentTime = new Date().toUTCString()
            fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
            finalArray.push({
                "url": elem,
                "title": undefined,
                "cover":  undefined,
                "artist": undefined,
                "album": undefined,
            })   
        }
    })} else if(combinedArray.length === 1){

        try {
            finalArray.push({
                "url": combinedArray[0],
                "title": getMediaMeta(combinedArray[0]).title || undefined,
                "cover": getMediaMeta(combinedArray[0]).cover || undefined,
                "artist": getMediaMeta(combinedArray[0]).artist || undefined,
                "album": getMediaMeta(combinedArray[0]).album || undefined,
                "File_format": getMediaMeta(elem).fformat || 'No specified File format'
            })   
        } catch (e) {
            console.log(e)
            const CurrentTime = new Date().toUTCString()
            fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
            finalArray.push({
                "url": combinedArray[0],
                "title": undefined,
                "cover":  undefined,
                "artist": undefined,
                "album": undefined
            })   
        }
    }

    //console.log(finalArray)
    completeArray.push(finalArray)
    completeArray.push(savedPL.meta.links)
   // console.log(completeArray)
   const CurrentTime = new Date().toUTCString()
   fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + 'Parsed links \n')
    }
    res.json(completeArray)
})

function verifyURIIntegrity(URI){
    try {
        if(fs.existsSync(URI)) return true
        else return false
    } catch (e) {
        console.error(e)
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
        return false
    }
}

function getMediaMeta(Path){
    var title, artist, album, image, base64, fformat
    var jsmediatags = require("jsmediatags");
    //console.log(Path)

    // console.log(tag);
    let tempPath = Path
    for(let i = tempPath.length; i > 0; i--){
     //console.log(tempPath[i])
         if(tempPath[i] === '.'){
             //console.log('true')
             tempPath = tempPath.split('.')
             tempPath[1] = tempPath[1].toLowerCase()
             console.log(tempPath[1])
             if(tempPath[1] === 'mp3' || tempPath[1] === 'flac' || tempPath[1] === 'wav' || tempPath[1] === 'aac'){
                 fformat = '.' + tempPath[1]
             }else{
                 fformat = '.' + tempPath[1]
             }
             break;
         }
     }

    jsmediatags.read(Path, {
    onSuccess: function(tag) {
        title = tag.tags.title
        image = tag.tags.picture;
        artist = tag.tags.artist;
        album = tag.tags.album;

        if (image) {
            var base64String = "";
            for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i]);
            }
            base64 = "data:" + image.format + ";base64,"
        }
    },
    onError: function(error) {
        //console.log(':(', error.type, error.info);        
        const CurrentTime = new Date().toUTCString()
        if(error.info !== 'No suitable tag reader found'){
        fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(error) + '\n\n')
    }
    }
    });

    if(!title){
            //console.log('true no title')
            var cont = true
            for(let i = Path.length; i > 0 && cont; i--){
                if(Path[i] === '\\'){
                    title = Path.split('\\')[Path.split('\\').length - 1]
                    var tempcont = true
                    for(let k = title.length; k > 0 && tempcont; k--){
                        if(title[k] === '.'){
                            title = title.split('.')[0]
                            tempcont = false
                        }
                    }
                    cont = false
                }
            }
        } 
        //console.log(fformat)
    return{base64, title, artist, album, fformat}
}

function getMediaArray(Path){
    var resultArray = []
    try {
        if(fs.existsSync(Path)){
            fs.readdirSync(Path).forEach((elem) => {
                if(!fs.statSync(`${Path}\\${elem}`).isDirectory()){
                    var cont = true
                    for(let i = elem.length; i > 0 && cont; i--){
                        if(elem[i] === '.'){
                            elem = elem.split('.')
                            elem[1] = elem[1].toLowerCase()
                            if(elem[1] === 'mp3' || elem[1] === 'flac' || elem[1] === 'wav' || elem[1] === 'aac'){
                            resultArray.push(`${Path}\\${elem[0] + '.' + elem[1]}`)}
                            //console.log('resultArray')
                            cont = false
                        }
                    }
                }
            })
        }   
    } catch (e) {
        const CurrentTime = new Date().toUTCString()
        fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
 
    }

    return(resultArray)
}

function verifIfExist(base, input){
    try {
        //console.log(base.length, input)
        for(let i = 0; i < base.length; i++){
            //console.log(base[i], input)
            if(base[i] === input) return true
        }   
        return false
    } catch (e) {
        const CurrentTime = new Date().toUTCString()

        fs.appendFileSync(__dirname + '\\errorlog.txt', '[' + CurrentTime + '] => ' + JSON.stringify(e) + '\n\n')
        return true
    }
}