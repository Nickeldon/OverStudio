var RFreq = 1;
//document.getElementById('SoundFrame').src = `./SoundFrame.html?random=${(new Date()).getTime() + Math.floor(Math.random() * 1000000)}`

var localStorageData = localStorage;

var EffectChangeTimeout = true;
var completesplash = false;
var corrupt = false;
var noError = false;
var prevautochanged = false;
var cooldownBGState = true;
var prevBlurred = false;
var prevEQBlurred = false;

var MenuTimeout = [0, 0, 0, 0, 0, 0, 0];

var BackgroundData = [];
var BGready = false;

var BGrefresh = localStorageData["Background-Cooldown"] || 10000;
localStorage.setItem("Background-Cooldown", BGrefresh);
if (BGrefresh < 60000) {
  document.getElementById("BG-cooldown-txt0").innerText = `${
    BGrefresh / 1000
  }s`;
} else {
  document.getElementById("BG-cooldown-txt0").innerText = `${
    BGrefresh / 60000
  }min`;
}

var BGpos = 0;

var VisualMode = localStorageData["Background-Type"] || "BlobReactor";
localStorage.setItem("Background-Type", VisualMode);
document.getElementById("BG-choice-txt0").innerText = VisualMode;

var BGspeed = localStorageData["Reactor-Speed"] || ".2";
localStorage.setItem("Reactor-Speed", BGspeed);
document.getElementById("amp-speed-txt0").innerText = BGspeed;

var trackScrollSmoothing = localStorageData["smoothTrack"] || "true";
if (trackScrollSmoothing == "true") {
  document.getElementById("current-track").style.scrollBehavior = "smooth";
  document.getElementById("current-track").style.willChange = "scroll-position";
  document.getElementById("smooth-track-txt0").innerText = "Disable";
} else {
  document.getElementById("current-track").style.scrollBehavior = "auto";
  document.getElementById("current-track").style.willChange = "auto";
  document.getElementById("smooth-track-txt0").innerText = "Enable";
}

localStorage.setItem("smoothTrack", trackScrollSmoothing);

const speeds = {
  normal: [1, 1, 1, 1, 1, 1000],
  fast: [0.5, 0.5, 0.5, 0.5, 0.5, 600],
  FroxceyFast: [0.3, 0.3, 0.3, 0.3, 0.3, 400],
};

var chosenSpeed = localStorageData["animations"] || "normal";
localStorage.setItem("animations", chosenSpeed);
animationSpeeds(speeds[chosenSpeed]);

document.getElementById("anim-txt0").innerHTML = chosenSpeed;

var bootsoundbool = localStorageData["Sound_boot"] || "true";
if (bootsoundbool == "false") bootsoundbool = false;
else bootsoundbool = true;
localStorage.setItem("Sound_boot", bootsoundbool);
if (bootsoundbool) {
  document.getElementById("boot-snd-txt0").innerText = "Disable Sound at boot";
} else {
  document.getElementById("boot-snd-txt0").innerText = "Enable Sound at boot";
}

try {
  effectsArray = JSON.parse(localStorageData["effectsState"]) || {
    dust: "true",
    amplitude: "true",
  };
} catch (e) {
  effectsArray = {
    dust: "true",
    amplitude: "true",
  };
}

var goback = false;
var enDust = /true/.test(effectsArray["dust"]) || false;
var enAmpl = /true/.test(effectsArray["amplitude"]) || false;

document.getElementById("dust-txt0").innerText = "Disable dust particles";
document.getElementById("dust").style.display = "block";
document.getElementById("ampl-txt0").innerText =
  "Disable Amplitude BlobReactor";
document.getElementById("Blob-Reactor-Obj").style.display = "block";

if (!enDust) {
  document.getElementById("dust-txt0").innerText = "Enable dust particles";
  document.getElementById("dust").style.display = "none";
}
if (!enAmpl) {
  document.getElementById("ampl-txt0").innerText =
    "Enable Amplitude BlobReactor";
  document.getElementById("Blob-Reactor-Obj").style.display = "none";
}
localStorage.setItem("effectsState", JSON.stringify(effectsArray));

var idle = 0;
var idletimeout = parseInt(localStorageData["idletimeout"]) || 25;
localStorage.setItem("idletimeout", idletimeout);

if (idletimeout == 25) {
  document.getElementById("idle-txt0").innerText = "25s";
} else if (idletimeout == 10) {
  document.getElementById("idle-txt0").innerText = "10s";
} else {
  document.getElementById("idle-txt0").innerText = `${idletimeout / 60} min`;
}

document
  .getElementById("draggable")
  .addEventListener("click", () =>
    console.log("dragging")
  ); /*.onmousedown = () => {
  console.log('dragging')
  window.ipcRender.send('window:dragged');
}*/

document.getElementById("draggable").onmouseup = () => {
  console.log("not dragging");
  window.ipcRender.send("window:undragged");
};

$(document).ready(() => {
  setInterval(() => {
    if (idletimeout > 0) {
      IdleIncrease();
    } else idle = 0;
  }, 1000);

  $(this).mousemove(() => {
    idle = 0;
    if (rotdeg === 0 && prevautochanged) {
      prevautochanged = false;
      changeState();
    }
  });
  $(this).keypress(() => {
    idle = 0;
    if (rotdeg === 0 && prevautochanged) {
      prevautochanged = false;
      changeState();
    }
  });
});

