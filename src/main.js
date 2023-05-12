import { CLIENT_ID, REDIRECT_URI } from "env";

const spinnerElement = document.querySelector(".spinner-icon");
const notSignedInElement = document.getElementById("not-signed-in-screen");
const signedInElement = document.getElementById("signed-in-screen");
const loginButtonElement = document.getElementById("login-button");
const logoutButtonElement = document.getElementById("logout-button");

const profileContainerElement = document.getElementById("profile-container");
const profileImageElement = document.getElementById("profile-image");
const popupElement = document.getElementById("profile-popup");
const usernameElement = document.getElementById("username");

// set href of login button to url when page loads
loginButtonElement.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=identify%20guilds`;

function hideLoadingSpinner() {
  spinnerElement.classList.add("hidden");
}

function showLoadingSpinner() {
  spinnerElement.classList.remove("hidden");
}

function showLoginButton() {
  loginButtonElement.classList.remove("hidden");
}

function hideNotSignedIn() {
  notSignedInElement.classList.add("hidden");
}

function showNotSignedIn() {
  notSignedInElement.classList.remove("hidden");
}

function showSignedIn() {
  signedInElement.classList.remove("hidden");
}

function hideSignedIn() {
  signedInElement.classList.add("hidden");
}

function showProfileContainer() {
  profileContainerElement.classList.remove("hidden");
}

function hideProfileContainer() {
  profileContainerElement.classList.add("hidden");
}

logoutButtonElement.addEventListener("click", () => {
  logoutUser();
});

document.addEventListener("click", (event) => {
  if (!popupElement.contains(event.target) && event.target !== profileImageElement) {
    popupElement.style.display = "none";
  }
});

function logoutUser() {
  localStorage.removeItem("token");
  hideProfileContainer();
  hideSignedIn();
  showLoginButton();
  showNotSignedIn();

  // remove all elements in guilds container
  const guildsContainer = document.getElementById("guilds-container");
  while (guildsContainer.firstChild) {
    guildsContainer.removeChild(guildsContainer.firstChild);
  }

  // remove all elements in features container
  const featuresContainer = document.getElementById("features-container");
  while (featuresContainer.firstChild) {
    featuresContainer.removeChild(featuresContainer.firstChild);
  }

  getToken();
}

function getUserProfile(token) {
  fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      // throw if not ok
      if (!response.ok) {
        throw new Error("Not ok");
      }
      return response.json();
    })
    .then((user) => displayUser(user))
    .then(() => getGuilds(token))
    .catch((error) => {
      console.error(error);
      localStorage.removeItem("token");
      getToken();
    });
}

function displayUser(user) {
  profileImageElement.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  usernameElement.textContent = user.username;
  showProfileContainer();
}

function getGuilds(token) {
  fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      // throw if not ok
      if (!response.ok) {
        throw new Error("Not ok");
      }
      return response.json();
    })
    .then((guilds) => displayGuilds(guilds))
    .catch((error) => {
      console.error(error);
      localStorage.removeItem("token");
      getToken();
    });
}

function getToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  // remove params from url
  window.history.replaceState({}, document.title, window.location.pathname);
  if (accessToken) {
    localStorage.setItem("token", accessToken);
    getUserProfile(accessToken);
  } else {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      getUserProfile(savedToken);
    } else {
      // just show login button
      hideLoadingSpinner();
      showLoginButton();
    }
  }
}

getToken();

function displayGuilds(guilds) {
  hideLoadingSpinner();
  hideNotSignedIn();
  showSignedIn();

  const guildsContainer = document.getElementById("guilds-container");

  const featuresContainer = document.getElementById("features-container");

  const searchBox = document.getElementById("search-box");

  const getGuildFeatures = (guild) => guild.features.map((feature) => feature.toLowerCase());

  const uniqueFeatures = guilds
    .map(getGuildFeatures)
    .flat()
    .filter((feature, index, array) => array.indexOf(feature) === index);

  const filterGuilds = (feature) => {
    featuresContainer.querySelectorAll(".feature-chip").forEach((chip) => {
      if (chip.textContent.toLowerCase() === feature) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
    guildsContainer.querySelectorAll(".guild-info").forEach((guildInfo) => {
      if (guildInfo.dataset.features.includes(feature)) {
        guildInfo.classList.remove("hidden");
      } else {
        guildInfo.classList.add("hidden");
      }
    });
  };

  uniqueFeatures.forEach((feature) => {
    const featureChip = document.createElement("span");
    featureChip.classList.add("feature-chip");
    featureChip.textContent = feature;
    featureChip.addEventListener("click", () => {
      if (featureChip.classList.contains("active")) {
        featureChip.classList.remove("active");
        guildsContainer.querySelectorAll(".guild-info").forEach((guildInfo) => {
          guildInfo.classList.remove("hidden");
        });
      } else {
        filterGuilds(feature);
        featuresContainer.querySelectorAll(".feature-chip").forEach((chip) => {
          if (chip.textContent.toLowerCase() === feature) {
            chip.classList.add("active");
          } else {
            chip.classList.remove("active");
          }
        });
      }
    });
    featuresContainer.appendChild(featureChip);
  });

  searchBox.addEventListener("input", () => {
    const searchValue = searchBox.value.trim().toLowerCase();
    guildsContainer.querySelectorAll(".guild-info").forEach((guildInfo) => {
      if (guildInfo.dataset.features.includes(searchValue)) {
        guildInfo.classList.remove("hidden");
      } else {
        guildInfo.classList.add("hidden");
      }
    });
  });

  guilds.forEach((guild) => {
    const guildInfo = document.createElement("div");

    const iconImageUrl = guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : "./unknown-icon.png";

    let guildFeatureElements = "";
    guild.features.forEach((feature) => {
      guildFeatureElements += "<span>" + feature + "</span>";
    });

    let guildPermissionTags = "";
    if (guild.owner) {
      guildPermissionTags += '<span class="permissions-tag">OWNER</span>';
    }
    if (!guild.owner && (guild.permissions & 0x8) === 0x8) {
      guildPermissionTags += '<span class="permissions-tag">ADMIN</span>';
    }

    guildInfo.classList.add("guild-info");
    guildInfo.dataset.features = getGuildFeatures(guild).join(",");
    guildInfo.innerHTML = `
      <h2>${guild.name} ${guildPermissionTags}</h2>
      <img src="${iconImageUrl}">
      <h3>Features</h3>
      <div class="guild-info-features-container">${guildFeatureElements}</div>
      `;
    guildsContainer.appendChild(guildInfo);
  });
}

profileImageElement.addEventListener("click", () => {
  popupElement.style.display = "block";
});

if (!window.IS_PRODUCTION) {
  new EventSource("/esbuild").addEventListener("change", () => location.reload());
}
