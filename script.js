// ---------- Background video and music ----------
const video = document.getElementById("bgVideo");
const unlockEvents = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
  "scroll",
];

function unlockSound() {
  video.muted = false;
  video.volume = 1;
  video.play().catch(function () {});
  removeUnlockListeners();
}

function addUnlockListeners() {
  unlockEvents.forEach(function (evt) {
    window.addEventListener(evt, unlockSound);
  });
}

function removeUnlockListeners() {
  unlockEvents.forEach(function (evt) {
    window.removeEventListener(evt, unlockSound);
  });
}

function startVideo() {
  video.muted = false;
  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.catch(function () {
      // Browser blocked autoplay with sound.
      // Start muted, then unmute on the first tap or scroll.
      video.muted = true;
      video.play().catch(function () {});
      addUnlockListeners();
    });
  }
}

video.addEventListener("error", function () {
  document.body.classList.add("no-video");
});

// Try to start right away, and again as soon as enough data is ready
startVideo();
video.addEventListener("loadeddata", startVideo, { once: true });

// ---------- Profile photo switching (every .js-photo element) ----------
document.querySelectorAll(".js-photo").forEach(function (img) {
  const photos = (img.dataset.photos || "")
    .split(",")
    .map(function (p) {
      return p.trim();
    })
    .filter(Boolean);

  const interval = parseInt(img.dataset.interval, 10) || 2000;

  if (photos.length === 0) {
    return;
  }

  photos.forEach(function (src) {
    const preload = new Image();
    preload.src = src;
  });

  img.src = photos[0];

  if (photos.length > 1) {
    let index = 0;
    setInterval(function () {
      index = (index + 1) % photos.length;
      img.style.opacity = "0";
      setTimeout(function () {
        img.src = photos[index];
        img.style.opacity = "1";
      }, 300);
    }, interval);
  }

  img.addEventListener("error", function () {
    img.style.opacity = "0.3";
  });
});

// ---------- Scroll reveal animation ----------
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  revealItems.forEach(function (el) {
    observer.observe(el);
  });
} else {
  revealItems.forEach(function (el) {
    el.classList.add("visible");
  });
}

// ---------- Modal controls ----------
function openModal(modal) {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-close]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    closeModal(document.getElementById(btn.dataset.close));
  });
});

document.querySelectorAll(".modal").forEach(function (modal) {
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.show").forEach(function (modal) {
      closeModal(modal);
    });
  }
});

// ---------- Discord popup ----------
const discordBtn = document.getElementById("discordBtn");
const discordModal = document.getElementById("discordModal");
const optFriend = document.getElementById("optFriend");

discordBtn.addEventListener("click", function (e) {
  e.preventDefault();

  const userId = (optFriend.dataset.userId || "").trim();

  if (/^\d{17,20}$/.test(userId)) {
    optFriend.href = "https://discord.com/users/" + userId;
    optFriend.classList.remove("disabled");
    optFriend.setAttribute("target", "_blank");
    optFriend.setAttribute("rel", "noopener");
  } else {
    optFriend.removeAttribute("href");
    optFriend.classList.add("disabled");
  }

  openModal(discordModal);
});

// ---------- Free Fire UID popup ----------
const ffBtn = document.getElementById("ffBtn");
const ffModal = document.getElementById("ffModal");
const copyBtn = document.getElementById("copyBtn");
const uidText = document.getElementById("uidText");

ffBtn.addEventListener("click", function (e) {
  e.preventDefault();
  openModal(ffModal);
});

copyBtn.addEventListener("click", function () {
  const uid = uidText.textContent.trim();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(uid)
      .then(function () {
        copyBtn.textContent = "Copied!";
      })
      .catch(function () {
        copyBtn.textContent = uid;
      });
  } else {
    copyBtn.textContent = uid;
  }
});

ffModal.addEventListener("transitionend", function () {
  if (!ffModal.classList.contains("show")) {
    copyBtn.textContent = "Copy";
  }
});
// ---------- Music play/pause button ----------
const musicBtn = document.getElementById("musicBtn");
const musicIcon = document.getElementById("musicIcon");

function updateMusicIcon() {
  if (video.paused) {
    musicIcon.className = "fa-solid fa-play";
  } else {
    musicIcon.className = "fa-solid fa-pause";
  }
}

musicBtn.addEventListener("click", function () {
  removeUnlockListeners();

  if (video.paused) {
    video.muted = false;
    video.play().catch(function () {});
  } else {
    video.pause();
  }

  updateMusicIcon();
});

video.addEventListener("play", updateMusicIcon);
video.addEventListener("pause", updateMusicIcon);
updateMusicIcon();