var fadeBool = localStorageData["fadeAtClose"] || "true";

document.getElementById("fade-txt0").innerText = fadeBool;
localStorage.setItem("fadeAtClose", fadeBool);

function changeOptionState(optionDOM, state) {
  if (state) {
    optionDOM.style.filter = "blur(0px) brightness(100%)";
    optionDOM.style.pointerEvents = "all";
    optionDOM.style.userSelect = "none";
    optionDOM.style.transform = "scale(1)";
  } else {
    optionDOM.style.filter = "blur(1px) brightness(40%)";
    optionDOM.style.pointerEvents = "none";
    optionDOM.style.userSelect = "none";
    optionDOM.style.transform = "scale(0.96)";
  }
}

function SwitchBackgrounds(choice) {
  if (cooldownBGState) {
    document.getElementById("Audio-react").style.display = "none";
    document.getElementById("Blob-Reactor-Obj").style.display = "none";
    cooldownBGState = false;
    if (choice === "BlobReactor") {
      changeOptionState(document.getElementById("blob-speed-opt"), true);
      changeOptionState(document.getElementById("blob-speed-opt"), true);
      changeOptionState(document.getElementById("blob-react-parent"), true);
      changeOptionState(document.getElementById("Custom-BG-speed"), false);
      changeOptionState(
        document.getElementById("ActiveVisulizer-opt-choice"),
        false
      );
      BGready = false;
      var prevTransition =
        document.getElementById("Blob-Reactor-Obj").style.transition;
      document.getElementById("Blob-Reactor-Obj").style.transition = "none";
      document.getElementById("Audio-react").style.transition = "none";

      document.getElementById("Blob-Reactor-Obj").style.opacity = "0%";
      document.getElementById("Blob-Reactor-Obj").style.display = "block";
      document.getElementById("Audio-react").style.opacity = "100%";

      document.getElementById("Audio-react").style.transition =
        "all 1s ease-out";
      setTimeout(() => {
        document.getElementById("Audio-react").style.opacity = "0%";
        document.getElementById("Blob-Reactor-Obj").style.opacity = "100%";
        setTimeout(() => {
          document.getElementById("Audio-react").style.display = "none";
          document.getElementById("Blob-Reactor-Obj").style.transition =
            prevTransition;
          cooldownBGState = true;
        }, 1000);
      }, 100);
    } else if (choice === "BGCustom") {
      if (BackgroundData) {
        if (BackgroundData.length > 0) {
          changeOptionState(document.getElementById("blob-speed-opt"), false);
          changeOptionState(
            document.getElementById("blob-react-parent"),
            false
          );
          changeOptionState(document.getElementById("Custom-BG-speed"), true);
          changeOptionState(
            document.getElementById("ActiveVisulizer-opt-choice"),
            false
          );
          document.getElementById("Audio-react").style.transition = "none";
          document.getElementById("Audio-react").style.display = "none";
          setTimeout(() => {
            document.getElementById("Blob-Reactor-Obj").style.display = "block";
            document.getElementById("Audio-react").style.opacity = "0%";
            document.getElementById("Audio-react").style.display = "block";
            document.getElementById("Audio-react").style.transition =
              "all 1s ease-out";
            setTimeout(() => {
              document.getElementById("Audio-react").style.opacity = "100%";
            }, 100);
            var prevTransition =
              document.getElementById("Blob-Reactor-Obj").style.transition;
            document.getElementById("Blob-Reactor-Obj").style.transition =
              "all 1s ease-out";
            document.getElementById("Blob-Reactor-Obj").style.opacity = "0%";
            setTimeout(() => {
              document.getElementById("Blob-Reactor-Obj").style.display =
                "none";
              document.getElementById("Blob-Reactor-Obj").style.transition =
                prevTransition;
              document.getElementById("Audio-react").style.transition = "none";
              document.getElementById("Audio-react").style.opacity = "0%";
              document.getElementById("Audio-react").style.transition =
                "all 1s ease-out";
              document.getElementById("Audio-react").data =
                BackgroundData[BGpos];
              setTimeout(() => {
                document.getElementById("Audio-react").style.opacity = "100%";
              }, 100);
              cooldownBGState = true;
              BGready = true;
              document.getElementById("refr-alt").click();
            }, 1000);
          }, 100);
        } else {
          console.log("no data");
          document.getElementById("BG-choice-txt0").innerText = "BlobReactor";
          localStorage.setItem("Background-Type", "BlobReactor");
          SwitchBackgrounds("BlobReactor");
        }
      } else {
        console.log("no data");
        document.getElementById("BG-choice-txt0").innerText = "BlobReactor";
        localStorage.setItem("Background-Type", "BlobReactor");
        SwitchBackgrounds("BlobReactor");
      }
    } else {
      console.log("no data");
      document.getElementById("BG-choice-txt0").innerText = "BlobReactor";
      localStorage.setItem("Background-Type", "BlobReactor");
      SwitchBackgrounds("BlobReactor");
    }
  }
}

