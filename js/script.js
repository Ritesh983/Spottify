console.log('lets write javascript');
let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`)
  let response = await a.text()
  //console.log(response)
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }

  }

  // show all songs in the playlist
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                <div class="info">
                  <div> ${song.replaceAll("%20", " ")}</div>
                  <div>Ritesh</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="img/play.svg" alt="">
                </div> </li>`;
  }

  // Attach an eventListener to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      //console.log(e.querySelector(".info").firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
  })
  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currfolder}/` + track
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }


  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"



}


async function displayAlbums() {
  let a = await fetch(`/songs/`);
let response = await a.text();
// console.log(response);
let div = document.createElement("div");
div.innerHTML = response;
let anchors = div.getElementsByTagName("a");
let cardContainer = document.querySelector(".cardContainer")

let array = Array.from(anchors)
for (let index = 0; index < array.length; index++) {
  const e = array[index];
  // Check if the href contains "/songs" but not any deeper nested paths (like subfolders or files)
  let folderPath = e.href.split("/");
  if (e.href.includes("/songs") && folderPath.length === 5) {
    let folder = folderPath.slice(-1)[0];
    let a = await fetch(`/songs/${folder}/info.json`);
    let response = await a.json();
    console.log(response)
    cardContainer.innerHTML= cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 30 30"
                  fill="currentColor"
                  width="100"
                  height="100"
                >
                  <circle cx="15" cy="15" r="14" fill="#1fdf64" />
                  <path
                    d="M10 21V9C10 8.44772 10.5585 8.13971 11.03 8.41257L21.6432 14.152C22.1349 14.4436 22.1349 15.5563 21.6432 15.848L11.03 21.5874C10.5585 21.8603 10 21.5523 10 21Z"
                    fill="black"
                  />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpeg" alt="" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
  }
}
  
// Load the playlist whenever card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e => {
  e.addEventListener("click", async item => {
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    playMusic(songs[0])
  })
})

}

async function main() {

  // get the list of all song
  await getSongs("songs/Arijit_Singh")
  playMusic(songs[0], true)

  // Display all the albums on the page
  displayAlbums()

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play()
      play.src = "img/pause.svg"
    }
    else {
      currentSong.pause()
      play.src = "img/play.svg"
    }
  })

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  })

  // Add Event Listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  })

  // Add Event Listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  })

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    //console.log("Previous clicked")
    let index = songs.indexOf((currentSong.src.split("/").slice(-1))[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  })

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    //console.log("next clicked");
    let index = songs.indexOf((currentSong.src.split("/").slice(-1))[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  })


  // Add an event listener to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    // console.log("setting volume to",e.target.value,"/100")  
    currentSong.volume = parseInt(e.target.value) / 100;
    if(currentSong.volume > 0){
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
    }
  })

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click",e=>{
    // console.log(e.target)
    // console.log("changing", e.target.src)

    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume=0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }
    else{
      e.target.src = e.target.src.replace("mute.svg","volume.svg")
      currentSong.volume=.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value=10;
    
    }
  })

}

main()