function createMeteor() {
    const meteor = document.createElement('div');
    meteor.classList.add('meteor');

    const startX = Math.random() * window.innerWidth;
    const duration = 2 + Math.random() * 3;

    meteor.style.top = '0';
    meteor.style.right = startX + 'px';
    meteor.style.animationDuration = duration + 's';

    document.body.appendChild(meteor);

    setTimeout(() => {
        meteor.remove();
    }, duration * 1000);
}

setInterval(createMeteor, 300);