function FetchBackgrounds(State, Bypass) {
  //console.log('loaded')
  fetch(`http://localhost:${PORT}/getBackgrounds`)
    .then((res) => res.json())
    .then((res) => {
      //console.log(res)
      BackgroundData = shuffleArray(res);
      if (!Bypass) {
        document.getElementById("Audio-react").style.display = "none";
        document.getElementById("Blob-Reactor-Obj").style.display = "none";
        if (State === "BlobReactor") {
          changeOptionState(document.getElementById("blob-speed-opt"), true);
          changeOptionState(document.getElementById("blob-react-parent"), true);
          changeOptionState(document.getElementById("Custom-BG-speed"), false);
          changeOptionState(
            document.getElementById("ActiveVisulizer-opt-choice"),
            false
          );
          document.getElementById("Audio-react").style.display = "none";
          document.getElementById("Blob-Reactor-Obj").style.display = "none";
          setTimeout(() => {
            var prevTransition =
              document.getElementById("Blob-Reactor-Obj").style.transition;
            document.getElementById("Blob-Reactor-Obj").style.transition =
              "all 1s ease-out";
            document.getElementById("Blob-Reactor-Obj").style.display = "block";
            setTimeout(() => {
              document.getElementById("Blob-Reactor-Obj").style.opacity =
                "100%";
              setTimeout(() => {
                document.getElementById("Blob-Reactor-Obj").style.transition =
                  prevTransition;
              }, 1000);
            }, 10);
          }, 100);
        } else if (State === "BGCustom") {
          if (BackgroundData) {
            if (BackgroundData.length > 0) {
              changeOptionState(
                document.getElementById("blob-speed-opt"),
                false
              );
              changeOptionState(
                document.getElementById("blob-react-parent"),
                false
              );
              changeOptionState(
                document.getElementById("Custom-BG-speed"),
                true
              );
              changeOptionState(
                document.getElementById("ActiveVisulizer-opt-choice"),
                false
              );
              try {
                document.getElementById("Audio-react").style.transition =
                  "all 1s ease-out";
                document.getElementById("Audio-react").style.display = "none";
                document.getElementById("Blob-Reactor-Obj").style.display =
                  "none";

                document.getElementById("Audio-react").data =
                  BackgroundData[BGpos];
                document.getElementById("Audio-react").onerror = () => {
                  BGpos++;
                  document.getElementById("Audio-react").data =
                    BackgroundData[BGpos];
                };
                document.getElementById("Audio-react").style.display = "block";
                setTimeout(() => {
                  document.getElementById("Audio-react").style.opacity = "100%";
                }, 10);
                var prevTransition =
                  document.getElementById("Blob-Reactor-Obj").style.transition;
                document.getElementById("Blob-Reactor-Obj").style.transition =
                  "all 1s ease-out";
                document.getElementById("Blob-Reactor-Obj").style.opacity =
                  "0%";
                setTimeout(() => {
                  document.getElementById("Blob-Reactor-Obj").style.display =
                    "none";
                  document.getElementById("Blob-Reactor-Obj").style.transition =
                    prevTransition;
                  BGready = true;
                }, 1000);
              } catch (e) {
                console.log(e);
              }
            } else {
              console.log("no data");
              document.getElementById("BG-choice-txt0").innerText =
                "BlobReactor";
              localStorage.setItem("Background-Type", "BlobReactor");
              SwitchBackgrounds("BlobReactor");
            }
          } else {
            console.log("no data");
            document.getElementById("BG-choice-txt0").innerText = "BlobReactor";
            localStorage.setItem("Background-Type", "BlobReactor");
            SwitchBackgrounds("BlobReactor");
          }
        }
      }
      return BackgroundData;
    })
    .catch((e) => {
      console.log(e);
    });
}

function IdleIncrease() {
  idle++;
  //console.log(idle, idletimeout)
  if (idle > idletimeout) {
    if (rotdeg === 11) {
      prevautochanged = true;
      changeState();
    }
  }
}

var opentab = new Howl({
  src: ["./Addons/SF/openmenu1.mp3"],
  volume: 1,
  stereo: true,
});
document.getElementById("eq-menu").style.top = "0px";
var emptyreload = /true/.test(localStorageData["emptyreload"]) || false;
var PlMenuOpened = /true/.test(localStorageData["PlMenuOpened"]) || false;

if (!emptyreload) {
  window.onload = () => {
    FetchBackgrounds(VisualMode);
    document.getElementById("Audio-react").style.display = "none";
    if (bootsoundbool) {
      document.querySelector("audio").play();
      document.querySelector("audio").volume = "0.3";
    }
    setTimeout(() => {
      document.getElementById("splash-scr").style.opacity = "0%";

      setTimeout(() => {
        document.getElementById("splash-scr").style.display = "none";
        completesplash = true;
      }, 500);
    }, 1000);
  };
} else {
  completesplash = true;
  if (PlMenuOpened) {
    var animation = [
      document.getElementById("options").style.transition,
      document.getElementById("opt-menu2").style.transition,
    ];
    document.getElementById("options").style.transition = "none";
    document.getElementById("opt-menu2").style.transition = "none";
    openMENU();
    options(1);
    localStorage.setItem("PlMenuOpened", false);
    setTimeout(() => {
      document.getElementById("options").style.transition = animation[0];
      document.getElementById("opt-menu2").style.transition = animation[1];
    }, 1000);
  }
  document.getElementById("splash-scr").style.display = "none";
  localStorage.setItem("emptyreload", false);
}

