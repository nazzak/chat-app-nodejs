const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form"); //$ for convention : is an element from the DOM
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");

const $sendLocationButton = document.querySelector("#send-location");

const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
// Options
const { username, room } = Qs.parse(
  location.search,
  /* remove ? mark */ { ignoreQueryPrefix: true }
);

// For auto scroll
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  //get height of the last message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have I scrolled ?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", ({ username, text, createdAt }) => {
  console.log(text);
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format("h:mm:ss a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", ({ username, url, createdAt }) => {
  console.log(url);
  const html = Mustache.render(locationMessageTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format("h:mm:ss a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

document.getElementById("message-form").onsubmit = (event) => {
  event.preventDefault(); //avoid refresh fullpage
  //disable
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = event.target.elements.message.value; //document.querySelector("input").value;
  socket.emit(
    "sendMessage",
    message,
    /*ack when message delivered*/ (error) => {
      //enable
      $messageFormButton.removeAttribute("disabled");
      //clear message, and focus on input again
      $messageFormInput.value = "";
      $messageFormInput.focus();

      if (error) {
        return console.log(error);
      }

      return console.log("The message was delivered");
    }
  );
};

document.getElementById("send-location").onclick = () => {
  // check if geolation API supported
  if (!navigator.geolocation) {
    return alert("Geolocation not supported");
  }

  //disable button and wait
  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    //console.log(position);
    socket.emit(
      "sendLocation",
      {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      },
      () => {
        //re-enable button
        $sendLocationButton.removeAttribute("disabled");

        console.log("Location sent to the console");
      }
    );
  });
};

// The user select the room and get error to report to user
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    // send them to root path
    location.href = "/";
  }
});
