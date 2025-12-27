// =====================================
// متغیرهای سراسری
// =====================================
let currentStoryIndex = 0;
let stories = [];
let isPaused = false;
let isMuted = true;
let progressInterval;
let progressValue = 0;
let progressStartTime = 0;
let progressPausedTime = 0;

// المان‌های DOM
const storyModal = document.getElementById("storyModal");
const storyImage = document.getElementById("storyImage");
const storyVideo = document.getElementById("storyVideo");
const progressBar = document.getElementById("progressBar");
const modalAvatar = document.getElementById("modalAvatar");
const modalUsername = document.getElementById("modalUsername");
const storyTitle = document.getElementById("storyTitle");
const storyDescription = document.getElementById("storyDescription");
const productImage = document.getElementById("productImage");
const productTitle = document.getElementById("productTitle");
const productLink = document.getElementById("productLink");
const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const volumeBtn = document.getElementById("volumeBtn");

// =====================================
// راه‌اندازی اولیه
// =====================================
document.addEventListener("DOMContentLoaded", function () {
  stories = Array.from(document.querySelectorAll(".story-item"));

  stories.forEach((story, index) => {
    story.addEventListener("click", () => {
      openStory(index);
    });
  });

  closeBtn.addEventListener("click", closeStory);
  prevBtn.addEventListener("click", showPreviousStory);
  nextBtn.addEventListener("click", showNextStory);
  playPauseBtn.addEventListener("click", togglePlayPause);
  volumeBtn.addEventListener("click", toggleVolume);

  document
    .querySelector(".story-modal-overlay")
    .addEventListener("click", closeStory);
  document.addEventListener("keydown", handleKeyPress);
  storyVideo.addEventListener("ended", handleVideoEnd);

  // =====================================
  // دکمه‌های اسکرول - برعکس شده
  // =====================================
  const scrollLeftBtn = document.getElementById("scrollLeftBtn");
  const scrollRightBtn = document.getElementById("scrollRightBtn");
  const storiesScroll = document.querySelector(".stories-scroll");

  if (scrollLeftBtn && scrollRightBtn && storiesScroll) {
    // دکمه چپ - اسکرول به چپ
    scrollLeftBtn.addEventListener("click", function () {
      storiesScroll.scrollTo({
        left: storiesScroll.scrollLeft - 350, // منفی
        behavior: "smooth",
      });
    });

    // دکمه راست - اسکرول به راست
    scrollRightBtn.addEventListener("click", function () {
      storiesScroll.scrollTo({
        left: storiesScroll.scrollLeft + 350, // مثبت
        behavior: "smooth",
      });
    });

    // افکت hover
    scrollLeftBtn.addEventListener("mouseenter", function () {
      this.style.background = "#f5f5f5";
      this.style.transform = "translateY(-50%) scale(1.1)";
    });

    scrollLeftBtn.addEventListener("mouseleave", function () {
      this.style.background = "white";
      this.style.transform = "translateY(-50%) scale(1)";
    });

    scrollRightBtn.addEventListener("mouseenter", function () {
      this.style.background = "#f5f5f5";
      this.style.transform = "translateY(-50%) scale(1.1)";
    });

    scrollRightBtn.addEventListener("mouseleave", function () {
      this.style.background = "white";
      this.style.transform = "translateY(-50%) scale(1)";
    });

    // مخفی/نمایش دکمه‌ها بر اساس موقعیت اسکرول
    function updateScrollButtons() {
      const scrollLeft = Math.abs(storiesScroll.scrollLeft);
      const scrollWidth = storiesScroll.scrollWidth;
      const clientWidth = storiesScroll.clientWidth;
      const maxScroll = scrollWidth - clientWidth;

      // دکمه راست - در ابتدای لیست محو باشه
      if (scrollLeft <= 10) {
        scrollRightBtn.style.opacity = "0.3";
        scrollRightBtn.style.cursor = "not-allowed";
      } else {
        scrollRightBtn.style.opacity = "1";
        scrollRightBtn.style.cursor = "pointer";
      }

      // دکمه چپ - در انتهای لیست محو باشه
      if (scrollLeft >= maxScroll - 10) {
        scrollLeftBtn.style.opacity = "0.3";
        scrollLeftBtn.style.cursor = "not-allowed";
      } else {
        scrollLeftBtn.style.opacity = "1";
        scrollLeftBtn.style.cursor = "pointer";
      }
    }

    // چک کردن وضعیت اولیه
    setTimeout(updateScrollButtons, 200);

    // رویداد اسکرول
    storiesScroll.addEventListener("scroll", updateScrollButtons);

    console.log("✅ دکمه‌های اسکرول برعکس شدند!");
  }
});
// =====================================
// باز کردن استوری
// =====================================
function openStory(index) {
  currentStoryIndex = index;
  const story = stories[index];

  storyModal.classList.remove("hidden");

  const username = story.dataset.username;
  const type = story.dataset.type;
  const media = story.dataset.media;
  const title = story.dataset.title;
  const description = story.dataset.description;
  const prodTitle = story.dataset.productTitle;
  const prodImage = story.dataset.productImage;
  const prodLink = story.dataset.productLink;

  const avatar = story.querySelector(".story-avatar img").src;
  modalAvatar.src = avatar;
  modalUsername.textContent = username;

  storyTitle.textContent = title;
  storyDescription.textContent = description;

  productImage.src = prodImage;
  productTitle.textContent = prodTitle;
  productLink.href = prodLink;

  if (type === "video") {
    storyImage.classList.add("hidden");
    storyVideo.classList.remove("hidden");
    storyVideo.src = media;
    storyVideo.muted = isMuted;
    storyVideo.currentTime = 0;
    storyVideo.play();

    playPauseBtn.style.display = "flex";
    volumeBtn.style.display = "flex";
  } else {
    storyVideo.classList.add("hidden");
    storyImage.classList.remove("hidden");
    storyImage.src = media;

    playPauseBtn.style.display = "none";
    volumeBtn.style.display = "none";
  }

  updateNavigationButtons();
  startProgress(type);
}