/*
function InternetHandler(status){
  console.log(status)
}

function checkInternet(){
  var xhr = new XMLHttpRequest();
  setInterval(() => {
    console.log('checking')
    try {
      xhr.open('GET', 'https://www.google.com', true);
      xhr.send();

        if(xhr.readyState === 4 && xhr.status === 200){
          InternetHandler("Connected")
          console.log(xhr.status, xhr.readyState)
        } else{
          console.log(xhr.status, xhr.readyState)
          InternetHandler("Disconnected")
        }
    } catch (e) {
      console.log(e)
      //InternetHandler("Disconnected")
    }
  }, 1000)
}*/

function animationSpeeds(transitions) {
  if (transitions) {
    document.getElementById(
      "eq-menu"
    ).style.transition = `all ${transitions[0]}s ease-out`;
    document.getElementById("opt-menu2").style.transition,
      document.getElementById("opt-menu3").style.transition,
      document.getElementById("opt-menu4").style.transition,
      document.getElementById("opt-menu5").style.transition,
      (document.getElementById("opt-menu6").style.transition = `all ${
        transitions[1]
      }s opacity ${transitions[1] - 0.2}s ease-in-out`);
    document.getElementById(
      "options"
    ).style.transition = `all ${transitions[2]}s ease-in-out`;
    document.getElementById(
      "Audio-react"
    ).style.transition = `transform ${transitions[3]}s ease-out`;
    document.getElementById(
      "UI-scr1"
    ).style.transition = `opacity ${transitions[4]}s ease-out`;
  }
}

function displayERR(type) {
  document.getElementById("min-app").style.transition = "all .5s ease-out";
  document.getElementById("min-app").style.pointerEvents = "none";
  document.getElementById("min-app").style.opacity = "0%";
  if (type === "directory-exists" || !type) {
    var icparent = document.getElementById("err-icon-parent");
    var ic = document.getElementById("err-icon");
    var err = document.getElementById("err-message");
  } else if (type === "corupted-file") {
    var icparent = document.getElementById("corrupt-icon-parent");
    var ic = document.getElementById("corrupt-icon");
    var err = document.getElementById("corrupt-message");
  } else if (type === "No-Background-file") {
    var icparent = document.getElementById("No-BG-icon-parent");
    var ic = document.getElementById("No-BG-icon");
    var err = document.getElementById("No-BG-message");
  } else if (type === "Reset-Settings") {
    var icparent = document.getElementById("Reboot-cond-icon-parent");
    var ic = document.getElementById("Reboot-cond-icon");
    var err = document.getElementById("Reboot-condition");
  } else if (type === "Device-changed") {
    var icparent = document.getElementById("deviceSwap-icon-parent");
    var ic = document.getElementById("deviceSwap-icon");
    var err = document.getElementById("deviceSwap-message");
  } else {
    return undefined;
  }
  err.style.display = "block";
  setTimeout(() => {
    err.style.right = "0%";
    setTimeout(() => {
      err.style.opacity = "100%";
      setTimeout(() => {
        icparent.classList.add("jump");
        ic.classList.add("shake");
        setTimeout(() => {
          icparent.classList.remove("jump");
          ic.classList.remove("shake");
        }, 1560);
      }, 500);
      setTimeout(() => {
        err.style.right = "-400px";
        setTimeout(() => {
          err.style.opacity = "0%";
          setTimeout(() => {
            err.style.display = "none";
          }, 2000);
          setTimeout(() => {
            document.getElementById("min-app").style.transition =
              "all 1s ease-out";
            document.getElementById("min-app").style.pointerEvents = "all";
            document.getElementById("min-app").style.opacity = "80%";
          }, 500);
        }, 50);
      }, 3000);
    }, 200);
  }, 10);
}

var initx = 1777;

document.querySelector("body").style.transition = "none";
document.querySelector("body").style.transform = `scale(${1024 / initx})`;
document.querySelector("body").style.transition =
  "transition: all 1s ease-out;";

window.addEventListener("resize", () => {
  document.querySelector("body").style.transform = `scale(${
    window.innerWidth / initx
  })`;
});

var rotdeg = 11;
var normscale = 1.3;
document.getElementById(
  "Audio-react"
).style.transform = `rotate(${rotdeg}deg) scale(${normscale})`;

