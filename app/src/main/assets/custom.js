window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});/**
 * 核心逻辑：
 * 1. 识别并放行特殊协议 (WhatsApp, tel, mailto 等)，让系统接管跳转。
 * 2. 拦截普通 http/https 的 _blank 跳转，强制在当前页打开。
 */
const hookClick = (e) => {
    const origin = e.target.closest('a');
    if (!origin || !origin.href) return;

    // --- 1. 处理特殊协议 (Deep Links) ---
    // 如果不是以 http 开头的，说明是特殊协议，直接 return 放弃拦截
    if (!origin.href.startsWith('http')) {
        //console.log('检测到特殊协议，交给 Android 系统处理:', origin.href);
        return; 
    }

    // --- 2. 处理普通网页的跳转逻辑 ---
    const isBaseTargetBlank = document.querySelector('head base[target="_blank"]');
    
    if (
        (origin.href && origin.target === '_blank') ||
        (origin.href && isBaseTargetBlank)
    ) {
        // 只有是 http 协议且原本要新开窗口时，才拦截并强制当前页跳转
        e.preventDefault();
        //console.log('拦截新窗口，当前页跳转:', origin.href);
        location.href = origin.href;
    }
}

// 劫持 window.open
window.open = function (url, target, features) {
    console.log('window.open 触发:', url);
    if (url && !url.startsWith('http')) {
        // 特殊协议通过创建一个隐形 a 标签模拟点击，触发系统调用
        const a = document.createElement('a');
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        location.href = url;
    }
}

// 使用捕获模式监听点击
document.addEventListener('click', hookClick, { capture: true });