// =====================================
// بستن استوری
// =====================================
function closeStory() {
  storyModal.classList.add("hidden");
  stopProgress();

  if (!storyVideo.classList.contains("hidden")) {
    storyVideo.pause();
    storyVideo.src = "";
  }

  isPaused = false;
  progressValue = 0;
}

// =====================================
// نمایش استوری قبلی
// =====================================
function showPreviousStory() {
  if (currentStoryIndex > 0) {
    stopProgress();
    openStory(currentStoryIndex - 1);
  }
}

// =====================================
// نمایش استوری بعدی
// =====================================
function showNextStory() {
  if (currentStoryIndex < stories.length - 1) {
    stopProgress();
    openStory(currentStoryIndex + 1);
  } else {
    closeStory();
  }
}

// =====================================
// به‌روزرسانی دکمه‌های ناوبری
// =====================================
function updateNavigationButtons() {
  if (currentStoryIndex === 0) {
    prevBtn.style.opacity = "0.3";
    prevBtn.style.cursor = "not-allowed";
  } else {
    prevBtn.style.opacity = "0.7";
    prevBtn.style.cursor = "pointer";
  }

  if (currentStoryIndex === stories.length - 1) {
    nextBtn.style.opacity = "0.3";
    nextBtn.style.cursor = "not-allowed";
  } else {
    nextBtn.style.opacity = "0.7";
    nextBtn.style.cursor = "pointer";
  }
}

// =====================================
// شروع نوار پیشرفت
// =====================================
function startProgress(type) {
    stopProgress();
    progressValue = 0;
    progressBar.style.width = '0%';
    isPaused = false;
    
    let duration;
    if (type === 'video') {
        // منتظر بمون تا ویدیو آماده بشه
        const videoLoadHandler = function() {
            if (storyVideo.duration && !isNaN(storyVideo.duration) && storyVideo.duration > 0) {
                duration = storyVideo.duration * 1000;
                animateProgress(duration);
            } else {
                // اگر duration نامعتبر بود، 10 ثانیه پیش‌فرض
                duration = 10000;
                animateProgress(duration);
            }
            storyVideo.removeEventListener('loadedmetadata', videoLoadHandler);
            storyVideo.removeEventListener('canplay', videoLoadHandler);
        };
        
        storyVideo.addEventListener('loadedmetadata', videoLoadHandler);
        storyVideo.addEventListener('canplay', videoLoadHandler);
        
        // اگر بعد از 500 میلی‌ثانیه لود نشد، با 10 ثانیه شروع کن
        setTimeout(() => {
            if (!progressInterval) {
                duration = 10000;
                animateProgress(duration);
            }
        }, 500);
    } else {
        // برای تصویر، 5 ثانیه
        duration = 5000;
        animateProgress(duration);
    }
}

