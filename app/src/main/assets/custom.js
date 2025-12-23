window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// 非常重要：已集成 WhatsApp 和 Telegram 唤起修复逻辑
// 解决 Android WebView 中的 net::ERR_UNKNOWN_URL_SCHEME 报错
const hookClick = (e) => {
    const origin = e.target.closest('a');
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    );

    if (!origin || !origin.href) return;

    const url = origin.href;

    // --- 1. WhatsApp 特殊处理 ---
    if (url.includes('wa.me') || url.includes('api.whatsapp.com')) {
        e.preventDefault();
        try {
            const urlObj = new URL(url);
            let phone = url.includes('wa.me') 
                ? urlObj.pathname.replace('/', '') 
                : urlObj.searchParams.get('phone');
            
            if (phone) {
                launchProtocol(`whatsapp://send/?phone=${phone}`);
                return;
            }
        } catch (err) { console.error('WhatsApp 解析失败', err); }
    }

    // --- 2. Telegram 特殊处理 ---
    // 匹配 t.me/username 或 telegram.me/username
    if (url.includes('t.me/') || url.includes('telegram.me/')) {
        e.preventDefault();
        try {
            const urlObj = new URL(url);
            // pathname 通常是 "/username"，去掉斜杠得到 username
            const username = urlObj.pathname.replace('/', '');
            
            if (username && username !== '') {
                // Telegram 原生协议：tg://resolve?domain=xxx
                launchProtocol(`tg://resolve?domain=${username}`);
                return;
            }
        } catch (err) { console.error('Telegram 解析失败', err); }
    }

    // --- 3. 原有逻辑：拦截普通网页 _blank 跳转 ---
    if ((origin.target === '_blank') || (isBaseTargetBlank)) {
        if (url.startsWith('http')) {
            e.preventDefault();
            console.log('拦截跳转至当前页:', url);
            location.href = url;
        }
    }
}

/**
 * 辅助函数：通过创建隐藏标签安全唤起协议
 * 这种方式在 PakePlus/Tauri 环境下比直接修改 location.href 更稳定
 */
function launchProtocol(protocolUrl) {
    console.log('尝试唤起原生协议:', protocolUrl);
    const a = document.createElement('a');
    a.href = protocolUrl;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 100);
}

// 劫持 window.open
window.open = function (url, target, features) {
    if (!url) return;
    
    // 如果是通过 window.open 调用的特殊链接，同样交给协议处理
    if (url.includes('wa.me') || url.includes('t.me/')) {
        // 简单触发一次点击拦截逻辑
        const tempA = document.createElement('a');
        tempA.href = url;
        tempA.style.display = 'none';
        document.body.appendChild(tempA);
        tempA.click();
        document.body.removeChild(tempA);
    } else {
        location.href = url;
    }
}

document.addEventListener('click', hookClick, { capture: true });