function changeState() {
  if (rotdeg === 11) {
    document.getElementById("side").style.pointerEvents = "none";
    document.getElementsByClassName("menu-icns").forEach((elem) => {
      elem.style.pointerEvents = "none";
    });
    document.getElementsByClassName("options").forEach((elem) => {
      elem.style.pointerEvents = "none";
    });
    if (
      document.getElementById("Audio-react").style.filter ===
      "blur(5px) brightness(60%)"
    ) {
      prevBlurred = true;
      document.getElementById("Audio-react").style.filter =
        "blur(0px) brightness(60%)";
    }
    if (
      document.getElementById("Audio-react").style.filter ===
      "blur(5px) brightness(40%)"
    ) {
      prevEQBlurred = true;
      document.getElementById("Audio-react").style.filter =
        "blur(0px) brightness(60%)";
    }
    document.getElementById("min-app").style.transition = "all .5s ease-out";
    document.getElementById("min-app").style.pointerEvents = "none";
    document.getElementById("min-app").style.opacity = "0%";
    document.getElementById("filter").style.opacity = "0%";
    document.getElementById("cont-bar").style.borderColor = "transparent";
    document.getElementById("UI-scr1").style.opacity = "0";

    rotdeg = 0;
    normscale = 1;
    document.getElementById(
      "Audio-react"
    ).style.transform = `rotate(${rotdeg}deg) scale(${normscale})`;
    setTimeout(() => {
      if (rotdeg === 0) {
        document.getElementById("track-info").style.opacity = "70%";
        document.getElementById("track-info").style.right = "-50px";
      }
    }, 1500);
  } else {
    document.getElementById("side").style.pointerEvents = "all";
    document.getElementsByClassName("menu-icns").forEach((elem) => {
      elem.style.pointerEvents = "all";
    });
    document.getElementsByClassName("options").forEach((elem) => {
      elem.style.pointerEvents = "all";
    });
    if (prevBlurred) {
      document.getElementById("Audio-react").style.filter =
        "blur(5px) brightness(60%)";
      prevBlurred = false;
    }
    if (prevEQBlurred) {
      document.getElementById("Audio-react").style.filter =
        "blur(5px) brightness(40%)";
      prevEQBlurred = false;
    }
    setTimeout(() => {
      document.getElementById("filter").style.opacity = "50%";
      document.getElementById("cont-bar").style.borderColor = "white";
      document.getElementById("UI-scr1").style.opacity = "100%";
    }, 10);
    rotdeg = 11;
    normscale = 1.3;
    document.getElementById(
      "Audio-react"
    ).style.transform = `rotate(${rotdeg}deg) scale(${normscale})`;
    document.getElementById("track-info").style.opacity = "0%";
    document.getElementById("track-info").style.right = "-550px";

    document.getElementById("min-app").style.transition = "all 1s ease-out";
    document.getElementById("min-app").style.pointerEvents = "all";
    document.getElementById("min-app").style.opacity = "100%";
  }
}

function openMENU(Bypass_menu_disp) {
  clearTimeout(MenuTimeout[0]);
  clearTimeout(MenuTimeout[1]);
  clearTimeout(MenuTimeout[2]);
  clearTimeout(MenuTimeout[3]);
  clearTimeout(MenuTimeout[4]);

  opentab.play();

  if (document.getElementById("search-query").style.width == "600px")
    document.getElementById("search-query").click();

  var opt = document.getElementById("options");
  var optprev = document.getElementById("opt-preview");
  var optprevicns = document.getElementsByClassName("menu-icns");
  document.getElementById("opt-menu2").style.opacity = "0%";
  document.getElementById("opt-menu3").style.opacity = "0%";
  document.getElementById("opt-menu4").style.opacity = "0%";
  document.getElementById("opt-menu5").style.opacity = "0%";
  document.getElementById("opt-menu6").style.opacity = "0%";
  document.getElementById("opt-menu6-child-container").style.willChange =
    "unset";
  document.getElementById("div-selector").style.willChange = "unset";
  if (Bypass_menu_disp)
    document.getElementById("opt-menu1").style.opacity = "0%";
  optprev.style.display = "block";
  let deletespeed = parseInt(speeds[chosenSpeed][5]) - 200;
  MenuTimeout[0] = setTimeout(() => {
    document.getElementById("opt-menu2").style.display = "none";
    document.getElementById("opt-menu3").style.display = "none";
    document.getElementById("opt-menu4").style.display = "none";
    document.getElementById("opt-menu5").style.display = "none";
    document.getElementById("opt-menu6").style.display = "none";
    if (Bypass_menu_disp)
      document.getElementById("opt-menu1").style.display = "none";
    else document.getElementById("opt-menu1").style.display = "block";
  }, deletespeed);

  document.getElementsByClassName("opt-txt").forEach((elem) => {
    if (elem.style.opacity === "0") elem.style.opacity = "100%";
    else elem.style.opacity = "0%";
  });

  if (opt.style.left === "-380px") {
    document.getElementById("app-title").style.filter =
      "blur(0px) brightness(100%)";
    document.getElementById("search-query").style.filter =
      "blur(0px) brightness(100%)";
    document.getElementById("eq-menu").style.top = "-500px";
    document.getElementById("eq-menu").style.opacity = "0%";
    MenuTimeout[1] = setTimeout(() => {
      document.getElementById("eq-menu").style.display = "none";
    }, 1000);

    if (!Bypass_menu_disp) {
      let prevTransition =
        document.getElementById("opt-menu1").style.transition;
      document.getElementById(
        "opt-menu1"
      ).style.transition = `${speeds[chosenSpeed][2]}s opacity ease-out`;
      document.getElementById("opt-menu1").style.opacity = "100%";
      setTimeout(() => {
        document.getElementById("opt-menu1").style.transition = prevTransition;
      }, speeds[chosenSpeed][2]);
    }

    document.getElementById("Audio-react").style.filter =
      "blur(5px) brightness(60%)";
    document.getElementById("current-track").style.filter =
      "blur(5px) brightness(60%)";
    opt.style.display = "block";
    optprev.style.opacity = "100%";

    optprevicns.forEach((elem) => {
      elem.style.animation = "1s pop both";
    });

    MenuTimeout[3] = setTimeout(() => {
      opt.style.opacity = "80%";
      opt.style.left = "0px";
    }, 100);
  } else {
    document.getElementById("Audio-react").style.filter =
      "blur(0px) brightness(60%)";
    document.getElementById("current-track").style.filter =
      "blur(0px) brightness(120%)";
    optprev.style.opacity = "20%";
    opt.style.left = "-380px";

    optprevicns.forEach((elem) => {
      elem.style.animation = "";
    });

    MenuTimeout[4] = setTimeout(() => {
      opt.style.opacity = "30%";
      opt.style.display = "block";
    }, 100);
  }
}

