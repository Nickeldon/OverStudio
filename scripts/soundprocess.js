let volumeSlider,
  playpausebtn,
  refresh,
  playlist,
  refralt,
  volbtn,
  eqbands,
  vol,
  amp,
  diffpos,
  pos,
  value;
var unlockkey = false;
var prevnul,
  started = false;
let isPlaying,
  release = true;
var follow = true;
var holdPL = false;
var timemode = "normal";
var startloaddate = Date.now();
var PlayBackMode = "linear";
var state = "paused";
var PrevSpeed = BGspeed;
var plpos = 0;

let audio = null;

let next, prev;
let trackinplaylist;
var amplitude;
let poshistory = [];
let ShuffleSmartEnabled = false;
let enableMediaSessionListener = false;
let enableVolumeButtons = false;

// p5.js AudioVisualizer global variables
var fft;
var particlesArray = [];
var themecolor = "#3773ff";
var prevwidth, prevheight;

// p5.js Equalizer global variables
var customBands = JSON.parse(localStorage.getItem("customBands")) || {
  custom1: [0, 0, 0, 0, 0, 0, 0, 0],
  custom2: [0, 0, 0, 0, 0, 0, 0, 0],
  custom3: [0, 0, 0, 0, 0, 0, 0, 0],
  bass: [6, 4, 2, 0, -2, -4, -6, -8],
  muffledbass: [12, 1, -12, -12, -12, -12, -12, -12],
  treble: [-2, -4, -6, -8, 6, 4, 2, 0],
  vocal: [4, 2, 0, -2, 4, 6, 8, 10],
  rock: [6, 4, 2, 0, -2, 0, 4, 8],
  pop: [4, 2, 0, -4, 4, 6, 8, 10],
  jazz: [2, 0, -2, 0, 4, 2, 0, 4],
  classical: [0, 0, 0, 0, 2, 0, 0, 2],
  metal: [8, 6, 4, 0, -2, -4, 4, 8],
  flat: [0, 0, 0, 0, 0, 0, 0, 0],
};
var selectedCustom = localStorage.getItem("eq-save") || "flat";
localStorage.setItem("customBands", JSON.stringify(customBands));
localStorage.setItem("eq-save", selectedCustom);
var eq = new p5.EQ(8);

var refreshbuttons = [];
let imageMetadata = [];
var audioreact = document.getElementById("Blob-Reactor-Obj");
var rs = getComputedStyle(audioreact);
var timeoutplaypause = Date.now();

document.getElementById("timeslide").style.transition =
  "background-size 0.2s ease-out";

try {
  eqbands = localStorage.getItem("eq").split(",") || [0, 0, 0, 0, 0, 0, 0, 0];
} catch (e) {
  eqbands = [0, 0, 0, 0, 0, 0, 0, 0];
}
if (selectedCustom) {
  document.getElementsByClassName("eq-range").forEach((range, index) => {
    //console.log(selectedCustom)
    document.getElementsByClassName("eq-range")[index].value =
      customBands[selectedCustom][index];
  });
  try {
    document.getElementById(`eq-${selectedCustom}`).style.backgroundColor =
      "rgba(139, 139, 139, 0.686)";
    document.getElementById(`eq-${selectedCustom}`).style.color = "white";
    document.getElementById(`eq-${selectedCustom}`).style.filter = "invert(0%)";
  } catch (e) {
    console.log(e);
  }
}

eqbands = [];
document.getElementsByClassName("eq-range").forEach((range) => {
  eqbands.push(range.value);
});
for (let i = 0; i < eqbands.length; i++) {
  value = parseInt(eqbands[i]);
  try {
    eq.bands[i].gain(value);
  } catch (e) {
    console.log(e);
    //console.log(eqbands[i])
  }
}
localStorage.setItem("eq", eqbands);

document.getElementById("play-pause").style.opacity = "0%";
document.getElementById("loading").style.opacity = "100%";

if (!localStorage.getItem("vol")) {
  vol = 10;
  localStorage.setItem("vol", 10);
} else {
  vol = localStorage.getItem("vol");
  if (Math.max(vol) === 0) {
    document.getElementById("vol-btn").src = "./Addons/icons/SVG/mute.svg";
  } else if (Math.max(vol) === 20) {
    document.getElementById("vol-btn").src = "./Addons/icons/SVG/max.svg";
  } else {
    document.getElementById("vol-btn").src = "./Addons/icons/SVG/volume.svg";
  }
}

document.getElementById("volslide").value = vol;

fetchPlaylist().then((data) => {
  if (data === "nothing") console.log("nothing");
  else {
    ManageData(data);
    playlist = data[0];
  }
});
let interval = setInterval(() => {
  if (playlist) {
    started = true;
    clearInterval(interval);
  }
}, 10);

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function setup() {
  fft = new p5.FFT();
  /*angleMode(DEGREES);
  window.onload = () =>
    createCanvas(
      window.innerWidth,
      window.innerHeight,
      document.getElementById("Audio-Visulizer-Canv")
    );
  background(0);*/
  if (started) {
    try {
      if (playlist[plpos]) {
        audio = new p5.SoundFile(playlist[plpos].url, loaded, (e) => {
          console.log("error", e);
        });
      }
    } catch (e) {
      console.log(e);
    }
    //console.log(playlist)
    plpos = 0;
  }

  try {
    //Start the p5.Amplitude module
    amplitude = new p5.Amplitude();
  } catch (e) {
    console.log(e);
    //If not, then the error is logged and the app restarts
    if (document.getElementById("opt-menu2").style.display === "block")
      localStorage.setItem("PlMenuOpened", true);
    else localStorage.setItem("PlMenuOpened", false);
    localStorage.setItem("emptyreload", true);
    window.location.reload();
  }
  //If all the required modules are loaded, then Keyboard support is set to true
  if (amplitude) noError = true;
}

