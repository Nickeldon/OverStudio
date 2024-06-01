let PORT = localStorage.getItem("Base_PORT") || 8000;
const ws = new WebSocket(`ws://localhost:${PORT}`);
var data;
var SETBypassBGScan = false;

ws.addEventListener("message", (response) => {
  data = JSON.parse(response.data);
  PORT = data.PORT;
  console.log("Received new port: ", PORT);
});

var paths = [];
var finalArray = [];
var reversed = false;
var reversed = /true/.test(localStorage.getItem("reversed")) || false;
localStorage.setItem("reversed", reversed);
var ready = false;

function BGErrHandle() {
  document.getElementById("BG-choice-txt0").innerText = "BlobReactor";
  localStorage.setItem("Background-Type", "BlobReactor");
  setTimeout(() => {
    window.location.reload();
  }, 100);
}

function AutoUpdateSource() {
  fetch("http://localhost:8000/AutoUpdater", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    console.log(res);
  });
}

async function GetYoutubeData(title) {
  if (title) {
    try {
      //let data = await fetch(`http://localhost:${PORT}/getThumbnail?title=${JSON.stringify(title)}`)

      $.getJSON(
        `http://localhost:${PORT}/getThumbnail?title=${JSON.stringify(title)}`,
        (data) => {
          if (data) {
            return data;
          } else {
            return null;
          }
        }
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

function shuffleArray(array) {
  //From StackOverflow
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function GenerateSearchResults(resArray) {
  //console.log(resArray)
  const finalSearchArray = [];
  deleteSearchResults().then(() => {
    resArray.forEach((item) => {
      finalSearchArray.push({
        title: item?.title || "Unknown",
        artist: item?.artist || "Unknown",
        id: item?.id || 0,
      });
    });

    let parentContainer = document.getElementById("search-track");
    parentContainer.style.display = "block";

    finalSearchArray.forEach((result, index) => {
      let resultquery = document.createElement("div");
      resultquery.style.width = "100%";
      resultquery.style.height = "80px";
      resultquery.style.paddingBottom = "20px";
      if (index === 0) {
        resultquery.style.marginTop = "25%";
      } else if (index === finalSearchArray.length - 1) {
        resultquery.style.marginBottom = "25%";
      } else {
        resultquery.style.marginTop = "20px";
        resultquery.style.marginBottom = "20px";
      }
      resultquery.style.marginLeft = "0px";
      resultquery.style.position = "relative";
      resultquery.style.paddingTop = "20px";
      resultquery.style.backgroundColor = "rgba(255, 255, 255, 0.0)";
      resultquery.style.borderRadius = "10px";
      resultquery.style.transition = "all 1s ease-out";
      resultquery.onmouseover = () => {
        resultquery.style.cursor = "pointer";
        resultquery.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        resultquery.style.marginLeft = "30px";
      };
      resultquery.onmouseout = () => {
        resultquery.style.cursor = "default";
        resultquery.style.backgroundColor = "rgba(255, 255, 255, 0.0)";
        resultquery.style.marginLeft = "0px";
      };
      let currentresult = result
      resultquery.onclick = () => {
        document.getElementById("current-track").style.opacity = "100%";
        document.getElementById("search-track").style.opacity = "0%";
        document.getElementById("search-query-txtInput").value = "";
        if (document.getElementById("search-query").style.width == "600px")
          document.querySelector(".search-query i").click();

        deleteSearchResults()

        concludeSearch(currentresult.title, currentresult.artist, currentresult.id);
      };

      let resulttitle = document.createElement("h3");
      resulttitle.innerHTML = result["title"];
      resulttitle.style.fontFamily = "PS, sans-serif";
      resulttitle.style.textAlign = "left";
      resulttitle.style.marginTop = "20px";
      resulttitle.style.marginLeft = "10px";
      resulttitle.style.color = "white";
      resulttitle.style.fontSize = "30px";
      resulttitle.style.transition = "all 1s ease-out";
      resulttitle.style.overflow = "hidden";
      resulttitle.style.textOverflow = "ellipsis";
      resulttitle.style.whiteSpace = "nowrap";
      resulttitle.style.width = "80%";

      let breakline = document.createElement("br");
      resulttitle.appendChild(breakline);

      let resultartist = document.createElement("span");
      resultartist.innerHTML = result["artist"];
      console.log(resultartist.innerHTML);
      resultartist.style.fontFamily = "PS, sans-serif";
      resultartist.style.color = "white";
      resultartist.style.fontSize = "17px";
      resultartist.style.filter = "invert(50%)";
      resultartist.style.transition = "all 1s ease-out";
      resultartist.style.overflow = "hidden";
      resultartist.style.textOverflow = "ellipsis";
      resultartist.style.whiteSpace = "nowrap";
      resultartist.style.width = "200px";

      resulttitle.appendChild(resultartist);

      resultquery.appendChild(resulttitle);

      parentContainer.appendChild(resultquery);
    });

    document.getElementById("current-track").style.opacity = "0%";
    document.getElementById("search-track").style.opacity = "80%";

    console.log(finalSearchArray);
  });
}

async function addPlaylist() {
  var response = "ok";
  try {
    var path = document.getElementById("div-inp").files[0].path;
    path = path.replace(/\\/g, "/").split("/");
    path = path.filter((el) => el !== path[path.length - 1]);
    var link = "";
    path.forEach((segm) => {
      link += segm + "/";
    });
    try {
      const res = await fetch(
        `http://localhost:${PORT}/addPL?METADATA=${JSON.stringify(link)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      switch (res.status) {
        case 204:
          {
            response = "ok";
            try {
              var filtered = FilterArray(
                document.getElementById("current-track").childNodes
              );
              console.log(document.getElementById("current-track").childNodes);
              document
                .getElementById("current-track")
                .childNodes.forEach((elem) => {
                  if (elem.id === "child-track") {
                    elem.style.transition = "opacity .5s ease-out";
                    setTimeout(() => {
                      elem.style.opacity = "0%";
                      elem.style.display = "none";
                      document
                        .getElementById("current-track")
                        .removeChild(elem);
                      elem.remove();
                    }, 500);
                  }
                });

              setTimeout(() => {
                filtered.forEach((elem) => {
                  document.getElementById("current-track").appendChild(elem);
                });
              }, 100);

              document
                .getElementById("div-selector")
                .childNodes.forEach((elem) => {
                  elem.style.transition = "opacity .1s ease-out";
                  if (elem.id === "child-div") {
                    elem.style.opacity = "0%";
                    setTimeout(() => {
                      document.getElementById("div-selector").removeChild(elem);
                    }, 100);
                  }
                });
            } catch (e) {
              console.error("could not filter array", e);
            }
            console.log("err2");
            document.getElementById("div-selector").style.opacity = "80%";
            document.getElementById("no-div-err").style.opacity = "0%";
            document.getElementById("div-set-filter").style.opacity = "30%";
          }
          break;

        case 207:
          {
            response = "AlreadyExists";
            displayERR();
            console.log("Already exists");
          }
          break;

        case 206:
          {
            response = "failed";
            console.log("Nothing");
          }
          break;
      }
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.log(e);
  }
  document.getElementById("div-inp").value = null;
  return response;
}

async function deletePLCache() {
  if (document.getElementById("div-selector").childNodes.length > 1) {
    var PLnodes = document.getElementById("div-selector").childNodes;

    PLnodes.forEach((elem) => {
      if (elem.nodeName !== "#text") {
        try {
          elem.style.transition = "opacity 0.2s";
          elem.style.opacity = "0%";
          setTimeout(() => {
            elem.style.display = "none";
            try {
              document.getElementById("div-selector").removeChild(elem);
            } catch (e) {
              console.log(e);
            }
          }, 200);
        } catch (e) {
          console.log(e);
        }
      }
    });
  }
  var listnodes = document.getElementById("current-track");
  while (listnodes.lastElementChild) {
    document
      .getElementById("current-track")
      .removeChild(listnodes.lastElementChild);
  }
}

async function deleteSearchResults() {
  var listnodes = document.getElementById("search-track");
  while (listnodes.lastElementChild) {
    if(listnodes.lastElementChild.id !== "no-result-scr")
    document
      .getElementById("search-track")
      .removeChild(listnodes.lastElementChild);
    else break;
  }
}

function FilterArray(array) {
  const uelem = new Set();

  array.forEach((item) => {
    if (!uelem.has(item.id)) {
      uelem.add(item);
    }
  });

  return Array.from(uelem);
}

function deldiv(nbr, link) {
  fetch(`http://localhost:${PORT}/delPath?link=${link}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      switch (res.status) {
        case 201:
          {
            document.getElementById(`child-div-${nbr}`).style.opacity = "0%";
            setTimeout(() => {
              document.getElementById(`child-div-${nbr}`).remove();
              SETBypassBGScan = true;
              document.getElementById("Refresh").click();

              setTimeout(() => {
                var trackarray = [];
                document
                  .getElementById("current-track")
                  .childNodes.forEach((elem) => {
                    if (elem.id === "child-track") {
                      trackarray.push(elem);
                    }
                  });
                if (trackarray.length === 0) {
                  if (
                    document.getElementById("opt-menu2").style.display ===
                    "block"
                  )
                    localStorage.setItem("PlMenuOpened", true);
                  else localStorage.setItem("PlMenuOpened", false);
                  localStorage.setItem("emptyreload", true);
                  console.log("emptyreload 0");
                  window.location.reload();
                }
              }, 500);
            }, 500);
          }
          break;

        case 206:
          {
            console.log("failed to delete");
          }
          break;

        case 205:
          {
            document.getElementById(`child-div-${nbr}`).style.opacity = "0%";
            setTimeout(() => {
              document.getElementById(`child-div-${nbr}`).remove();
              //console.log('err3')
              document.getElementById("no-div-err").style.opacity = "80%";
              document.getElementById("div-set-filter").style.opacity = "0%";
              document.getElementById("div-selector").style.opacity = "0%";
              SETBypassBGScan = true;
              document.getElementById("Refresh").click();
              setTimeout(() => {
                var trackarray = [];
                document
                  .getElementById("current-track")
                  .childNodes.forEach((elem) => {
                    if (elem.id === "child-track") {
                      trackarray.push(elem);
                    }
                  });
                if (trackarray.length === 0) {
                  if (
                    document.getElementById("opt-menu2").style.display ===
                    "block"
                  )
                    localStorage.setItem("PlMenuOpened", true);
                  else localStorage.setItem("PlMenuOpened", false);
                  localStorage.setItem("emptyreload", true);
                  console.log("emptyreload 1");
                  window.location.reload();
                }
              }, 500);
            }, 500);
          }
          break;
      }
    })
    .catch((e) => console.error(e));
}

function getFullDataNode(raw) {
  const FileFormat = raw.File_format;
  const main = document.createElement("div");
  main.className = "child-track";
  main.id = "child-track";
  main.style.position = "absolute";
  main.style.width = "100%";
  main.style.height = "110px";
  const imgparent = document.createElement("i");
  const img = document.createElement("img");
  img.src = raw.image || "./Addons/icons/help.png";
  img.style.maxWidth = "110px";
  img.style.maxHeight = "110px";
  img.style.height = "110px";
  img.style.position = "absolute";
  img.style.left = "0";
  img.style.transition = "all 1s ease-out";
  img.style.filter = "invert(30%)";
  img.style.borderRadius = "5px";
  imgparent.appendChild(img);

  const info = document.createElement("div");
  info.style.position = "absolute";
  info.style.left = "130px";
  info.style.top = "0";
  info.style.width = "70%";
  info.style.height = "110px";
  info.style.overflow = "hidden";
  const title = document.createElement("h3");
  title.style.fontFamily = "PS, sans-serif";
  title.style.position = "absolute";
  title.style.overflow = "hidden";
  title.style.textOverflow = "ellipsis";
  title.style.whiteSpace = "nowrap";
  title.style.width = "100%";
  title.style.top = "15px";
  title.style.left = "20px";
  title.style.color = "white";
  title.style.fontSize = "25px";
  title.style.filter = "invert(30%)";
  title.style.transition = "all 1s ease-out";
  title.innerHTML = raw.title || "Unknown";
  title.className = "current-track-title";
  const artist = document.createElement("h3");
  artist.style.fontFamily = "PS, sans-serif";
  artist.style.position = "absolute";
  artist.style.top = "50px";
  artist.style.left = "20px";
  artist.style.color = "white";
  artist.style.fontSize = "15px";
  artist.style.filter = "invert(60%)";
  artist.style.transition = "all 1s ease-out";
  artist.innerHTML = raw.artist || "Unknown";
  artist.className = "current-track-artist";
  const album = document.createElement("h3");
  album.style.fontFamily = "PS, sans-serif";
  album.style.position = "absolute";
  album.style.top = "80px";
  album.style.left = "20px";
  album.style.color = "white";
  album.style.fontSize = "15px";
  album.style.filter = "invert(60%)";
  album.style.transition = "all 1s ease-out";
  album.innerHTML = raw.album || "Unknown";
  album.style.overflow = "hidden";
  album.style.textOverflow = "ellipsis";
  album.style.whiteSpace = "nowrap";
  album.style.width = "200px";
  const format = document.createElement("h3");
  format.style.fontFamily = "PS, sans-serif";
  format.style.position = "absolute";
  format.style.top = "80px";
  format.style.right = "20px";
  format.style.color = "white";
  format.style.fontSize = "20px";
  format.style.fontWeight = "100";
  format.style.filter = "invert(60%)";
  format.style.transition = "all 1s ease-out";
  format.innerHTML = FileFormat || ".unk";
  info.appendChild(title);
  info.appendChild(artist);
  info.appendChild(album);
  info.appendChild(format);
  main.appendChild(info);
  main.appendChild(imgparent);
  main.style.transition = "all 2s ease-out opacity .2s ease-out";
  //main.style.transition = 'opacity .1s ease-out'

  return main;
}

function ManageData(data) {
  //console.log(data)
  //console.log(data[0])

  var paths_count = 0;
  if (data[0].length == 0) {
    document.getElementById("div-selector").childNodes.forEach((elem) => {
      if (elem.id.includes("child-div")) {
        paths_count++;
      }
    });
  }

  if (paths_count > 0) {
    console.log("higher");
  }

  console.log(paths_count, data[1].length);
  if (data[0].length > 0 || data[1].length > paths_count) {
    var iter = 0;
    data[1].forEach((link) => {
      iter++;
      var Path = link.replace(/\\/g, "/").split("/");
      const tempPath = link;

      const choicetxt = document.createElement("h2");
      choicetxt.style.fontFamily = "PS, sans-serif";
      choicetxt.style.position = "absolute";
      choicetxt.style.marginTop = `${iter * 5}px`;
      choicetxt.style.left = "20px";
      choicetxt.innerHTML = Path[Path.length - 2] + "/";

      const span = document.createElement("span");
      span.style.fontFamily = "PS, sans-serif";
      span.style.color = "rgb(139, 24, 24)";
      span.innerHTML = Path[Path.length - 1];

      choicetxt.appendChild(span);

      const choicebtn = document.createElement("i");
      choicebtn.style.position = "absolute";
      choicebtn.classList.add("div-btn");
      choicebtn.style.marginTop = `${iter * 5}px`;
      choicebtn.style.right = "20px";
      choicebtn.style.height = "fit-content";
      choicebtn.style.width = "fit-content";

      const delicon = document.createElement("img");
      delicon.src = "./Addons/icons/delete.png";
      const tempcount = iter;
      delicon.onclick = () => {
        deldiv(tempcount, tempPath);
      };
      delicon.style.height = "30px";

      choicebtn.appendChild(delicon);

      const div = document.createElement("div");
      div.id = `child-div-${tempcount}`;
      div.style.transition = "all .5s ease-out";
      div.className = "child-div";
      div.style.marginTop = "15px";
      div.style.marginBottom = "50px";
      div.style.height = "40px";
      div.style.width = "100%";

      div.appendChild(choicetxt);
      div.appendChild(choicebtn);

      document.getElementById("div-selector").appendChild(div);
    });
    var altiter = 0;
    data[0].forEach((elem) => {
      altiter++;
      const child = getFullDataNode(elem);
      //console.log(child)

      if (!reversed) {
        child.style.top = 430 - 150 * altiter + "px";
      } else {
        child.style.top = 140 + 150 * altiter + "px";
      }
      document.getElementById("current-track").appendChild(child);
      setTimeout(() => {
        ready = true;
      }, 100);
    });
  } else {
    if (data[1].length == 0) {
      // console.log('err1')
      document.getElementById("no-div-err").style.opacity = "80%";
      document.getElementById("div-set-filter").style.opacity = "0%";
      document.getElementById("div-selector").style.opacity = "0%";
    }
  }
}

async function fetchPlaylist() {
  const data = await fetch(`http://localhost:${PORT}/ParseLinks`);
  try {
    return await data.json();
  } catch (e) {
    if (e.message !== "Unexpected end of JSON input") {
      console.log(e);
    }
    return [[], []];
  }
}

function getMetadataDB(element) {
  const url = `https://theaudiodb.com/api/v1/json/DAAEB/searchtrack.php?s=coldplay&t=yellow`;
  fetch(url)
    .then((res) => {
      console.log(res);
      res.json();
    })
    .then((mes) => {
      console.log(mes);
    })
    .catch((e) => console.error(e));
}
