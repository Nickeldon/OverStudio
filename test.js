const fs = require('fs')
const YoutubeParser = require('youtube-sr').default

console.log((YoutubeParser.search))

var title = "Black Lily Princess"
var data = []
var idata = []
if(title){
    YoutubeParser.search(
        title,
        {limit: 10, safeSearch: true, type: 'video', sort: 'relevant', category: 'music', filter: 'music'})
    .then((response) => {
        //console.log(response)
        response.forEach((video) => {
            idata.push({
                title: video.title,
                url: video.url,
                thumbnail: video.thumbnail.url,
                duration: video.durationFormatted,
                views: video.views,
                uploadedAt: video.uploadedAt,
                verified: video.channel.verified,
            })
    })
    // Sort idata array by view count
    idata.sort((a, b) => b.views - a.views);
    //console.log(idata)
    for(let i = 0; i < idata.length; i++){
        if(idata[i].uploadedAt === undefined && idata[i].verified || data.length == 0){
            data.push({
                title: idata[i].title,
                url: idata[i].url,
                thumbnail: idata[i].thumbnail,
                duration: idata[i].durationFormatted,
                views: idata[i].views,
                uploadedAt: idata[i].uploadedAt,
        })}   
    }
        console.log(data)
        //console.log(data[highindex])
    })
    .catch((e) => {
        console.log(e)
    })
}