/*class DustParticles {
  constructor(velvector) {
    this.pos = p5.Vector.random2D().mult(window.innerWidth / 10);
    this.vel = velvector;
    this.acc = this.pos.copy().mult(getRandom(0.0001, 0.00001));
    this.w = getRandom(1, 5);
  }

  update(multiplier) {
    //console.log(this.acc, this.vel, this.pos)
    this.vel.add(this.acc);
    //console.log(multiplier)
    if (multiplier) {
      for (var i = 0; i < multiplier; i++) {
        this.pos.add(this.vel);
      }
    } else {
      this.pos.add(this.vel);
    }
  }

  edges() {
    if (
      this.pos.x < -window.innerWidth ||
      this.pos.x > window.innerWidth ||
      this.pos.y < -window.innerHeight ||
      this.pos.y > window.innerHeight
    ) {
      return true;
    } else {
      return false;
    }
  }

  show() {
    noStroke();
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}*/

volumeSlider = document.getElementById("volslide");
volumeSlider.addEventListener("input", () => {
  localStorage.setItem("vol", volumeSlider.value);
  if (Math.max(volumeSlider.value) === 0) {
    document.getElementById("vol-btn").src = "./Addons/icons/SVG/mute.svg";
  } else if (Math.max(volumeSlider.value) === 20) {
    document.getElementById("vol-btn").src = "./Addons/icons/SVG/max.svg";
  } else {
    document.getElementById("vol-btn").src = "./Addons/icons/SVG/volume.svg";
  }
  if (audio) {
    if (audio.isLoaded()) {
      if (release) {
        audio.setVolume(volumeSlider.value / 20, 0.06, 0);
      }
    }
  }
});

document.getElementById("div-inp").addEventListener("change", () => {
  if (playlist) {
    if (playlist.length === 0) {
      prevnul = true;
    } else {
      prevnul = false;
    }
  } else {
    prevnul = true;
  }
  console.log("changed");
  addPlaylist().then((response) => {
    if (response === "AlreadyExists") {
      console.log("no change as it already exists");
    } else {
      playlist = null;
      fetchPlaylist().then((data) => {
        if (data[1].length === 0) {
          console.log("nothing");
          playlist = [];
        } else {
          ManageData(data);
          playlist = data[0];
          //console.log(playlist)
        }
      });
      let interval = setInterval(() => {
        if (playlist) {
          //console.log(playlist)
          if (playlist.length > 0) {
            //console.log('entered')
            console.log(playlist);
            imageMetadata = [];
            /*playlist.forEach((song) => {
                        if(song.title !== 'Unknown' && song.title){
                            GetYoutubeData(song.title).then((data) => {
                            imageMetadata.push(data)
                        })
                    }
                    })*/
            document.getElementById("refr-alt").click();
            clearInterval(interval);
          } else {
            clearInterval(interval);
          }
        }
      }, 10);
    }
  });
});

refreshbuttons.push(document.getElementById("refr-alt"));
refreshbuttons.push(document.getElementById("Refresh"));

let retryTimeout = 0;

refreshbuttons.forEach((refresh) => {
  refresh.addEventListener("click", () => {
    refresh.style.pointerEvents = "none";
    setTimeout(() => {
      refresh.style.pointerEvents = "all";
    }, 700);
    if (prevnul) {
      plpos = 0;
      prevnul = false;
      try {
        audio = new p5.SoundFile(
          playlist[plpos].url,
          () => {
            //document.getElementById("refr-alt").click();
            manageAudioData();
          },
          (e) => {
            throw e;
          }
        );
      } catch (e) {
        retryTimeout += 5;
        if (
          e.message !== "Cannot read properties of undefined (reading 'url')" &&
          e.message !== "Cannot read properties of null (reading '0')"
        )
          console.log(e);
        prevnul = true;
        console.error(
          `\n---------------\nFailed to get audio context. Retry in ${retryTimeout}s... \n---------------\n`
        );
        setTimeout(() => {
          document.getElementById("refr-alt").click();
        }, retryTimeout * 1000);
      }
    }
    started = false;
    ready = false;
    BGready = false;
    document.getElementById("play-pause").style.opacity = "0%";
    document.getElementById("loading").style.opacity = "100%";
    playlist = null;
    deletePLCache().then(() => {
      fetchPlaylist().then((data) => {
        if (data[0].length != 0 && data[1].length != 0) {
          ManageData(data);
          playlist = data[0];
          poshistory = [];
        }
      });
    });
    if (!SETBypassBGScan) {
      try {
        BackgroundData = FetchBackgrounds(
          document.getElementById("BG-choice-txt0").innerText
        );
      } catch (e) {
        console.log(e);
      }
    } else {
      SETBypassBGScan = false;
    }
    if (audio) {
      let interval = setInterval(() => {
        if (playlist) {
          trackinplaylist = false;
          if (playlist.length > 0 && audio) {
            playlist.forEach((song) => {
              if (song.url === audio.url) {
                trackinplaylist = true;
              }
            });
            if (!trackinplaylist) {
              console.log("not in playlist");
              plpos = 0;
              if (audio.isLoaded()) {
                if (audio.isPlaying()) state = "playing";
                audio.stop();
              }
              if (!audio) {
                audio = new p5.SoundFile(playlist[plpos].url, () => {
                  document.getElementById("refr-alt").click();
                  manageAudioData();
                  if (state === "playing") audio.play();
                });
              } else {
                audio.setPath(playlist[plpos].url, () => {
                  document.getElementById("refr-alt").click();
                  manageAudioData();
                  if (state === "playing") audio.play();
                });
              }
            }
          }
          started = true;
          if (audio.isLoaded()) {
            let verifyifload = setInterval(() => {
              if (ready) {
                plpos = MoveToCurrent(audio.url, playlist);
                poshistory = [];
                clearInterval(verifyifload);
                ready = false;
              }
            }, 10);
          }
          clearInterval(interval);
        }
      }, 10);
    }
  });
});

