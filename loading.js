document.body.style.background = '#231F20';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.fontFamily = "'Segoe UI', sans-serif";
document.body.style.height = '100vh';

const fill = document.getElementById('progress-bar-fill');
const text = document.getElementById('progress-text');
const container = document.getElementById('loading-container');

let progress = 0;

function simulateLoading(scriptSrc, splashSrc) {
  const script = document.createElement('script');
  script.src = scriptSrc;
  script.onload = () => {
    progress = 100;
    fill.style.width = '100%';
    text.textContent = '100%';
    setTimeout(() => fadeOutContainer(splashSrc), 500);
  };
  document.body.appendChild(script);

  const interval = setInterval(() => {
    if(progress < 90){ 
      progress += Math.random() * 2;
      if(progress > 90) progress = 90;
      fill.style.width = progress + '%';
      text.textContent = Math.floor(progress) + '%';
    } else {
      clearInterval(interval);
    }
  }, 50);
}

function fadeOutContainer(splashSrc) {
  container.style.opacity = 0;
  setTimeout(() => {
    container.style.display = 'none';
    showSplashAndStartGame(splashSrc);
  }, 1000);
}

function showSplashAndStartGame(splashSrc) {
  const img = document.createElement('img');
  img.src = splashSrc;
  img.style.position = 'fixed';
  img.style.top = '50%';
  img.style.left = '50%';
  img.style.transform = 'translate(-50%,-50%)';
  img.style.opacity = 0;
  img.style.transition = 'opacity 2s ease';
  img.style.maxWidth = '50%';
  img.style.zIndex = 1000;
  document.body.appendChild(img);

  requestAnimationFrame(() => { img.style.opacity = 1; });

  setTimeout(() => {
    img.style.opacity = 0;
    setTimeout(() => {
      document.body.removeChild(img);
      if(typeof LawnMowerGameInit === 'function') LawnMowerGameInit();
    }, 2000);
  }, 2000);
}

simulateLoading('LawnMowerGame.js', 'splash.png');
