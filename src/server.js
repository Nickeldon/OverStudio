const express = require('express')
const http = require('http')
const fs = require('fs')
const cors = require('cors')
const app = express()
const PORT = 8000
const path = require('path')
var ppos  = 0
var URIsend
var PLpos = 0
var PlaylistURL
var mediaarray = []

app.use(cors())
app.listen(PORT, () => {
    console.log('Server is listening on port', PORT)
}).addListener('error', (e) => {
    console.error('there was an error', e)
})

app.get('/follow', (req, res, next) => {
    var playlist
    try {
        playlist = res.json(JSON.parse(fs.readFileSync(__dirname + '\\saved_paths.json')).meta.links)
    } catch (e) {
        res.json('Could not fetch data')
        console.error('Could not fetch data', e)
    }
})

app.get('/addPL', (req, res, next) => {
    const jsonPL = fs.readFileSync(__dirname + '/saved_paths.json')
    var object = JSON.parse(jsonPL)
    try {
        PlaylistURL = JSON.parse(req.query.METADATA)
    } catch (e) {
        console.error('Error while parsing', e)
    }

    if(PlaylistURL){
        //console.log(PlaylistURL)
        if(verifyURIIntegrity(PlaylistURL)){

            var linkarray = []
            if(object.meta.links && object.meta.links.length > 0){
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
            res.sendStatus(206)
            return undefined
        }
        //console.log(object.meta)
    } else{
            res.sendStatus(206)
            return undefined
    }

    try {
        fs.writeFileSync('./src/saved_paths.json', JSON.stringify(object, null, 2))
    } catch (e) {
        console.error('Could not fetch data', e)
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
        linkarray.splice(0, linkarray.indexOf(targetpath))}
        else {
            linkarray.shift()
        }
        object.meta.links = linkarray
        //console.log(object)

        try {
            fs.writeFileSync(__dirname + '\\saved_paths.json', JSON.stringify(object, null, 2))
        } catch (e) {
            console.log(e)
        }
        if(linkarray.length > 0){
        res.sendStatus(201)}
        else{
            res.sendStatus(205)
        }
    } catch (e) {
        console.log(e)
        res.sendStatus(206)
    }
})

app.get('/ParseLinks', (req, res, next) => {

    console.log('received call')

    const jsonPL = fs.readFileSync('./src/saved_paths.json')
    const savedPL = JSON.parse(jsonPL)
    var mediaarr = []
    if(!savedPL){
        try {
            mediaarr = getMediaArray(path.resolve('../Media'))
        } catch (e) {
            console.error('Could not fetch data', e)
        }
    } else{
        try {
            console.log('passed')
            savedPL.meta.links.forEach((elem) => {
                //console.log(getMediaArray(elem))
                if(getMediaArray(elem).length > 0){
                mediaarr.push(getMediaArray(elem))}
            })
        } catch (e) {
            console.error('Could not fetch data', e)
        }
        //console.log(mediaarr)
    }

    //console.log(mediaarr)
    //console.log(savedPL)
    //console.log(mediaarr)
    var combinedArray = []
    mediaarr.forEach((elem) => {
        elem.forEach((alt) => {
            combinedArray.push(alt)
        })
    })

    mediaarr = mediaarr[1]
    
    console.log(mediaarr)

    var finalArray = []

    //console.log(mediaarr.length)
    //console.log(mediaarr)
    if(combinedArray.length > 1){
    combinedArray.forEach((elem) => {
        //console.log(elem + '\n\n')
        try {
            finalArray.push({
                "url": elem,
                "title": getMediaMeta(elem).title || undefined,
                "cover": getMediaMeta(elem).cover || undefined,
                "artist": getMediaMeta(elem).artist || undefined,
                "album": getMediaMeta(elem).album || undefined
            })   
        } catch (e) {
            finalArray.push({
                "url": elem,
                "title": undefined,
                "cover":  undefined,
                "artist": undefined,
                "album": undefined
            })   
        }
    })} else if(combinedArray.length === 1){

        try {
            finalArray.push({
                "url": combinedArray[0],
                "title": getMediaMeta(combinedArray[0]).title || undefined,
                "cover": getMediaMeta(combinedArray[0]).cover || undefined,
                "artist": getMediaMeta(combinedArray[0]).artist || undefined,
                "album": getMediaMeta(combinedArray[0]).album || undefined
            })   
        } catch (e) {
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
    const completeArray = []
    completeArray.push(finalArray)
    completeArray.push(savedPL.meta.links)
   // console.log(completeArray)
    res.json(completeArray)
})

function verifyURIIntegrity(URI){
    try {
        if(fs.existsSync(URI)) return true
        else return false
    } catch (e) {
        console.error(e)
        return false
    }
}

function getMediaMeta(Path){
    var title, artist, album, image, base64
    var jsmediatags = require("jsmediatags");

    jsmediatags.read(Path, {
    onSuccess: function(tag) {
       // console.log(tag);
        
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
    }
    });

    if(!title){
            //console.log('true')
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

    return{base64, title, artist, album}
}

function getMediaArray(Path){
    var resultArray = []
    if(fs.existsSync(Path)){
        fs.readdirSync(Path).forEach((elem) => {
            if(!fs.statSync(`${Path}\\${elem}`).isDirectory()){
                var cont = true
                for(let i = elem.length; i > 0 && cont; i--){
                    if(elem[i] === '.'){
                        elem = elem.split('.')
                        if(elem[1] === 'mp3' || elem[1] === 'flac' || elem[1] === 'wav' || elem[1] === 'aac'){
                        resultArray.push(`${Path}\\${elem[0] + '.' + elem[1]}`)}
                        cont = false
                    }
                }
            }
        })
    }


    return(resultArray)
}

function verifIfExist(base, input){
    try {
        for(let i = base.length; i > 0; i--){
            if(base[i] === input) return true
        }   
        return false
    } catch (e) {
        return true
    }
}