document.querySelectorAll(".eq-presets-choices a").forEach((presetelem) => {
  presetelem.addEventListener("click", () => {
    document.getElementById("eq-pres-ch").style.height = "0%";
    document.getElementById("draggable").style.display = "block";
    eqbands = [];
    //console.log(presetelem.id)
    switch (presetelem.id) {
      case "eq-flat":
        {
          eqbands = customBands["flat"];
          localStorage.setItem("eq-save", "flat");
        }
        break;
      case "eq-bass":
        {
          eqbands = customBands["bass"];
          localStorage.setItem("eq-save", "bass");
        }
        break;
      case "eq-muffledbass":
        {
          eqbands = customBands["muffledbass"];
          localStorage.setItem("eq-save", "muffledbass");
        }
        break;
      case "eq-treble":
        {
          eqbands = customBands["treble"];
          localStorage.setItem("eq-save", "treble");
        }
        break;
      case "eq-vocal":
        {
          eqbands = customBands["vocal"];
          localStorage.setItem("eq-save", "vocal");
        }
        break;
      case "eq-rock":
        {
          eqbands = customBands["rock"];
          localStorage.setItem("eq-save", "rock");
        }
        break;
      case "eq-pop":
        {
          eqbands = customBands["pop"];
          localStorage.setItem("eq-save", "pop");
        }
        break;
      case "eq-jazz":
        {
          eqbands = customBands["jazz"];
          localStorage.setItem("eq-save", "jazz");
        }
        break;
      case "eq-classical":
        {
          eqbands = customBands["classical"];
          localStorage.setItem("eq-save", "classical");
        }
        break;
      case "eq-metal":
        {
          eqbands = customBands["metal"];
          localStorage.setItem("eq-save", "metal");
        }
        break;
      case "eq-custom1":
        {
          eqbands = customBands["custom1"];
          localStorage.setItem("eq-save", "custom1");
          selectedCustom = "custom1";
        }
        break;
      case "eq-custom2":
        {
          eqbands = customBands["custom2"];
          localStorage.setItem("eq-save", "custom2");
          selectedCustom = "custom2";
        }
        break;
      case "eq-custom3":
        {
          eqbands = customBands["custom3"];
          localStorage.setItem("eq-save", "custom3");
          selectedCustom = "custom3";
        }
        break;
    }

    document.querySelectorAll(".eq-presets-choices a").forEach((elem) => {
      elem.style.backgroundColor = "unset";
      elem.style.color = "black";
      elem.style.filter = "invert(70%)";

      elem.onhover = () => {
        elem.style.cursor = "pointer";
        elem.style.backgroundColor = "rgba(139, 139, 139, 0.686)";
        elem.style.color = "white";
        elem.style.filter = "invert(0%)";
      };
    });

    document.getElementById(presetelem.id).style.backgroundColor =
      "rgba(139, 139, 139, 0.686)";
    document.getElementById(presetelem.id).style.color = "white";
    document.getElementById(presetelem.id).style.filter = "invert(0%)";

    document.getElementsByClassName("eq-range").forEach((range, index) => {
      document.getElementsByClassName("eq-range")[index].value = eqbands[index];
    });
    for (let i = 0; i < eqbands.length; i++) {
      value = parseInt(eqbands[i]);
      try {
        eq.bands[i].gain(value);
      } catch (e) {
        console.log(e);
        //console.log(eqbands[i])
      }
    }
    localStorage.setItem("eq", eqbands);
  });
});

document.getElementsByClassName("eq-range").forEach((range) => {
  range.addEventListener("input", () => {
    if (document.getElementById("eq-pres-ch").style.height !== "0%") {
      document.getElementById("eq-pres-ch").style.height = "0%";
      document.getElementById("draggable").style.display = "block";
    }
    eqbands = [];
    if (
      selectedCustom == "custom1" ||
      selectedCustom == "custom2" ||
      selectedCustom == "custom3"
    ) {
      customBands[selectedCustom] = [];
      document.getElementsByClassName("eq-range").forEach((range) => {
        customBands[selectedCustom].push(range.value);
      });
      localStorage.setItem("customBands", JSON.stringify(customBands));
    }
    document.getElementsByClassName("eq-range").forEach((range) => {
      eqbands.push(range.value);
    });
    //console.log(eqbands)
    for (let i = 0; i < eqbands.length; i++) {
      value = parseInt(eqbands[i]);
      try {
        eq.bands[i].gain(value);
      } catch (e) {
        console.log(e);
        //console.log(eqbands[i])
      }
    }
    localStorage.setItem("eq", eqbands);
  });
});

document
  .getElementById("current-time")
  .addEventListener(
    "click",
    () => (timemode = timemode === "normal" ? "inversed" : "normal")
  );

volbtn = document.getElementById("bg-vol");
volbtn.addEventListener("click", () => {
  if (volbtn.style.width !== "350px") {
    document.getElementById("vol-btn").style.transform =
      "scale(0.7) rotate(180deg)";
    document.getElementById("vol-btn").style.filter = "invert(10%)";
    volbtn.style.width = "350px";
    volbtn.style.backgroundColor = "gray";
  } else {
    document.getElementById("vol-btn").style.transform =
      "scale(1) rotate(180deg)";
    document.getElementById("vol-btn").style.filter = "invert(70%)";
    volbtn.style.width = "70px";
    volbtn.style.backgroundColor = "transparent";
  }
});

