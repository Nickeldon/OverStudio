var theme = localStorage.getItem("theme") || "default";
localStorage.setItem("theme", theme);

const themes = {
  default: {
    backgroundImage: "linear-gradient(rgba(55, 235, 169, 0.85), #5b37eb)",
    text: "linear-gradient(to right, rgb(255, 255, 255), #73aafa, #7ed1fb, #86ecfc)",
    icon: "grayscale(0%) invert(0%)",
    highlight: {
      background: "lightblue",
      color: "gray"
    }
  },
  dark: {
    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.881), #545454)",
    text: "linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.2))",
    icon: "grayscale(100%) invert(0%)",
    highlight: {
      background: "lightblue",
      color: "white"
    }
  },
  orangeRed: {
    backgroundImage: "linear-gradient(rgba(235, 181, 55, 0.85), #eb3737)",
    text: "linear-gradient(to right, rgb(255, 255, 255), #ff8e8e, #e83f3f, #f8892e)",
    icon: "grayscale(0%) invert(1)",
    highlight: {
      background: "rgb(192, 125, 0)",
      color: "white"
    }
  },
  pinkPurple: {
    backgroundImage: "linear-gradient(rgba(166, 55, 235, 0.85), #eb37c9)",
    text: "linear-gradient(to right, rgb(255, 255, 255), #fa73ef, #cd7efb, #2b1f9c)",
    highlight: {
      background: "rgb(168, 13, 126)",
      color: "white"
    }
  },
};
function changeTheme(theme) {
  if (theme !== "Vintage") {
    document
      .getElementById("vintage-filter")
      .classList.remove("vintage-filter");
    //console.log(document.querySelectorAll('input'))
    document.querySelectorAll("input").forEach((input) => {
      input.style.setProperty("--selBGcolor", themes[theme].highlight.background);
      input.style.setProperty("--selTxtcolor", themes[theme].highlight.color);
    });
    document.getElementById("gradient").style.backgroundImage =
      themes[theme].backgroundImage;
    document.querySelector(".nav-bar h1").style.background = themes[theme].text;
    document.querySelector(".nav-bar h1").style.webkitBackgroundClip = "text";
    document.getElementById("timeslide").style.backgroundImage =
      themes[theme].text;
    document
      .getElementById("timeslide")
      .style.setProperty("--bgthumb", themes[theme].backgroundImage);
    var presenttheme = document.querySelector(".side img");
    presenttheme.style.filter = themes[theme].icon || presenttheme.style.filter;

    /*presenttheme.addEventListener('hover', () => {
        presenttheme.style.cursor = 'pointer';
        presenttheme.style.transform= 'scale(0.95) rotate(20deg)';
        presenttheme.style.filter= 'blur(0.5px) grayscale(70%)'
    })*/
  } else {
    document.getElementById("vintage-filter").classList.add("vintage-filter");
  }
}

changeTheme(theme);
