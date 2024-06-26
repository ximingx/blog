function loadFont(fontName, fontUrl, fontFormat) {
    // 检查localStorage中是否已经存储了字体
    const fontData = localStorage.getItem(fontName);

    if (fontData) {
        // 如果字体数据存在，直接使用
        applyFont(fontName, fontData, fontFormat);
    } else {
        // 如果字体数据不存在，从服务器加载
        fetch(fontUrl)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fontData = e.target.result;
                    // 将字体数据存储到localStorage
                    try {
                        localStorage.setItem(fontName, fontData);
                    } catch (e) {
                        console.error('无法将字体存储到localStorage:', e);
                    }
                    // 应用字体
                    applyFont(fontName, fontData, fontFormat);
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => console.error('加载字体时出错:', error));
    }
}

// 应用字体到页面
function applyFont(fontName, fontData, fontFormat) {
    const fontFace = new FontFace(fontName, `url(${fontData})`);
    fontFace.load().then(function(loadedFace) {
        document.fonts.add(loadedFace);
        document.body.style.fontFamily = fontName;
    }).catch(function(error) {
        console.error('无法加载字体:', error);
    });
}