playpausebtn = document.getElementById("play-pause");
playpausebtn.addEventListener("click", () => {
  if (audio) {
    if (Date.now() - timeoutplaypause > 50) {
      timeoutplaypause = Date.now();
      //console.log('CLICKED PLAYPAUSE BUTTON')
      PlayPause(audio);
      //console.log(audio)
    }
  }
});

document.getElementById("shuffle").addEventListener("click", () => {
  poshistory = [];
  if (PlayBackMode === "linear") {
    PlayBackMode = "shuffle";
    document.getElementById("shuffle").style.transition = "transform 0s";
    document.getElementById("shuffle").style.transform = "rotate(0deg)";
    document.getElementById("shuffle").src = "./Addons/icons/SVG/shuffle.svg";
  } else if (PlayBackMode === "shuffle" && !ShuffleSmartEnabled) {
    PlayBackMode = "shuffle";
    ShuffleSmartEnabled = true;
    document.getElementById("shuffle").style.transition = "transform 0s";
    document.getElementById("shuffle").style.transform = "rotate(0deg)";
    document.getElementById("shuffle").src =
      "./Addons/icons/SVG/shuffleSmart.svg";
  } else if (PlayBackMode === "shuffle" && ShuffleSmartEnabled) {
    PlayBackMode = "loop";
    ShuffleSmartEnabled = false;
    document.getElementById("shuffle").style.transition = "transform 0s";
    document.getElementById("shuffle").style.transform = "rotate(0deg)";
    document.getElementById("shuffle").src = "./Addons/icons/SVG/loop.svg";
  } else {
    PlayBackMode = "linear";
    document.getElementById("shuffle").style.transition = "transform 0s";
    document.getElementById("shuffle").style.transform = "rotate(-90deg)";
    document.getElementById("shuffle").src = "./Addons/icons/SVG/linear.svg";
  }
});

navigator.mediaDevices.addEventListener("devicechange", () => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    if (audio) {
      if (audio.isPlaying()) {
        PlayPause(audio);
        devices.forEach((device) => {
          if (device.kind === "audiooutput") console.log(device);
        });
        displayERR("Device-changed");
      }
    }
  });
});

next = document.getElementById("next");
prev = document.getElementById("back");

next.addEventListener("click", () => {
  if (!holdPL) {
    if (started) {
      switch (PlayBackMode) {
        case "linear":
          {
            poshistory = [];
            if (playlist[plpos + 1] && started) {
              plpos++;
              document.getElementById("play-pause").style.opacity = "0%";
              document.getElementById("loading").style.opacity = "100%";
              if (!audio.isPlaying()) state = "paused";
              else state = "playing";
              audio.stop();
              started = false;
              ready = false;
              NextSong(audio, playlist, plpos, state, () => {
                started = true;
                ready = true;
                manageAudioData();
                audio.play();
                if (state === "paused") audio.pause();
              });
              const timeout = setTimeout(() => {
                document.getElementById(
                  "Blob-Reactor-Obj"
                ).style.transition = `all ${BGspeed}s ease-out`;
                PrevSpeed = BGspeed;
              }, 1000);
              clearTimeout(timeout);
            }
          }
          break;

        case "shuffle":
          {
            if (started) {
              let ipos;
              if (corrupt) {
                corrupt = false;
                ipos = plpos;
                plpos = 0;
                poshistory = [plpos];
              } else {
                function getRandomPos() {
                  ipos = plpos;
                  if (!poshistory[poshistory.indexOf(plpos) + 1]) {
                    while (plpos === ipos) {
                      plpos = Math.floor(Math.random() * playlist.length);
                    }
                    if (poshistory.includes(plpos)) {
                      getRandomPos();
                      return 0;
                    } else {
                      poshistory.push(plpos);
                    }
                  } else {
                    plpos = poshistory[poshistory.indexOf(plpos) + 1];
                  }
                }
                if (ShuffleSmartEnabled) getRandomPos();
                else {
                  ipos = plpos;
                  while (plpos === ipos) {
                    plpos = Math.floor(Math.random() * playlist.length);
                  }
                  poshistory = [plpos];
                }
              }

              diffpos = plpos - ipos;
              document.getElementById("play-pause").style.opacity = "0%";
              document.getElementById("loading").style.opacity = "100%";
              if (!audio.isPlaying()) state = "paused";
              else state = "playing";
              audio.stop();
              started = false;
              ready = false;
              PlayShuffleSong(audio, playlist, plpos, ipos, diffpos, () => {
                started = true;
                manageAudioData();
                audio.play();
                if (state === "paused") audio.pause();
              });
              const timeout = setTimeout(() => {
                document.getElementById(
                  "Blob-Reactor-Obj"
                ).style.transition = `all ${BGspeed}s ease-out`;
                PrevSpeed = BGspeed;
              }, 1000);
              clearTimeout(timeout);
            }
          }
          break;

        case "loop":
          {
            if (started) {
              pos = plpos;
              started = false;
              //ready = false
              if (!audio.isPlaying()) state = "paused";
              else state = "playing";
              document.getElementById("play-pause").style.opacity = "0%";
              document.getElementById("loading").style.opacity = "100%";
              audio.stop();
              audio.setPath(playlist[pos].url, () => {
                started = true;
                ready = true;
                manageAudioData();
                audio.play();
                if (state === "paused") audio.pause();
              });
            }
          }
          break;
      }
    }
  } else {
    corrupt = true;
    started = true;
    holdPL = false;
    let previousmode = PlayBackMode;
    PlayBackMode = "shuffle";
    next.click();
    PlayBackMode = previousmode;
  }
});

