var audio
var fft
var amplitude
var themecolor = '#ef7b28'

console.log('main.js')
document.getElementById('stroke').style.width = window.innerWidth/4 + 'px'
document.getElementById('stroke').style.height = window.innerWidth/4 + 'px'

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

var particlesArray = []

class DustParticles{
    constructor(velvector){
        this.pos = p5.Vector.random2D().mult(window.innerWidth/10);
        this.vel = velvector
        this.acc = this.pos.copy().mult(getRandom(0.0001, 0.00001));
        this.w = getRandom(1, 5);
    }

    update(multiplier){
        //console.log(this.acc, this.vel, this.pos)
        this.vel.add(this.acc);
        //console.log(multiplier)
        if(multiplier){
            for(var i = 0; i<multiplier; i++){
            this.pos.add(this.vel);}}
        else{
            this.pos.add(this.vel)
        }
    }

    edges(){
        if(this.pos.x < -window.innerWidth || this.pos.x > window.innerWidth || this.pos.y < -window.innerHeight || this.pos.y > window.innerHeight){
            return true
        } else {
            return false
        }
    }

    show(){
        noStroke();
        fill(themecolor)
        ellipse(this.pos.x, this.pos.y, this.w);
    }
}

function setup(){
    audio = loadSound('./[SOLD] Jok_Air - _Rain_ _ SAD I Free Type Beat I Trap Instrumental.mp3', loaded)
    console.log(audio)
    angleMode(DEGREES)
    amplitude = new p5.Amplitude();
    fft = new p5.FFT()
}

function loaded(){
    //console.log('loaded')

    document.querySelector('body').addEventListener('click', function(){
        //console.log('clicked')  
        if(audio.isPlaying()){
            audio.pause()}
        else audio.play()
    })
}

var prevwidth
var vol

document.getElementById('stroke').style.transition = 'box-shadow 0.5s ease-out'

function draw(){
    if(prevwidth != window.innerWidth){
    createCanvas(window.innerWidth, window.innerHeight)
    //document.getElementById('stroke').style.transform = 'translate(-50%, -50%)'
    var strokelem = document.getElementById('stroke')
    strokelem.style.left = window.innerWidth/2 + 'px'
    strokelem.style.top = window.innerHeight/2 + 'px'
    strokelem.style.marginLeft = -(float(strokelem.style.width) || 0 + float(strokelem.style.padding) || 0 + float(strokelem.style.borderWidth) || 0)/1.95 + 'px'
    strokelem.style.marginTop = -(float(strokelem.style.height) || 0 + float(strokelem.style.padding) || 0 + float(strokelem.style.borderWidth) || 0)/1.95 + 'px'
    console.log(strokelem.style.width, strokelem.style.height, strokelem.style.padding, strokelem.style.borderWidth, strokelem.style.marginLeft, strokelem.style.marginTop)
    prevwidth = window.innerWidth}
    //console.log('draw')
    background(0)
    stroke(themecolor)
    strokeWeight(10)
    translate(width/2, height/2)
    rotate(90)
    frameRate(144)
    fft.analyze()
    var wave = fft.waveform()
    
    for(var t = -1; t <= 1; t += 2){
        beginShape()
        for(var i = 0; i < 180; i += 0.2){
            var index = floor(map(i, 0, 300, 0, wave.length - 1))

            var r = map(wave[index] * 3, -1, 1, 153, window.innerWidth/10)
            var x = r * cos(i)
            var y = r * sin(i) * t
            vertex(x, y)
        }
        endShape()
    }

    var p = new DustParticles(createVector(0, 0))
    particlesArray.push(p)
    vol = amplitude.getLevel() * 20
    if(!audio.isPlaying()){vol = 0} 
    //console.log(vol)
    document.querySelector('body').style.transform = 'scale(' + (vol/25 + 1) + ')'
    //console.log(vol)
    if(vol > 1.5){
        document.getElementById('stroke').style.boxShadow = '0 0 50px #ef7b28'
    }
    if(vol > 3){
        document.getElementById('stroke').style.boxShadow = '0 0 50px #ff2c2c'
    } else{
        document.getElementById('stroke').style.boxShadow = '0 0 50px #ccc'
    }
    if(vol > 3.85){
        if(vol > 8){
            console.log('lvl2')
            document.getElementById('stroke').style.animation = 'shakelvl2 0.1s infinite running'
        } else {
            console.log('lvl1'); 
            document.getElementById('stroke').style.animation = 'shake 0.2s infinite running'}
    }
    else{
        document.getElementById('stroke').style.animation = 'none'
    }
    for(var i = 0; i < particlesArray.length; i++){
        if(!particlesArray[i].edges()){
            particlesArray[i].update(Math.ceil(vol*2))
            particlesArray[i].show()}
        else{
            //console.log('removed')
            particlesArray.splice(i, 1)
        }
    }
    //console.log(particlesArray.length)
}