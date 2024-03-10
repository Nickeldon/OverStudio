var theme = localStorage.getItem('theme')|| 'default';
localStorage.setItem('theme', theme);

const themes = {
    default: {
        backgroundImage: 'linear-gradient(rgba(55, 235, 169, 0.85), #5b37eb)',
        text: 'linear-gradient(to right, rgb(255, 255, 255), #73aafa, #7ed1fb, #86ecfc)'},
    dark: {
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.881), #545454)',
        text: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.2))'},
    orangeRed:{
        backgroundImage: 'linear-gradient(rgba(235, 181, 55, 0.85), #eb3737)',
        text: 'linear-gradient(to right, rgb(255, 255, 255), #ff8e8e, #e83f3f, #f8892e)'},
    pinkPurple:{
        backgroundImage: 'linear-gradient(rgba(166, 55, 235, 0.85), #eb37c9)',
        text: 'linear-gradient(to right, rgb(255, 255, 255), #fa73ef, #cd7efb, #2b1f9c)'},
    }
function changeTheme(theme){
    console.log(document.querySelectorAll('input'))
    document.getElementById('gradient').style.backgroundImage = themes[theme].backgroundImage
    document.querySelector('.nav-bar h1').style.background = themes[theme].text
    document.querySelector('.nav-bar h1').style.webkitBackgroundClip = 'text'
    document.getElementById('timeslide').style.backgroundImage = themes[theme].text
    document.getElementById('timeslide').style.setProperty('--bgthumb', themes[theme].backgroundImage)
}

changeTheme(theme);