prev.addEventListener("click", () => {
  if (plpos > 0 && started) {
    let ipos = plpos;
    let shuffleBack = false;
    if (
      poshistory.length > 0 &&
      poshistory[poshistory.indexOf(plpos) - 1] &&
      ShuffleSmartEnabled
    ) {
      plpos = poshistory[poshistory.indexOf(plpos) - 1];
      shuffleBack = true;
    } else plpos--;

    document.getElementById("play-pause").style.opacity = "0%";
    document.getElementById("loading").style.opacity = "100%";
    if (!audio.isPlaying()) state = "paused";
    else state = "playing";
    audio.stop();
    started = false;
    PrevSong(
      audio,
      playlist,
      plpos,
      state,
      () => {
        started = true;
        manageAudioData();
        audio.play();
        if (state === "paused") {
          audio.pause();
        }
      },
      shuffleBack,
      ipos
    );
    const timeout = setTimeout(() => {
      document.getElementById(
        "Blob-Reactor-Obj"
      ).style.transition = `all ${BGspeed}s ease-out`;
      PrevSpeed = BGspeed;
    }, 1000);
    clearTimeout(timeout);
  }
});

document.getElementById("timeslide").addEventListener("input", () => {
  follow = false;
});

document.getElementById("timeslide").addEventListener("change", () => {
  if (audio.isLoaded() && release) {
    release = false;
    document.getElementById("play-pause").style.opacity = "0%";
    document.getElementById("loading").style.opacity = "100%";
    if (!audio._paused) audio.jump(document.getElementById("timeslide").value);
    else {
      audio.play();
      audio.jump(document.getElementById("timeslide").value);
      setTimeout(() => {
        audio.pause();
      }, 100);
    }
    let interval = setInterval(() => {
      if (audio.isLoaded()) {
        follow = true;
        release = true;
        started = true;
        clearInterval(interval);
      }
    }, 10);
  }
});

var endedTimeout;

function EndedListener() {
  if (!audio._paused) {
    if (plpos >= playlist.length - 1) {
      document.getElementById("Blob-Reactor-Obj").style.transition =
        "all 1s ease-out";
      document.getElementById("Blob-Reactor-Obj").style.transform = `scale(1)`;

      const timeout = setTimeout(() => {
        document.getElementById(
          "Blob-Reactor-Obj"
        ).style.transition = `all ${BGspeed}s ease-out`;
        PrevSpeed = BGspeed;
      }, 1000);

      clearTimeout(timeout);
    } else {
      if (started && audio.isLoaded() && !audio._paused && release) {
        next.click();
        document.getElementById("timeslide").value = 0;
        changeMediaButtonsState(false);
      }

      document.getElementById("Blob-Reactor-Obj").style.transition =
        "all 1s ease-out";
      document.getElementById("Blob-Reactor-Obj").style.transform = `scale(1)`;

      const timeout = setTimeout(() => {
        document.getElementById(
          "Blob-Reactor-Obj"
        ).style.transition = `all ${BGspeed}s ease-out`;
        PrevSpeed = BGspeed;
      }, 1000);
      clearTimeout(timeout);
    }
  }
}

function loaded() {
  try {
    if (started) {
      manageAudioData();
      audio.play();
      if (state === "paused") audio.pause();
    }
  } catch (e) {
    console.log("not loaded");
    console.log(e);
  }
}