function options(choice) {
  clearTimeout(MenuTimeout[5]);
  clearTimeout(MenuTimeout[6]);
  clearTimeout(MenuTimeout[7]);
  document.getElementById("side").style.pointerEvents = "none";
  document.getElementsByClassName("menu-icns").forEach((elem) => {
    elem.style.pointerEvents = "none";
    MenuTimeout[7] = setTimeout(() => {
      elem.style.pointerEvents = "all";
    }, parseInt(speeds[chosenSpeed][5]) + 400);
  });
  document.getElementsByClassName("options").forEach((elem) => {
    elem.style.pointerEvents = "none";
    setTimeout(() => {
      elem.style.pointerEvents = "all";
    }, parseInt(speeds[chosenSpeed][5]) + 400);
  });
  setTimeout(() => {
    document.getElementById("side").style.pointerEvents = "all";
  }, parseInt(speeds[chosenSpeed][5]) + 400);

  document.getElementById("app-title").style.filter =
    "blur(0px) brightness(100%)";
  document.getElementById("eq-menu").style.top = "-500px";
  document.getElementById("eq-menu").style.opacity = "0%";
  MenuTimeout[5] = setTimeout(() => {
    document.getElementById("eq-menu").style.display = "none";
  }, 1000);

  MenuTimeout[6] = setTimeout(() => {
    switch (choice) {
      case 1:
        {
          //document.getElementById('menu-folder').style.pointerEvents = 'none'
          document.getElementById("options").style.left = "-380px";
          document.getElementById("opt-menu1").style.opacity = "0%";
          document.getElementById("opt-preview").style.opacity = "0%";
          setTimeout(() => {
            document.getElementById("opt-menu2").style.display = "block";
            document.getElementById("div-selector").style.willChange =
              "scroll-position";
            setTimeout(() => {
              setTimeout(() => {
                document.getElementById("opt-preview").style.display = "none";
              }, 200);

              document.getElementById("options").style.left = "0%";
              let prevTransition =
                document.getElementById("opt-menu2").style.transition;
              document.getElementById(
                "opt-menu2"
              ).style.transition = `opacity ${speeds[chosenSpeed][1]}s ease-out`;
              document.getElementById("opt-menu2").style.opacity = "100%";
              setTimeout(() => {
                document.getElementById("opt-menu2").style.transition =
                  prevTransition;
              }, speeds[chosenSpeed][1]);
            }, 10);
          }, parseInt(speeds[chosenSpeed][5]));
        }
        break;

      case 2:
        {
          //document.getElementById('menu-add').style.pointerEvents = 'none'
          document.getElementById("options").style.left = "-380px";
          document.getElementById("opt-menu1").style.opacity = "0%";
          document.getElementById("opt-preview").style.opacity = "0%";
          setTimeout(() => {
            document.getElementById("opt-menu3").style.display = "block";
            setTimeout(() => {
              setTimeout(() => {
                document.getElementById("opt-preview").style.display = "none";
                //document.getElementById('opt-menu3').style.pointerEvents = 'all'
              }, 200);
              document.getElementById("options").style.left = "0%";
              console.log(speeds[chosenSpeed][5]);
              document.getElementById("opt-menu3").style.transition = `${
                document.getElementById("opt-menu3").style.transition
              }, opacity ${speeds[chosenSpeed[1]]} ease-out`;
              document.getElementById("opt-menu3").style.opacity = "100%";
            }, 10);
          }, parseInt(speeds[chosenSpeed][5]));
        }
        break;

      case 3:
        {
          document.getElementById("options").style.left = "-380px";
          document.getElementById("opt-menu1").style.opacity = "0%";
          document.getElementById("opt-menu3").style.opacity = "0%";
          document.getElementById("opt-preview").style.opacity = "0%";
          setTimeout(() => {
            document.getElementById("opt-menu4").style.display = "block";
            setTimeout(() => {
              setTimeout(() => {
                document.getElementById("opt-preview").style.display = "none";
              }, 200);

              document.getElementById("options").style.left = "0%";
              document.getElementById("opt-menu4").style.opacity = "100%";
            }, 10);
          }, parseInt(speeds[chosenSpeed][5]));
        }
        break;

      case 4:
        {
          document.getElementById("options").style.left = "-380px";
          document.getElementById("opt-menu1").style.opacity = "0%";
          document.getElementById("opt-menu3").style.opacity = "0%";
          document.getElementById("opt-preview").style.opacity = "0%";
          setTimeout(() => {
            document.getElementById("opt-menu5").style.display = "block";
            setTimeout(() => {
              setTimeout(() => {
                document.getElementById("opt-preview").style.display = "none";
              }, 200);

              document.getElementById("options").style.left = "0%";
              document.getElementById("opt-menu5").style.opacity = "100%";
            }, 10);
          }, parseInt(speeds[chosenSpeed][5]));
        }
        break;

      case 5:
        {
          if (document.getElementById("eq-menu").style.top === "-500px") {
            openMENU();
            document.getElementById("search-query").style.filter =
              "blur(5px) brightness(40%)";
            document.getElementById("search-query").style.pointerEvents =
              "none";
            document.getElementById("Audio-react").style.filter =
              "blur(5px) brightness(40%)";
            document.getElementById("current-track").style.filter =
              "blur(5px) brightness(10%)";
            document.getElementById("app-title").style.filter =
              "blur(5px) brightness(10%)";
            document.getElementById("options").style.left = "-380px";
            document.getElementById("opt-menu1").style.opacity = "0%";
            document.getElementById("opt-menu3").style.opacity = "0%";
            setTimeout(() => {
              document.getElementById("eq-menu").style.display = "block";
              setTimeout(() => {
                document.getElementById("eq-menu").style.display = "block";
                document.getElementById("eq-menu").style.top = "0px";
                document.getElementById("eq-menu").style.opacity = "100%";
              }, 10);
            }, 1000);
          } else {
            document.getElementById("eq-menu").style.top = "-500px";
            document.getElementById("eq-menu").style.opacity = "0%";
            setTimeout(() => {
              document.getElementById("eq-menu").style.display = "none";
            }, 1000);
          }
        }
        break;

      case 6:
        {
          document.getElementById("options").style.left = "-380px";
          document.getElementById("opt-menu1").style.opacity = "0%";
          document.getElementById("opt-menu3").style.opacity = "0%";
          document.getElementById("opt-preview").style.opacity = "0%";
          setTimeout(() => {
            document.getElementById("opt-menu6").style.display = "block";
            document.getElementById(
              "opt-menu6-child-container"
            ).style.willChange = "scroll-position";
            setTimeout(() => {
              setTimeout(() => {
                document.getElementById("opt-preview").style.display = "none";
              }, 200);

              document.getElementById("options").style.left = "0%";
              document.getElementById("opt-menu6").style.opacity = "100%";
            }, 10);
          }, parseInt(speeds[chosenSpeed][5]));
        }
        break;

      case 7:
        {
          document.getElementById("options").style.left = "-380px";
          document.getElementById("opt-menu1").style.opacity = "0%";
          document.getElementById("opt-menu6").style.opacity = "0%";
          document.getElementById("opt-preview").style.opacity = "0%";
          setTimeout(() => {
            document.getElementById("opt-menu7").style.display = "block";
            setTimeout(() => {
              setTimeout(() => {
                document.getElementById("opt-preview").style.display = "none";
              }, 200);

              document.getElementById("options").style.left = "0%";
              document.getElementById("opt-menu7").style.opacity = "100%";
            }, 10);
          }, parseInt(speeds[chosenSpeed][5]));
        }
        break;
    }
  }, 10);
}