// =====================================
// انیمیشن نوار پیشرفت - بدون لرزش
// =====================================
function animateProgress(duration) {
    // اول progress قبلی رو پاک کن
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    progressStartTime = Date.now();
    progressPausedTime = 0;
    progressValue = 0;
    
    // استفاده از requestAnimationFrame برای انیمیشن روان‌تر
    function updateProgress() {
        if (!isPaused && !storyModal.classList.contains('hidden')) {
            const elapsed = Date.now() - progressStartTime - progressPausedTime;
            progressValue = Math.min((elapsed / duration) * 100, 100);
            
            // به‌روزرسانی روان نوار پیشرفت
            progressBar.style.width = progressValue + '%';
            
            if (progressValue >= 100) {
                progressValue = 100;
                progressBar.style.width = '100%';
                
                setTimeout(() => {
                    showNextStory();
                }, 300);
            } else {
                requestAnimationFrame(updateProgress);
            }
        } else if (!storyModal.classList.contains('hidden')) {
            // اگر pause شد، دوباره چک کن
            requestAnimationFrame(updateProgress);
        }
    }
    
    // شروع انیمیشن
    requestAnimationFrame(updateProgress);
    
    // یک interval پشتیبان برای اطمینان
    progressInterval = setInterval(() => {
        if (!isPaused && !storyModal.classList.contains('hidden')) {
            const elapsed = Date.now() - progressStartTime - progressPausedTime;
            progressValue = Math.min((elapsed / duration) * 100, 100);
            
            if (progressValue >= 100) {
                stopProgress();
                setTimeout(() => {
                    showNextStory();
                }, 300);
            }
        }
    }, 100);
}

// =====================================
// توقف نوار پیشرفت
// =====================================
function stopProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// =====================================
// تغییر وضعیت پخش/متوقف
// =====================================
function togglePlayPause() {
  isPaused = !isPaused;

  if (isPaused) {
    storyVideo.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    progressPausedTime = Date.now() - progressStartTime - progressPausedTime;
  } else {
    storyVideo.play();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    progressStartTime =
      Date.now() - (progressValue / 100) * (storyVideo.duration * 1000);
  }
}

// =====================================
// تغییر وضعیت صدا
// =====================================
function toggleVolume() {
  isMuted = !isMuted;
  storyVideo.muted = isMuted;

  if (isMuted) {
    volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  } else {
    volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
  }
}

// =====================================
// مدیریت کلیدهای کیبورد
// =====================================
function handleKeyPress(e) {
  if (!storyModal.classList.contains("hidden")) {
    switch (e.key) {
      case "Escape":
        closeStory();
        break;
      case "ArrowLeft":
        showNextStory();
        break;
      case "ArrowRight":
        showPreviousStory();
        break;
      case " ":
        e.preventDefault();
        if (!storyVideo.classList.contains("hidden")) {
          togglePlayPause();
        }
        break;
      case "m":
      case "M":
        if (!storyVideo.classList.contains("hidden")) {
          toggleVolume();
        }
        break;
    }
  }
}

// =====================================
// مدیریت اتمام ویدیو
// =====================================
function handleVideoEnd() {
  showNextStory();
}

// =====================================
// لاگ اطلاعات
// =====================================
console.log(
  "%c🎬 سیستم استوری آماده است!",
  "color: #19bfd3; font-size: 16px; font-weight: bold;"
);
console.log(
  "%c✨ دکمه‌های اسکرول فعال شدند!",
  "color: #4CAF50; font-size: 14px; font-weight: bold;"
);