function KeydownEvent(event) {
  let key;
  if (event.key.length === 1) {
    key = event.key.toLowerCase();
  } else {
    key = event.key;
  }

  if (completesplash) {
    if (document.getElementById("search-query").style.width !== "600px") {
      switch (key) {
        case "AudioVolumeUp":
          {
            if (enableVolumeButtons) {
              volumeSlider.value =
                Math.max((volumeSlider.value + volumeSlider.step) / 10) + 0.9;
              volumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
          break;

        case "AudioVolumeDown":
          {
            if (enableVolumeButtons) {
              volumeSlider.value = volumeSlider.value - volumeSlider.step;
              volumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
          break;

        case "MediaPlayPause":
          {
            if (!holdPL) {
              if (audio) {
                if (audio.isLoaded()) {
                  playpausebtn.click();
                }
              }
            } else {
              next.click();
            }
          }
          break;

        case ".":
          {
            if (audio) {
              if (audio.isLoaded()) {
                document.getElementById("timeslide").value =
                  parseInt(document.getElementById("timeslide").value) + 10;
                document
                  .getElementById("timeslide")
                  .dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
          }
          break;

        case ",":
          {
            if (audio) {
              if (audio.isLoaded()) {
                document.getElementById("timeslide").value =
                  document.getElementById("timeslide").value - 10;
                document
                  .getElementById("timeslide")
                  .dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
          }
          break;

        case "f":
          {
            resetIdleTimer();
            document.getElementById("change-state").click();
          }
          break;

        case " ":
          {
            if (getMediaButtonsState()) {
              if (!holdPL) {
                if (audio) {
                  if (audio.isLoaded()) {
                    playpausebtn.click();
                  }
                }
              } else {
                next.click();
              }
            }
          }
          break;

        case "ArrowDown":
          {
            if (getMediaButtonsState()) {
              resetIdleTimer();
              if (audio) {
                if (audio.isLoaded()) {
                  if (reversed) {
                    next.click();
                  } else {
                    prev.click();
                  }
                }
              }
            }
          }
          break;

        case "ArrowUp":
          {
            if (getMediaButtonsState()) {
              resetIdleTimer();
              if (!holdPL) {
                if (audio) {
                  if (audio.isLoaded()) {
                    if (reversed) {
                      prev.click();
                    } else {
                      next.click();
                    }
                  }
                }
              } else {
                next.click();
              }
            }
          }
          break;

        case "ArrowRight":
          {
            volumeSlider.value =
              Math.max((volumeSlider.value + volumeSlider.step) / 10) + 0.9;
            volumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
          }
          break;

        case "ArrowLeft":
          {
            volumeSlider.value = volumeSlider.value - volumeSlider.step;
            volumeSlider.dispatchEvent(new Event("input", { bubbles: true }));
          }
          break;
        case "Escape":
          {
            resetIdleTimer();
            if (document.getElementById("options").style.left !== "-380px") {
              openMENU();
            }
            if (volbtn.style.width === "350px") {
              volbtn.click();
            }
            if (document.getElementById("search-query").style.width == "600px")
              document.querySelector(".search-query i").click();

            document.getElementById("eq-menu").style.top = "-500px";
            document.getElementById("eq-menu").style.opacity = "0%";
            setTimeout(() => {
              document.getElementById("eq-menu").style.display = "none";
              document.getElementById("app-title").style.filter =
                "blur(0px) brightness(100%)";
              document.getElementById("Audio-react").style.filter =
                "blur(0px) brightness(60%)";
              document.getElementById("current-track").style.filter =
                "blur(0px) brightness(120%)";
              document.getElementById("search-query").style.filter =
                "blur(0px) brightness(100%)";
              document.getElementById("search-query").style.pointerEvents =
                "all";
            }, 1000);
          }
          break;
      }
    } else {
      if (key === "Escape") {
        resetIdleTimer();
        if (document.getElementById("options").style.left !== "-380px") {
          openMENU();
        }
        if (volbtn.style.width === "350px") {
          volbtn.click();
        }
        if (document.getElementById("search-query").style.width == "600px")
          document.querySelector(".search-query i").click();

        document.getElementById("eq-menu").style.top = "-500px";
        document.getElementById("eq-menu").style.opacity = "0%";
        setTimeout(() => {
          document.getElementById("eq-menu").style.display = "none";
          document.getElementById("app-title").style.filter =
            "blur(0px) brightness(100%)";
          document.getElementById("Audio-react").style.filter =
            "blur(0px) brightness(60%)";
          document.getElementById("current-track").style.filter =
            "blur(0px) brightness(120%)";
          document.getElementById("search-query").style.filter =
            "blur(0px) brightness(100%)";
          document.getElementById("search-query").style.pointerEvents = "all";
        }, 1000);
      }
    }
  }
}

window.addEventListener("keydown", (event) => {
  KeydownEvent(event);
});

function resetIdleTimer() {
  idle = 0;
  if (rotdeg === 0 && prevautochanged) {
    prevautochanged = false;
    changeState();
  }
}

document.getElementById(
  "Blob-Reactor-Obj"
).style.transition = `all ${BGspeed}s ease-out`;
PrevSpeed = BGspeed;
var trackinterval = setInterval(() => {
  if (audio) {
    try {
      if (audio.isLoaded()) {
        clearInterval(trackinterval);
      }
    } catch (e) {
      console.log("not loaded");
    }
  }
}, 100);

let timeslideresetTimeout
function manageAudioData() {
  clearTimeout(timeslideresetTimeout)
  clearTimeout(endedTimeout);
  if (audio) {
    if (audio.isLoaded()) {
      let temptime, totalseconds, totaltime;
      let duration = { value: audio.duration() };
      temptime = Math.max(Math.floor(duration.value % 60), 0);
      totalseconds = temptime < 10 ? "0" + temptime : temptime.toString();
      totaltime =
        Math.max(Math.floor(duration.value / 60), 0) + ":" + totalseconds;
      document.getElementById("total-time").innerHTML = totaltime;

      audio.setVolume(volumeSlider.value / 20);
      audio.connect(eq);

      try {
        document.getElementById("track-artist").innerHTML =
          playlist[plpos].artist || "Unknown";
        document.getElementById("track-name").innerHTML =
          playlist[plpos].title || "Unknown";
      } catch (e) {
        console.log(e);
        document.getElementById("track-artist").innerHTML = "Unknown";
        document.getElementById("track-name").innerHTML = "Unknown";
      }

      changeMediaButtonsState(true);
      endedTimeout = setTimeout(() => {
        if (audio.isLoaded()) {
          document.getElementById("timeslide").value = 0;
          document.getElementById("timeslide").dispatchEvent(new Event("change", { bubbles: true }));
          audio.onended(EndedListener);
        }
      }, 200);

      duration.value = null;
      delete duration.value;
    }
  }
}

function draw() {
  try {
    if (audio) {
      if (started && !holdPL) {
        let time,
          seconds,
          RemainingtimeSec,
          rmin,
          rsec,
          Remainingtime,
          strokelem;
        vol = amplitude.getLevel();

        if (audio.isLoaded()) {
          let currentT = audio.currentTime();
          let durationT = audio.duration();
          startloaddate = Date.now();
          document.getElementById("play-pause").style.opacity = "100%";
          document.getElementById("loading").style.opacity = "0%";
          time = Math.max(Math.floor(currentT % 60), 0);
          seconds = time < 10 ? "0" + time : time.toString();
          if (timemode === "normal") {
            document.getElementById("current-time").innerHTML =
              Math.max(Math.floor(currentT / 60), 0) + ":" + seconds;
          } else {
            RemainingtimeSec = durationT - currentT;
            rmin = Math.floor(RemainingtimeSec / 60);
            rsec = Math.floor(RemainingtimeSec % 60);
            Remainingtime = "-" + rmin + ":" + (rsec < 10 ? "0" : "") + rsec;

            if (Remainingtime == "-0:00") Remainingtime = "0:00";

            document.getElementById("current-time").innerHTML = Remainingtime;
          }
          document.getElementById("timeslide").max = durationT;
          document.getElementById("timeslide").style.backgroundSize = `${
            (currentT / durationT) * 100 + 1
          }% 100%`;
          if (follow) document.getElementById("timeslide").value = currentT;
          if (
            document.getElementById("Blob-Reactor-Obj").style.display ===
              "block" &&
            vol * 20 > 0.1 &&
            VisualMode === "BlobReactor"
          ) {
            if (
              document.getElementById("Blob-Reactor-Obj").style.display !==
              "block"
            ) {
              document.getElementById("Blob-Reactor-Obj").style.display =
                "block";
            }
            if (PrevSpeed !== BGspeed) {
              document.getElementById(
                "Blob-Reactor-Obj"
              ).style.transition = `all ${BGspeed}s ease-out`;
              PrevSpeed = BGspeed;
            }
            if (vol * 20 > 0.1) {
              document.getElementById(
                "Blob-Reactor-Obj"
              ).style.transform = `scale(${vol * 10})`;
            }
          }
          /*if (VisualMode == "ActiveReactor") {
            if (
              document.getElementById("Blob-Reactor-Obj").style.display !==
                "none" ||
              document.getElementById("Audio-react").style.display !== "none" ||
              document.getElementById("Audio-Visulizer").style.display !==
                "block"
            ) {
              document.getElementById("Audio-react").style.display = "none";
              document.getElementById("Blob-Reactor-Obj").style.display =
                "none";
              document.getElementById("Audio-Visulizer").style.display =
                "block";
            }
            if (
              prevwidth !== window.innerWidth ||
              prevheight !== window.innerHeight
            ) {
              strokelem = document.getElementById("stroke");
              strokelem.style.width = (window.innerWidth / 20 / 100) * 50;
              strokelem.style.height = (window.innerWidth / 20 / 100) * 50;
              strokelem.style.left = "49.77%";
              strokelem.style.top = "49.7%";
              strokelem.style.marginLeft =
                -(
                  float(strokelem.style.width) ||
                  0 + float(strokelem.style.padding) ||
                  0 + float(strokelem.style.borderWidth) ||
                  0
                ) /
                  1.95 +
                "px";
              strokelem.style.marginTop =
                -(
                  float(strokelem.style.height) ||
                  0 + float(strokelem.style.padding) ||
                  0 + float(strokelem.style.borderWidth) ||
                  0
                ) /
                  1.95 +
                "px";
              prevwidth = window.innerWidth;
              prevheight = window.innerHeight;
              createCanvas(
                1024 * 1.73,
                576 * 1.73,
                document.getElementById("Audio-Visulizer-Canv")
              );
              //document.getElementById('Audio-Visulizer-Canv').width = window.innerWidth
              //document.getElementById('Audio-Visulizer-Canv').height = window.innerHeight
              //document.getElementById('stroke').style.transform = 'translate(-50%, -50%)'
            }

            background(0);
            stroke(255);
            strokeWeight(10);
            translate(width / 2, height / 2);
            rotate(90);
            frameRate(144);
            fft.analyze();
            var wave = fft.waveform();

            for (var t = -1; t <= 1; t += 2) {
              beginShape();
              for (var i = 0; i < 180; i += 0.2) {
                var index = floor(map(i, 0, 300, 0, wave.length - 1));
                //console.log(document.getElementById('stroke').style.width)
                var r = map(
                  wave[index] * 3,
                  -1,
                  1,
                  document.getElementById("stroke").style.width,
                  window.innerWidth / 9.5
                );
                var x = r * cos(i);
                var y = r * sin(i) * t;
                vertex(x, y);
              }
              endShape();
            }

            var p = new DustParticles(createVector(0, 0));
            particlesArray.push(p);
            amp = amplitude.getLevel() * 20;
            if (!audio.isPlaying()) {
              amp = 0;
            }
            //console.log(document.getElementById('imgReact').style.transform)
            if (
              document.getElementById("imgReact").style.transition !==
              "transform 1s ease-out"
            ) {
              document.getElementById("Audio-Visulizer").style.transition =
                "transform 1s ease-out";
            }
            document.getElementById("Audio-Visulizer").style.transform =
              "scale(" + (amp / 5 + 1) + ")";

            //console.log(document.getElementById('imgReact').style.transform, amp)

            if (amp > 1.5) {
              document.getElementById("stroke").style.boxShadow =
                "0 0 50px #ef7b28";
            }
            if (amp > 3) {
              document.getElementById("stroke").style.boxShadow =
                "0 0 50px #e19118";
            } else {
              document.getElementById("stroke").style.boxShadow =
                "0 0 50px #ccc";
            }

            if (amp > 3.85) {
              if (amp > 5) {
                //console.log('lvl2')
                document.getElementById("stroke").style.animation =
                  "shakelvl2 0.1s infinite running";
              } else {
                //console.log('lvl1');
                document.getElementById("stroke").style.animation =
                  "shake 0.2s infinite running";
              }
            } else {
              document.getElementById("stroke").style.animation = "none";
            }

            for (var i = 0; i < particlesArray.length; i++) {
              if (!particlesArray[i].edges()) {
                particlesArray[i].update(Math.ceil(amp * 2));
                particlesArray[i].show();
              } else {
                //console.log('removed')
                particlesArray.splice(i, 1);
              }
            }
          }*/
          delete currentT;
          delete durationT;
          delete time;
          delete seconds;
          delete RemainingtimeSec;
          delete rmin;
          delete rsec;
          delete Remainingtime;
        }
      } else {
        if (corrupt) {
          if (audio.buffer === null || audio.duration() === 0) {
            if (corrupt) {
              //console.log(audio)
              started = true;
              displayERR("corupted-file");
              if (!goback) {
                if (plpos < playlist.length - 1) {
                  console.log("CLICKED NEXT CORRUPT");
                  next.click();
                } else {
                  if (playlist.length > 0) {
                    plpos = 0;
                    holdPL = true;

                    document.getElementById("play-pause").style.opacity =
                      "100%";
                    document.getElementById("loading").style.opacity = "0%";
                    state = "paused";
                    document.getElementById("disk").style.animationPlayState =
                      "paused";
                    document.getElementById("state-track").innerHTML = "Paused";
                    document.getElementById("play-pause").src =
                      "./Addons/icons/pause.png";
                  }
                }
              } else {
                goback = false;
                if (plpos > 0) {
                  prev.click();
                }
              }
              corrupt = false;
              console.log("There might be an error in the audio file");
            }
          }
          //startloaddate = Date.now()
        }
        if (!holdPL) {
          document.getElementById("play-pause").style.opacity = "0%";
          document.getElementById("loading").style.opacity = "100%";
        }
      }
    } else {
    }
  } catch (e) {
    console.log(e);
  }
}

let BGScanInterval = setInterval(() => {
  let difference;

  if (!playlist) {
    SETBypassBGScan = true;
    difference = Date.now() - startloaddate;
    if (difference > 2000) {
      startloaddate = Date.now();
      document.getElementById("refr-alt").click();
    }
    prevnul = true;
  } else {
    if (playlist.length === 0) {
      SETBypassBGScan = true;
      difference = Date.now() - startloaddate;
      if (difference > 2000) {
        startloaddate = Date.now();

        document.getElementById("refr-alt").click();
      }
      prevnul = true;
    } else {
      SETBypassBGScan = false;
    }
  }
  clearInterval(BGScanInterval);
}, 1000);

function ChangeBG() {
  clearTimeout(BGChangeInterval);
  BGChangeInterval = setTimeout(() => {
    if (
      BGready &&
      document.getElementById("BG-choice-txt0").innerText === "BGCustom"
    ) {
      if (BackgroundData) {
        if (BackgroundData.length > 1) {
          if (BGpos < BackgroundData.length - 1) {
            BGpos++;
          } else {
            BGpos = 0;
          }
          document.getElementById("Audio-react").style.transition = "none";
          document.getElementById("Audio-react").style.display = "block";
          document.getElementById("Audio-react").style.opacity = "100%";
          document.getElementById(
            "Audio-react"
          ).style.transition = `all 1s ease-out`;

          document.getElementById("Audio-react").style.opacity = "0%";
          setTimeout(() => {
            try {
              console.log('BG Changed')
              document.getElementById("Audio-react").data =
                BackgroundData[BGpos];
              const timeout2 = setTimeout(() => {
                document.getElementById("Audio-react").style.opacity = "100%";
                clearTimeout(interval);
                clearTimeout(timeout2);
                console.log("BG Changed");
                ChangeBG();
              }, 100);
            } catch (e) {
              console.log(e);
              document.getElementById("BG-choice-txt0").innerText =
                "BlobReactor";
              localStorage.setItem("Background-Type", "BlobReactor");
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          }, 1000);
        } else {
          clearTimeout(BGChangeInterval);
          ChangeBG();
        }
      }
    } else {
      clearTimeout(BGChangeInterval);
      ChangeBG();
    }
  }, BGrefresh);
}

setInterval(() => {
  if (BackgroundData) {
    if (BackgroundData.length == 0) {
      console.log("Trying to fetch backgrounds");
      try {
        BackgroundData = FetchBackgrounds(
          document.getElementById("BG-choice-txt0").innerText,
          true
        );
      } catch (e) {
        console.log(e);
      }
      let WaitForBG = setInterval(() => {
        if (BackgroundData) {
          clearInterval(WaitForBG);
          BGready = true;
          ChangeBG();
        }
      }, 500);

      clearInterval(WaitForBG);
    } else {
      if (!BGready) {
        BGready = true;
        ChangeBG();
      }
    }
  }
}, 2000);

navigator.mediaSession.setActionHandler("play", () => {});
navigator.mediaSession.setActionHandler("pause", () => {});
navigator.mediaSession.setActionHandler("stop", () => {});
navigator.mediaSession.setActionHandler("seekbackward", () => {});
navigator.mediaSession.setActionHandler("seekforward", () => {});
navigator.mediaSession.setActionHandler("previoustrack", () => {});
navigator.mediaSession.setActionHandler("nexttrack", () => {});

function ProcessSearch(input) {
  if (input && playlist) {
    if (playlist.length > 0) {
      let searchResults = [];
      input = input.toLowerCase();
      playlist.forEach((track) => {
        //console.log(track)

        let trackTitle = track.title;
        let trackArtist = track.artist;
        if (trackTitle && trackArtist) {
          trackTitle = trackTitle.toLowerCase();
          trackArtist = trackArtist.toLowerCase();
          if (trackTitle.includes(input) || trackArtist.includes(input)) {
            searchResults.push(track);
          }
        } else if (trackTitle) {
          trackTitle = trackTitle.toLowerCase();
          if (trackTitle.includes(input)) {
            searchResults.push(track);
          }
        }
      });
      GenerateSearchResults(searchResults);
    }
  }
}

function changeMediaButtonsState(state) {
  if (state) {
    document.getElementById("play-pause").style.pointerEvents = "all";
    document.getElementById("next").style.pointerEvents = "all";
    document.getElementById("back").style.pointerEvents = "all";
    document.getElementById("shuffle").style.pointerEvents = "all";
  } else {
    document.getElementById("play-pause").style.pointerEvents = "none";
    document.getElementById("next").style.pointerEvents = "none";
    document.getElementById("back").style.pointerEvents = "none";
    document.getElementById("shuffle").style.pointerEvents = "none";
  }
}

function getMediaButtonsState() {
  if (
    document.getElementById("play-pause").style.pointerEvents == "all" &&
    document.getElementById("next").style.pointerEvents == "all" &&
    document.getElementById("back").style.pointerEvents == "all" &&
    document.getElementById("shuffle").style.pointerEvents == "all"
  )
    return true;

  return false;
}