function NextSong(audio, playlist, position, state, promise) {
  if (!reversed) {
    document.getElementById("current-track").childNodes.forEach((elem) => {
      let toppos =
        document.getElementById("current-track").childNodes[
          document.getElementById("current-track").childNodes.length - 1
        ].style.top;
      if (
        elem.id === "child-track" &&
        parseInt(toppos.replace("px", "")) < 280
      ) {
        let ipos = elem.style.top;
        let fpos = parseInt(ipos.replace("px", "")) + 150;
        elem.style.top = `${fpos}px`;
      }
    });
  } else {
    try {
      let bottompos =
        document.getElementById("current-track").childNodes[
          document.getElementById("current-track").childNodes.length - 1
        ].style.top;
      document.getElementById("current-track").childNodes.forEach((elem) => {
        if (
          elem.id === "child-track" &&
          parseInt(bottompos.replace("px", "")) > 290
        ) {
          let ipos = elem.style.top;
          let fpos = parseInt(ipos.replace("px", "")) - 150;
          elem.style.top = `${fpos}px`;
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
  if (playlist[position] !== undefined) {
    try {
      /*return new p5.SoundFile(
        playlist[position].url,
        promise ? promise : () => {},
        () => {
          corrupt = true;
        })*/
      audio.setPath(
        playlist[position].url,
        promise ? promise : () => {},
        () => {
          corrupt = true;
        }
      );
    } catch (e) {
      console.log("there was an error");
      console.log(e);
      return undefined;
    }
  } else {
    console.log("did not passed", position, playlist.length - 1, playlist);
    return undefined;
  }
}

function PrevSong(audio, playlist, position, state, promise, goback, initial) {
  let difference = position - initial;
  if (!goback) {
    if (!reversed) {
      let bottompos =
        document.getElementById("current-track").childNodes[3].style.top;
      document.getElementById("current-track").childNodes.forEach((elem) => {
        if (
          elem.id === "child-track" &&
          parseInt(bottompos.replace("px", "")) > 280
        ) {
          let ipos = elem.style.top;
          let fpos = parseInt(ipos.replace("px", "")) - 150;
          elem.style.top = `${fpos}px`;
        }
      });
    } else {
      let toppos =
        document.getElementById("current-track").childNodes[3].style.top;
      document.getElementById("current-track").childNodes.forEach((elem) => {
        if (
          elem.id === "child-track" &&
          parseInt(toppos.replace("px", "")) < 280
        ) {
          let ipos = elem.style.top;
          let fpos = parseInt(ipos.replace("px", "")) + 150;
          elem.style.top = `${fpos}px`;
        }
      });
    }
  } else {
    if (!reversed) {
      document.getElementById("current-track").childNodes.forEach((elem) => {
        if (elem.id === "child-track") {
          let ipos = elem.style.top;
          let fpos = parseInt(ipos.replace("px", "")) + 150 * difference;
          elem.style.top = `${fpos}px`;
        }
      });
    } else {
      try {
        document.getElementById("current-track").childNodes.forEach((elem) => {
          if (elem.id === "child-track") {
            let ipos = elem.style.top;
            let fpos = parseInt(ipos.replace("px", "")) - 150 * difference;
            elem.style.top = `${fpos}px`;
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  if (position > -1) {
    audio.setPath(playlist[position].url, promise ? promise : () => {}, () => {
      corrupt = true;
      goback = true;
    });
  } else {
    console.log("did not passed", position, playlist.length - 1);
    return undefined;
  }
}

function PlayPause(audio, state) {
  let btn = document.getElementById("play-pause");
  if (audio) {
    console.log(audio.isPlaying());
    if (!audio.isPlaying()) {
      document.getElementById("state-track").innerHTML = "Now Playing";
      document.getElementById("disk").style.animationPlayState = "running";
      btn.src = "./Addons/icons/play.png";
      audio.play();
    } else {
      document.getElementById("disk").style.animationPlayState = "paused";
      document.getElementById("state-track").innerHTML = "Paused";
      btn.src = "./Addons/icons/pause.png";
      audio.pause();
    }
  } else {
    if (state === "paused") {
      document.getElementById("state-track").innerHTML = "Now Playing";
      document.getElementById("disk").style.animationPlayState = "running";
      btn.src = "./Addons/icons/play.png";
      //audio.play()
    } else {
      document.getElementById("disk").style.animationPlayState = "paused";
      document.getElementById("state-track").innerHTML = "Paused";
      btn.src = "./Addons/icons/pause.png";
      //audio.pause()
    }
  }
}

function MoveToCurrent(url, playlist) {
  let array = document.getElementById("current-track").childNodes;
  let childarray = [];
  let position = 0;
  if (!reversed) {
    playlist.forEach((elem) => {
      if (elem.url === url) {
        position = playlist.indexOf(elem);
      }
    });

    array.forEach((elem) => {
      if (elem.id === "child-track") {
        childarray.push(elem);
      }
    });

    array.forEach((elem) => {
      if (elem.id === "child-track") {
        let ipos = elem.style.top;
        let fpos = parseInt(ipos.replace("px", "")) + 150 * position;
        elem.style.top = `${fpos}px`;
      }
    });

    return position;
  } else {
    playlist.forEach((elem) => {
      if (elem.url === url) {
        position = playlist.indexOf(elem);
      }
    });

    array.forEach((elem) => {
      if (elem.id === "child-track") {
        childarray.push(elem);
      }
    });
    array.forEach((elem) => {
      if (elem.id === "child-track") {
        let ipos = elem.style.top;
        let fpos = parseInt(ipos.replace("px", "")) - 150 * position;
        elem.style.top = `${fpos}px`;
      }
    });

    return position;
  }
}

function PlayShuffleSong(
  audio,
  playlist,
  position,
  initialPos,
  difference,
  promise
) {
  if (!reversed) {
    document.getElementById("current-track").childNodes.forEach((elem) => {
      if (elem.id === "child-track") {
        let ipos = elem.style.top;
        let fpos = parseInt(ipos.replace("px", "")) + 150 * difference;
        elem.style.top = `${fpos}px`;
      }
    });
  } else {
    try {
      document.getElementById("current-track").childNodes.forEach((elem) => {
        if (elem.id === "child-track") {
          let ipos = elem.style.top;
          let fpos = parseInt(ipos.replace("px", "")) - 150 * difference;
          elem.style.top = `${fpos}px`;
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
  if (playlist[position] !== undefined) {
    /*return new p5.SoundFile(playlist[position].url,
      promise ? promise : () => {},
      () => {
        corrupt = true;
      })*/
    audio.setPath(playlist[position].url, promise ? promise : () => {}, () => {
      corrupt = true;
    });
  } else {
    console.log("did not passed", position, playlist.length - 1, playlist);
    return undefined;
  }
}
