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
var initInst = 0;
var unlockkey = false;
var prevnul,
  rand,
  started = false;
let isPlaying,
  release = true;
var follow = true;
var holdPL = false;
var timemode = "normal";
var startloaddate = Date.now();
var PlayBackMode = "linear";
var state = "paused";
var SETBypassBGScan = false;
var PrevSpeed = parent.BGspeed;
var plpos = 0;
var audio;
let next, prev;
let trackinplaylist;
var amplitude;

// p5.js AudioVisualizer global variables
var fft;
var particlesArray = [];
var themecolor = "#3773ff";
var prevwidth, prevheight;

// p5.js Equalizer global variables
var customBands = JSON.parse(ParentLocalStorage.getItem("customBands")) || {
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
var selectedCustom = ParentLocalStorage.getItem("eq-save") || "flat";
ParentLocalStorage.setItem("customBands", JSON.stringify(customBands));
ParentLocalStorage.setItem("eq-save", selectedCustom);
var eq = new p5.EQ(8);

var refreshbuttons = [];
let imageMetadata = [];
var audioreact = parentDocument.getElementById("Blob-Reactor-Obj");
var rs = getComputedStyle(audioreact);
var timeoutplaypause = Date.now();

parentDocument.getElementById("timeslide").style.transition =
  "background-size 0.2s ease-out";

try {
  eqbands = ParentLocalStorage.getItem("eq").split(",") || [
    0, 0, 0, 0, 0, 0, 0, 0,
  ];
} catch (e) {
  eqbands = [0, 0, 0, 0, 0, 0, 0, 0];
}
if (selectedCustom) {
  parentDocument.getElementsByClassName("eq-range").forEach((range, index) => {
    //console.log(selectedCustom)
    parentDocument.getElementsByClassName("eq-range")[index].value =
      customBands[selectedCustom][index];
  });
  try {
    parentDocument.getElementById(
      `eq-${selectedCustom}`
    ).style.backgroundColor = "rgba(139, 139, 139, 0.686)";
    parentDocument.getElementById(`eq-${selectedCustom}`).style.color = "white";
    parentDocument.getElementById(`eq-${selectedCustom}`).style.filter =
      "invert(0%)";
  } catch (e) {
    console.log(e);
  }
}

eqbands = [];
parentDocument.getElementsByClassName("eq-range").forEach((range) => {
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
ParentLocalStorage.setItem("eq", eqbands);

parentDocument.getElementById("play-pause").style.opacity = "0%";
parentDocument.getElementById("loading").style.opacity = "100%";

if (!ParentLocalStorage.getItem("vol")) {
  vol = 10;
  ParentLocalStorage.setItem("vol", 10);
} else {
  vol = ParentLocalStorage.getItem("vol");
  if (Math.max(vol) === 0) {
    parentDocument.getElementById("vol-btn").src =
      "./Addons/icons/SVG/mute.svg";
  } else if (Math.max(vol) === 20) {
    parentDocument.getElementById("vol-btn").src = "./Addons/icons/SVG/max.svg";
  } else {
    parentDocument.getElementById("vol-btn").src =
      "./Addons/icons/SVG/volume.svg";
  }
}

parentDocument.getElementById("volslide").value = vol;

parent.fetchPlaylist().then((data) => {
  if (data === "nothing") console.log("nothing");
  else {
    parent.ManageData(data);
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
  /*fft = new p5.FFT();
  angleMode(DEGREES);
  window.onload = () =>
    createCanvas(
      window.innerWidth,
      window.innerHeight,
      parentDocument.getElementById("Audio-Visulizer-Canv")
    );
  background(0);*/
  if (started) {
    try {
      if (playlist[plpos]) {
        audio = loadSound(playlist[plpos].url, loaded);
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
    if (parentDocument.getElementById("opt-menu2").style.display === "block")
      ParentLocalStorage.setItem("PlMenuOpened", true);
    else ParentLocalStorage.setItem("PlMenuOpened", false);
    ParentLocalStorage.setItem("emptyreload", true);
    parent.window.location.reload();
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

volumeSlider = parentDocument.getElementById("volslide");
volumeSlider.addEventListener("input", () => {
  ParentLocalStorage.setItem("vol", volumeSlider.value);
  if (Math.max(volumeSlider.value) === 0) {
    parentDocument.getElementById("vol-btn").src =
      "./Addons/icons/SVG/mute.svg";
  } else if (Math.max(volumeSlider.value) === 20) {
    parentDocument.getElementById("vol-btn").src = "./Addons/icons/SVG/max.svg";
  } else {
    parentDocument.getElementById("vol-btn").src =
      "./Addons/icons/SVG/volume.svg";
  }
  if (audio) {
    if (audio.isLoaded()) {
      if (release) {
        audio.setVolume(volumeSlider.value / 20, 0.06, 0);
      }
    }
  }
});

parentDocument.getElementById("div-inp").addEventListener("change", () => {
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
  parent.addPlaylist().then((response) => {
    if (response === "AlreadyExists") {
      console.log("no change as it already exists");
    } else {
      playlist = null;
      parent.fetchPlaylist().then((data) => {
        if (data[1].length === 0) {
          console.log("nothing");
          playlist = [];
        } else {
          parent.ManageData(data);
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
            parentDocument.getElementById("refr-alt").click();
            clearInterval(interval);
          } else {
            clearInterval(interval);
          }
        }
      }, 10);
    }
  });
});

refreshbuttons.push(parentDocument.getElementById("refr-alt"));
refreshbuttons.push(parentDocument.getElementById("Refresh"));

refreshbuttons.forEach((refresh) => {
  /*refresh.addEventListener("click", () => {
    refresh.style.pointerEvents = "none";
    setTimeout(() => {
      refresh.style.pointerEvents = "all";
    }, 700);
    if (prevnul) {
      console.log("yes, it was");
      plpos = 0;
      prevnul = false;
      //console.log(playlist)
      try {
        audio = loadSound(playlist[plpos].url, loaded);
      } catch (e) {
        if (
          e.message !== "Cannot read properties of undefined (reading 'url')" &&
          e.message !== "Cannot read properties of null (reading '0')"
        )
          console.log(e);
        prevnul = true;
      }
    }
    started = false;
    parent.ready = false;
    BGready = false;
    parentDocument.getElementById("play-pause").style.opacity = "0%";
    parentDocument.getElementById("loading").style.opacity = "100%";
    playlist = null;
    parent.deletePLCache().then(() => {
      parent.fetchPlaylist().then((data) => {
        if (data[0].length === 0 && data[1].length === 0) {
          //console.log('nothing')
        } else {
          //console.log(data[0])
          //console.log('refreshed')
          parent.ManageData(data);
          playlist = data[0];
        }
      });
    });
    if (!SETBypassBGScan) {
      try {
        BackgroundData = parent.FetchBackgrounds(
          parentDocument.getElementById("BG-choice-txt0").innerText
        );
      } catch (e) {
        console.log(e);
      }
      let WaitForBG = setInterval(() => {
        if (BackgroundData) {
          clearInterval(WaitForBG);
          BGready = true;
        }
      }, 500);
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
              if (audio.isLoaded()) audio.stop();
              audio = loadSound(playlist[plpos].url, loaded);
              let interval2 = setInterval(() => {
                if (audio.isLoaded()) {
                  parentDocument.getElementById("refr-alt").click();
                  clearInterval(interval2);
                  manageAudioData();
                  audio.play();
                }
              }, 10);
            }
          }
          //console.log(playlist)
          started = true;
          if (audio.isLoaded()) {
            let verifyifload = setInterval(() => {
              console.log(parent.ready);
              if (parent.ready) {
                console.log("parent.ready");
                plpos = MoveToCurrent(audio.url, playlist);
                //console.log('playlist fetched')
                clearInterval(verifyifload);
                parent.ready = false;
              }
            }, 10);
          }
          clearInterval(interval);
        }
      }, 10);
    }
  });*/
});

parentDocument
  .querySelectorAll(".eq-presets-choices a")
  .forEach((presetelem) => {
    presetelem.addEventListener("click", () => {
      parentDocument.getElementById("eq-pres-ch").style.height = "0%";
      parentDocument.getElementById("draggable").style.display = "block";
      eqbands = [];
      //console.log(presetelem.id)
      switch (presetelem.id) {
        case "eq-flat":
          {
            eqbands = customBands["flat"];
            ParentLocalStorage.setItem("eq-save", "flat");
          }
          break;
        case "eq-bass":
          {
            eqbands = customBands["bass"];
            ParentLocalStorage.setItem("eq-save", "bass");
          }
          break;
        case "eq-muffledbass":
          {
            eqbands = customBands["muffledbass"];
            ParentLocalStorage.setItem("eq-save", "muffledbass");
          }
          break;
        case "eq-treble":
          {
            eqbands = customBands["treble"];
            ParentLocalStorage.setItem("eq-save", "treble");
          }
          break;
        case "eq-vocal":
          {
            eqbands = customBands["vocal"];
            ParentLocalStorage.setItem("eq-save", "vocal");
          }
          break;
        case "eq-rock":
          {
            eqbands = customBands["rock"];
            ParentLocalStorage.setItem("eq-save", "rock");
          }
          break;
        case "eq-pop":
          {
            eqbands = customBands["pop"];
            ParentLocalStorage.setItem("eq-save", "pop");
          }
          break;
        case "eq-jazz":
          {
            eqbands = customBands["jazz"];
            ParentLocalStorage.setItem("eq-save", "jazz");
          }
          break;
        case "eq-classical":
          {
            eqbands = customBands["classical"];
            ParentLocalStorage.setItem("eq-save", "classical");
          }
          break;
        case "eq-metal":
          {
            eqbands = customBands["metal"];
            ParentLocalStorage.setItem("eq-save", "metal");
          }
          break;
        case "eq-custom1":
          {
            eqbands = customBands["custom1"];
            ParentLocalStorage.setItem("eq-save", "custom1");
            selectedCustom = "custom1";
          }
          break;
        case "eq-custom2":
          {
            eqbands = customBands["custom2"];
            ParentLocalStorage.setItem("eq-save", "custom2");
            selectedCustom = "custom2";
          }
          break;
        case "eq-custom3":
          {
            eqbands = customBands["custom3"];
            ParentLocalStorage.setItem("eq-save", "custom3");
            selectedCustom = "custom3";
          }
          break;
      }

      parentDocument
        .querySelectorAll(".eq-presets-choices a")
        .forEach((elem) => {
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

      parentDocument.getElementById(presetelem.id).style.backgroundColor =
        "rgba(139, 139, 139, 0.686)";
      parentDocument.getElementById(presetelem.id).style.color = "white";
      parentDocument.getElementById(presetelem.id).style.filter = "invert(0%)";

      parentDocument
        .getElementsByClassName("eq-range")
        .forEach((range, index) => {
          parentDocument.getElementsByClassName("eq-range")[index].value =
            eqbands[index];
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
      ParentLocalStorage.setItem("eq", eqbands);
    });
  });

parentDocument.getElementsByClassName("eq-range").forEach((range) => {
  range.addEventListener("input", () => {
    if (parentDocument.getElementById("eq-pres-ch").style.height !== "0%") {
      parentDocument.getElementById("eq-pres-ch").style.height = "0%";
      parentDocument.getElementById("draggable").style.display = "block";
    }
    eqbands = [];
    if (
      selectedCustom == "custom1" ||
      selectedCustom == "custom2" ||
      selectedCustom == "custom3"
    ) {
      customBands[selectedCustom] = [];
      parentDocument.getElementsByClassName("eq-range").forEach((range) => {
        customBands[selectedCustom].push(range.value);
      });
      ParentLocalStorage.setItem("customBands", JSON.stringify(customBands));
    }
    parentDocument.getElementsByClassName("eq-range").forEach((range) => {
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
    ParentLocalStorage.setItem("eq", eqbands);
  });
});

parentDocument
  .getElementById("current-time")
  .addEventListener(
    "click",
    () => (timemode = timemode === "normal" ? "inversed" : "normal")
  );

volbtn = parentDocument.getElementById("bg-vol");
volbtn.addEventListener("click", () => {
  if (volbtn.style.width !== "350px") {
    parentDocument.getElementById("vol-btn").style.transform =
      "scale(0.7) rotate(180deg)";
    parentDocument.getElementById("vol-btn").style.filter = "invert(10%)";
    volbtn.style.width = "350px";
    volbtn.style.backgroundColor = "gray";
  } else {
    parentDocument.getElementById("vol-btn").style.transform =
      "scale(1) rotate(180deg)";
    parentDocument.getElementById("vol-btn").style.filter = "invert(70%)";
    volbtn.style.width = "70px";
    volbtn.style.backgroundColor = "transparent";
  }
});

playpausebtn = parentDocument.getElementById("play-pause");
playpausebtn.addEventListener("click", () => {
  if (audio) {
    if (Date.now() - timeoutplaypause > 50) {
      timeoutplaypause = Date.now();
      PlayPause(audio);
      //console.log(audio)
    }
  }
});

parentDocument.getElementById("shuffle").addEventListener("click", () => {
  if (PlayBackMode === "linear") {
    PlayBackMode = "shuffle";
    parentDocument.getElementById("shuffle").style.transition = "transform 0s";
    parentDocument.getElementById("shuffle").style.transform = "rotate(0deg)";
    parentDocument.getElementById("shuffle").src =
      "./Addons/icons/SVG/shuffle.svg";
  } else if (PlayBackMode === "shuffle") {
    PlayBackMode = "loop";
    parentDocument.getElementById("shuffle").style.transition = "transform 0s";
    parentDocument.getElementById("shuffle").style.transform = "rotate(0deg)";
    parentDocument.getElementById("shuffle").src =
      "./Addons/icons/SVG/loop.svg";
  } else {
    PlayBackMode = "linear";
    parentDocument.getElementById("shuffle").style.transition = "transform 0s";
    parentDocument.getElementById("shuffle").style.transform = "rotate(-90deg)";
    parentDocument.getElementById("shuffle").src =
      "./Addons/icons/SVG/linear.svg";
  }

  if (rand) {
    rand = false;
  } else {
    rand = true;
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
      }
    }
  });
});

next = parentDocument.getElementById("next");
prev = parentDocument.getElementById("back");

next.addEventListener("click", () => {
  if (!holdPL) {
    if (started) {
      switch (PlayBackMode) {
        case "linear":
          {
            if (playlist[plpos + 1] && started) {
              plpos++;
              parentDocument.getElementById("play-pause").style.opacity = "0%";
              parentDocument.getElementById("loading").style.opacity = "100%";
              if (!audio.isPlaying()) state = "paused";
              else state = "playing";
              audio.stop();
              started = false;
              parent.ready = false;
              audio = NextSong(playlist, plpos, state, () => {
                started = true;
                parent.ready = true;
                manageAudioData();
                audio.play();
                if (state === "paused") audio.pause();
              });
              const timeout = setTimeout(() => {
                parentDocument.getElementById(
                  "Blob-Reactor-Obj"
                ).style.transition = `all ${parent.BGspeed}s ease-out`;
                PrevSpeed = parent.BGspeed;
              }, 1000);
              clearTimeout(timeout);
            }
          }
          break;

        case "shuffle":
          {
            if (started) {
              let ipos;
              if (parent.corrupt) {
                parent.corrupt = false;
                ipos = plpos;
                plpos = 0;
              } else {
                ipos = plpos;
                while (plpos === ipos) {
                  plpos = Math.floor(Math.random() * playlist.length);
                }
              }

              diffpos = plpos - ipos;
              parentDocument.getElementById("play-pause").style.opacity = "0%";
              parentDocument.getElementById("loading").style.opacity = "100%";
              if (!audio.isPlaying()) state = "paused";
              else state = "playing";
              audio.stop();
              started = false;
              parent.ready = false;
              audio = PlayShuffleSong(playlist, plpos, ipos, diffpos, () => {
                started = true;
                manageAudioData();
                audio.play();
                if (state === "paused") audio.pause();
              });
              const timeout = setTimeout(() => {
                parentDocument.getElementById(
                  "Blob-Reactor-Obj"
                ).style.transition = `all ${parent.BGspeed}s ease-out`;
                PrevSpeed = parent.BGspeed;
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
              parentDocument.getElementById("play-pause").style.opacity = "0%";
              parentDocument.getElementById("loading").style.opacity = "100%";
              audio.stop();
              audio = loadSound(playlist[pos].url, () => {
                started = true;
                parent.ready = true;
                manageAudioData();
                //console.log(state)
                if (state === "paused") audio.pause();
                else audio.play();
              });
            }
          }
          break;
      }
    }
  } else {
    parent.corrupt = true;
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
    plpos--;
    parentDocument.getElementById("play-pause").style.opacity = "0%";
    parentDocument.getElementById("loading").style.opacity = "100%";
    if (!audio.isPlaying()) state = "paused";
    else state = "playing";
    audio.stop();
    started = false;
    audio =
      PrevSong(playlist, plpos, state, () => {
        started = true;
        manageAudioData();
        audio.play();
        if (state === "paused") {
          audio.pause();
        }
      }) || audio;
    const timeout = setTimeout(() => {
      parentDocument.getElementById(
        "Blob-Reactor-Obj"
      ).style.transition = `all ${parent.BGspeed}s ease-out`;
      PrevSpeed = parent.BGspeed;
    }, 1000);
    clearTimeout(timeout);
  }
});

parentDocument.getElementById("timeslide").addEventListener("input", () => {
  follow = false;
});

parentDocument.getElementById("timeslide").addEventListener("change", () => {
  if (audio.isLoaded() && release) {
    release = false;
    parentDocument.getElementById("play-pause").style.opacity = "0%";
    parentDocument.getElementById("loading").style.opacity = "100%";
    audio.jump(parentDocument.getElementById("timeslide").value);
    let interval = setInterval(() => {
      if (audio.isLoaded()) {
        follow = true;
        release = true;
        started = true;
        clearInterval(interval);
      }
    }, 10);
  } else {
    //console.log('not released')
  }
});

function loaded() {
  try {
    if (started) {
      manageAudioData();
      audio.setVolume(volumeSlider.value / 20);
      audio.play();
      audio.connect(eq);
      if (state === "paused") audio.pause();
    }
  } catch (e) {
    console.log("not loaded");
    console.log(e);
  }
}

parent.window.addEventListener("keydown", (event) => {
  let key;
  if (event.key.length === 1) {
    key = event.key.toLowerCase();
  } else {
    key = event.key;
  }

  if (parent.completesplash) {
    switch (key) {
      case ".":
        {
          if (audio) {
            if (audio.isLoaded()) {
              parentDocument.getElementById("timeslide").value =
                parseInt(parentDocument.getElementById("timeslide").value) + 10;
              parentDocument
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
              parentDocument.getElementById("timeslide").value =
                parentDocument.getElementById("timeslide").value - 10;
              parentDocument
                .getElementById("timeslide")
                .dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }
        break;

      case "f":
        {
          resetIdleTimer();
          parentDocument.getElementById("change-state").click();
        }
        break;

      case 'r':
        {
          window.localStorage.clear();
          setTimeout(() => {
          window.location.reload();
          }, 1000)
        }

      case " ":
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

      case "ArrowDown":
        {
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
        break;

      case "ArrowUp":
        {
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
          if (
            parentDocument.getElementById("options").style.left !== "-380px"
          ) {
            openMENU();
          }
          if (volbtn.style.width === "350px") {
            volbtn.click();
          }
          parentDocument.getElementById("eq-menu").style.top = "-500px";
          parentDocument.getElementById("eq-menu").style.opacity = "0%";
          const timeout = setTimeout(() => {
            parentDocument.getElementById("eq-menu").style.display = "none";
            parentDocument.getElementById("app-title").style.filter =
              "blur(0px) brightness(100%)";
            parentDocument.getElementById("Audio-react").style.filter =
              "blur(0px) brightness(60%)";
            parentDocument.getElementById("current-track").style.filter =
              "blur(0px) brightness(120%)";
          }, 1000);
          clearTimeout(timeout);
        }
        break;
    }
  }
});

function resetIdleTimer() {
  idle = 0;
  if (parent.rotdeg === 0 && parent.prevautochanged) {
    prevautochanged = false;
    parent.changeState();
  }
}

parentDocument.getElementById(
  "Blob-Reactor-Obj"
).style.transition = `all ${parent.BGspeed}s ease-out`;
PrevSpeed = parent.BGspeed;
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

let temptime, totalseconds, totaltime;

function manageAudioData() {
  if (audio) {
    if (audio.isLoaded()) {
      refreshbuttons.forEach((refresh) => {
        refresh.style.pointerEvents = "all";
      });
      temptime = Math.max(Math.floor(audio.duration() % 60), 0);
      totalseconds = temptime < 10 ? "0" + temptime : temptime.toString();
      totaltime =
        Math.max(Math.floor(audio.duration() / 60), 0) + ":" + totalseconds;
      parentDocument.getElementById("total-time").innerHTML = totaltime;
      //audio.output.channelCount = 8
      audio.setVolume(volumeSlider.value / 20);
      audio.connect(eq);
      //console.log(audio)
      try {
        parentDocument.getElementById("track-artist").innerHTML =
          playlist[plpos].artist || "Unknown";
        parentDocument.getElementById("track-name").innerHTML =
          playlist[plpos].title || "Unknown";
      } catch (e) {
        console.log(e);
        parentDocument.getElementById("track-artist").innerHTML = "Unknown";
        parentDocument.getElementById("track-name").innerHTML = "Unknown";
      }
      //eq.process(audio)
    }
  }
}

function draw() {
  try {
    if (audio) {
      if (started && !holdPL) {
        vol = amplitude.getLevel();

        if (audio.isLoaded()) {
          startloaddate = Date.now();
          parentDocument.getElementById("play-pause").style.opacity = "100%";
          parentDocument.getElementById("loading").style.opacity = "0%";
          
          let RemainingtimeSec,
          rmin, 
          rsec,
          Remainingtime,
          strokelem,
          seconds,
          time,
          duration,
          currentTime

          time = Math.max(Math.floor(currentTime % 60), 0);
          seconds = time < 10 ? "0" + time : time.toString();
          if (timemode === "normal") {
            parentDocument.getElementById("current-time").innerHTML =
              Math.max(Math.floor(currentTime / 60), 0) + ":" + seconds;
          } else {
            RemainingtimeSec = duration - currentTime;
            rmin = Math.floor(RemainingtimeSec / 60);
            rsec = Math.floor(RemainingtimeSec % 60);
            Remainingtime = "-" + rmin + ":" + (rsec < 10 ? "0" : "") + rsec;

            if (Remainingtime === "-0:00") {
              Remainingtime = "0:00";
            }

            parentDocument.getElementById("current-time").innerHTML =
              Remainingtime;
          }
          parentDocument.getElementById("timeslide").max = duration;
          parentDocument.getElementById("timeslide").style.backgroundSize = `${
            (currentTime / duration) * 100 + 1
          }% 100%`;
          if (follow)
            parentDocument.getElementById("timeslide").value =
              currentTime;
          if (
            parentDocument.getElementById("Blob-Reactor-Obj").style.display ===
              "block" &&
            vol * 20 > 0.1 &&
            VisualMode === "BlobReactor"
          ) {
            if (
              parentDocument.getElementById("Blob-Reactor-Obj").style
                .display !== "block"
            ) {
              parentDocument.getElementById("Blob-Reactor-Obj").style.display =
                "block";
            }
            if (PrevSpeed !== parent.BGspeed) {
              parentDocument.getElementById(
                "Blob-Reactor-Obj"
              ).style.transition = `all ${parent.BGspeed}s ease-out`;
              PrevSpeed = parent.BGspeed;
            }
            if (vol * 20 > 0.1) {
              parentDocument.getElementById(
                "Blob-Reactor-Obj"
              ).style.transform = `scale(${vol * 10})`;
            }
          }
          if (VisualMode == "ActiveReactor") {
            if (
              parentDocument.getElementById("Blob-Reactor-Obj").style
                .display !== "none" ||
              parentDocument.getElementById("Audio-react").style.display !==
                "none" ||
              parentDocument.getElementById("Audio-Visulizer").style.display !==
                "block"
            ) {
              parentDocument.getElementById("Audio-react").style.display =
                "none";
              parentDocument.getElementById("Blob-Reactor-Obj").style.display =
                "none";
              parentDocument.getElementById("Audio-Visulizer").style.display =
                "block";
            }
            if (
              prevwidth !== parent.window.innerWidth ||
              prevheight !== parent.window.innerHeight
            ) {
              strokelem = parentDocument.getElementById("stroke");
              strokelem.style.width =
                (parent.window.innerWidth / 20 / 100) * 50;
              strokelem.style.height =
                (parent.window.innerWidth / 20 / 100) * 50;
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
              prevwidth = parent.window.innerWidth;
              prevheight = parent.window.innerHeight;
              createCanvas(
                1024 * 1.73,
                576 * 1.73,
                parentDocument.getElementById("Audio-Visulizer-Canv")
              );
              
            }

            background(0);
            stroke(255);
            strokeWeight(10);
            translate(width / 2, height / 2);
            rotate(90);
            frameRate(144);
            fft.analyze();
            let wave = fft.waveform();

            for (let t = -1; t <= 1; t += 2) {
              beginShape();
              for (let i = 0; i < 180; i += 0.2) {
                let index = floor(map(i, 0, 300, 0, wave.length - 1));
                //console.log(parentDocument.getElementById('stroke').style.width)
                let r = map(
                  wave[index] * 3,
                  -1,
                  1,
                  parentDocument.getElementById("stroke").style.width,
                  parent.window.innerWidth / 9.5
                );
                let x = r * cos(i);
                let y = r * sin(i) * t;
                vertex(x, y);
              }
              endShape();
            }

            let p = new DustParticles(createVector(0, 0));
            particlesArray.push(p);
            amp = amplitude.getLevel() * 20;
            if (!audio.isPlaying()) {
              amp = 0;
            }
            //console.log(parentDocument.getElementById('imgReact').style.transform)
            if (
              parentDocument.getElementById("imgReact").style.transition !==
              "transform 1s ease-out"
            ) {
              parentDocument.getElementById(
                "Audio-Visulizer"
              ).style.transition = "transform 1s ease-out";
            }
            parentDocument.getElementById("Audio-Visulizer").style.transform =
              "scale(" + (amp / 5 + 1) + ")";

            //console.log(parentDocument.getElementById('imgReact').style.transform, amp)

            if (amp > 1.5) {
              parentDocument.getElementById("stroke").style.boxShadow =
                "0 0 50px #ef7b28";
            }
            if (amp > 3) {
              parentDocument.getElementById("stroke").style.boxShadow =
                "0 0 50px #e19118";
            } else {
              parentDocument.getElementById("stroke").style.boxShadow =
                "0 0 50px #ccc";
            }

            if (amp > 3.85) {
              if (amp > 5) {
                //console.log('lvl2')
                parentDocument.getElementById("stroke").style.animation =
                  "shakelvl2 0.1s infinite running";
              } else {
                //console.log('lvl1');
                parentDocument.getElementById("stroke").style.animation =
                  "shake 0.2s infinite running";
              }
            } else {
              parentDocument.getElementById("stroke").style.animation = "none";
            }

            //console.log(particlesArray.length)

            for (var i = 0; i < particlesArray.length; i++) {
              if (!particlesArray[i].edges()) {
                particlesArray[i].update(Math.ceil(amp * 2));
                particlesArray[i].show();
              } else {
                //console.log('removed')
                particlesArray.splice(i, 1);
              }
            }
          }
        }
        audio.onended(() => {
          initInst++;
          refreshbuttons.forEach((refresh) => {
            refresh.style.pointerEvents = "none";
          });
          parentDocument.getElementById("timeslide").value = 0;
          if (!audio._paused) {
            if (plpos >= playlist.length - 1) {
              parentDocument.getElementById(
                "Blob-Reactor-Obj"
              ).style.transition = "all 1s ease-out";
              parentDocument.getElementById(
                "Blob-Reactor-Obj"
              ).style.transform = `scale(1)`;

              const timeout = setTimeout(() => {
                parentDocument.getElementById(
                  "Blob-Reactor-Obj"
                ).style.transition = `all ${parent.BGspeed}s ease-out`;
                PrevSpeed = parent.BGspeed;
              }, 1000);
              clearTimeout(timeout);
            } else {
              if (started && audio.isLoaded() && !audio._paused && release) {
                next.click();
              }
              parentDocument.getElementById(
                "Blob-Reactor-Obj"
              ).style.transition = "all 1s ease-out";
              parentDocument.getElementById(
                "Blob-Reactor-Obj"
              ).style.transform = `scale(1)`;

              const timeout = setTimeout(() => {
                parentDocument.getElementById(
                  "Blob-Reactor-Obj"
                ).style.transition = `all ${parent.BGspeed}s ease-out`;
                PrevSpeed = parent.BGspeed;
              }, 1000);
              clearTimeout(timeout);
            }
          }
        });
      } else {
        if (parent.corrupt) {
          if (audio.buffer === null || audio.duration() === 0) {
            if (parent.corrupt) {
              //console.log(audio)
              started = true;
              displayERR("corupted-file");
              if (!goback) {
                if (plpos < playlist.length - 1) {
                  next.click();
                } else {
                  if (playlist.length > 0) {
                    plpos = 0;
                    holdPL = true;

                    parentDocument.getElementById("play-pause").style.opacity =
                      "100%";
                    parentDocument.getElementById("loading").style.opacity =
                      "0%";
                    state = "paused";
                    parentDocument.getElementById(
                      "disk"
                    ).style.animationPlayState = "paused";
                    parentDocument.getElementById("state-track").innerHTML =
                      "Paused";
                    parentDocument.getElementById("play-pause").src =
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
          parentDocument.getElementById("play-pause").style.opacity = "0%";
          parentDocument.getElementById("loading").style.opacity = "100%";
        }
        //console.log('not loaded')
      }
    }else { console.log('audio not loaded'); window.location.reload()}
  } catch (e) {
    console.log(e);
  }
}

let difference;

setInterval(() => {
  if (!playlist && !audio) {
    SETBypassBGScan = true;
    difference = Date.now() - startloaddate;
    if (difference > 2000) {
      startloaddate = Date.now();
      //console.log('refreshed')
      parentDocument.getElementById("refr-alt").click();
    }
    console.log("yes not good");
    prevnul = true;
    //console.log('not started')
  } else {
    try {
      if (playlist.length === 0) {
        SETBypassBGScan = true;
        difference = Date.now() - startloaddate;
        if (difference > 2000) {
          startloaddate = Date.now();
          //console.log('refreshed')

          parentDocument.getElementById("refr-alt").click();
        }
        prevnul = true;
        //console.log('not started')
      } else {
        SETBypassBGScan = false;
      }
    } catch (e) {
      console.log(e);
      console.log(playlist);
    }
  }
}, 1000);

function ChangeBG() {
  let interval = setTimeout(() => {
    if (
      BGready &&
      parentDocument.getElementById("BG-choice-txt0").innerText === "BGCustom"
    ) {
      if (BackgroundData) {
        if (BackgroundData.length > 1) {
          if (BGpos < BackgroundData.length - 1) {
            BGpos++;
          } else {
            BGpos = 0;
          }
          parentDocument.getElementById("Audio-react").style.transition =
            "none";
          parentDocument.getElementById("Audio-react").style.display = "block";
          parentDocument.getElementById("Audio-react").style.opacity = "100%";
          parentDocument.getElementById(
            "Audio-react"
          ).style.transition = `all 1s ease-out`;

          setTimeout(() => {
            parentDocument.getElementById("Audio-react").style.opacity = "0%";
            const timeout = setTimeout(() => {
              try {
                parentDocument.getElementById("Audio-react").data =
                  BackgroundData[BGpos];
                const timeout2 = setTimeout(() => {
                  parentDocument.getElementById("Audio-react").style.opacity =
                    "100%";
                  clearTimeout(interval);
                  clearTimeout(timeout2);
                  ChangeBG();
                }, 100);
              } catch (e) {
                console.log(e);
                parentDocument.getElementById("BG-choice-txt0").innerText =
                  "BlobReactor";
                ParentLocalStorage.setItem("Background-Type", "BlobReactor");
                setTimeout(() => {
                  parent.window.location.reload();
                }, 100);
              }
            }, 1000);
            clearTimeout(timeout);
          }, 100);
        } else {
          clearTimeout(interval);
          ChangeBG();
        }
      }
    } else {
      //console.log(BGready, BGpos, parentDocument.getElementById('BG-choice-txt0').innerText)
      clearTimeout(interval);
      ChangeBG();
    }
  }, parent.BGrefresh);
}

ChangeBG();

setInterval(() => {
  //console.log(SETBypassBGScan)
  if (BackgroundData) {
    if (BackgroundData.length == 0) {
      //console.log('Trying to fetch backgrounds')
      try {
        BackgroundData = parent.FetchBackgrounds(
          parentDocument.getElementById("BG-choice-txt0").innerText,
          true
        );
      } catch (e) {
        console.log(e);
      }
      let WaitForBG = setInterval(() => {
        if (BackgroundData) {
          clearInterval(WaitForBG);
          BGready = true;
        }
      }, 500);
    }
  }
}, 2000);
