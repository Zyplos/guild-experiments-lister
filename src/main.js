import { CLIENT_ID, REDIRECT_URI } from "env";

const spinnerElement = document.querySelector(".spinner-icon");
const notSignedInElement = document.getElementById("not-signed-in-screen");
const signedInElement = document.getElementById("signed-in-screen");
const loginButtonElement = document.getElementById("login-button");

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

function showSignedIn() {
  signedInElement.classList.remove("hidden");
}

// redirect to discord login when login button is clicked
loginButtonElement.addEventListener("click", () => {
  window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=identify%20guilds`;
});

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
    getGuilds(accessToken);
  } else {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      getGuilds(savedToken);
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

    guildInfo.classList.add("guild-info");
    guildInfo.dataset.features = getGuildFeatures(guild).join(",");
    guildInfo.innerHTML = `
      <h2>${guild.name}</h2>
      <img src="${iconImageUrl}">
      <p>Owner: ${guild.owner ? "Yes" : "No"}</p>
      <p>Features: ${guild.features.join(", ")}</p>
      `;
    guildsContainer.appendChild(guildInfo);
  });
}

if (!window.IS_PRODUCTION) {
  new EventSource("/esbuild").addEventListener("change", () => location.reload());
}
