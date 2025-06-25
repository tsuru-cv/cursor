// DOM要素の取得
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');
const contactForm = document.querySelector('.contact-form');
const ctaButtons = document.querySelectorAll('.cta-button');
const tabButtons = document.querySelectorAll('.tab-button');
const menuGrids = document.querySelectorAll('.menu-grid');

// モバイルメニューの切り替え
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// ナビゲーションリンクのスムーススクロール
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // モバイルメニューを閉じる
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ヘッダーの背景変更（スクロール時）
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(253, 248, 243, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(139, 69, 19, 0.1)';
    } else {
        header.style.backgroundColor = 'rgba(253, 248, 243, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// メニュータブの切り替え
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // アクティブなタブボタンを更新
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // メニューグリッドを切り替え
        menuGrids.forEach(grid => {
            grid.classList.remove('active');
            if (grid.id === targetTab) {
                grid.classList.add('active');
            }
        });
    });
});

// CTAボタンのクリック処理
ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.textContent.includes('メニュー')) {
            const menuSection = document.querySelector('#menu');
            menuSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else if (button.textContent.includes('予約')) {
            const contactSection = document.querySelector('#contact');
            contactSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// お問い合わせフォームの処理
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // 簡単なバリデーション
    if (!name || !email || !message) {
        showNotification('すべての項目を入力してください。', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('有効なメールアドレスを入力してください。', 'error');
        return;
    }
    
    // 送信処理のシミュレーション
    showNotification('お問い合わせありがとうございます。後日ご連絡いたします。', 'success');
    contactForm.reset();
});

// メールアドレスのバリデーション
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 通知メッセージの表示
function showNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // スタイルを適用
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    `;
    
    // タイプに応じた背景色を設定
    if (type === 'success') {
        notification.style.backgroundColor = '#8B4513';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#D2691E';
    } else {
        notification.style.backgroundColor = '#F4A460';
    }
    
    document.body.appendChild(notification);
    
    // アニメーション表示
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自動削除
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// スクロールアニメーション
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.menu-item, .stat, .about-text, .contact-info, .gallery-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// 統計カウンターのアニメーション
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + (element.textContent.includes('年') ? '年' : '+');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.textContent.includes('年') ? '年' : '+');
        }
    }
    
    updateCounter();
}

// 統計セクションが表示されたときにカウンターを開始
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const stats = entry.target.querySelectorAll('.stat h3');
            stats.forEach(stat => {
                const text = stat.textContent;
                const target = parseInt(text.replace(/[^\d]/g, ''));
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// 統計セクションを監視
document.addEventListener('DOMContentLoaded', () => {
    const aboutStats = document.querySelector('.about-stats');
    if (aboutStats) {
        statsObserver.observe(aboutStats);
    }
});

// コーヒーカップのアニメーション強化
function enhanceCoffeeAnimation() {
    const coffeeCup = document.querySelector('.coffee-cup');
    if (coffeeCup) {
        // マウスホバー時のアニメーション
        coffeeCup.addEventListener('mouseenter', () => {
            coffeeCup.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        coffeeCup.addEventListener('mouseleave', () => {
            coffeeCup.style.transform = 'scale(1) rotate(0deg)';
        });
    }
}

// ギャラリーアイテムのホバーエフェクト
function enhanceGalleryHover() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05) rotate(2deg)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

// メニューアイテムのホバーエフェクト
function enhanceMenuHover() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const icon = item.querySelector('.menu-item-image i');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const icon = item.querySelector('.menu-item-image i');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// パフォーマンス最適化：画像の遅延読み込み
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// キーボードナビゲーションのサポート
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // モバイルメニューを閉じる
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// ページ読み込み完了時の処理
window.addEventListener('load', () => {
    // ローディングアニメーション
    document.body.classList.add('loaded');
    
    // カフェ特有のアニメーション強化
    enhanceCoffeeAnimation();
    enhanceGalleryHover();
    enhanceMenuHover();
    
    // パフォーマンス改善のためのプリロード
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.style.willChange = 'transform';
            }
        });
    });
});

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    showNotification('エラーが発生しました。ページを再読み込みしてください。', 'error');
});

// レスポンシブ対応の改善
function handleResize() {
    const width = window.innerWidth;
    
    if (width > 768) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
}

window.addEventListener('resize', handleResize);

// アクセシビリティの改善
document.addEventListener('DOMContentLoaded', () => {
    // フォーカス可能な要素にフォーカスインジケーターを追加
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid #8B4513';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        });
    });
});

// カフェ特有の機能：営業時間チェック
function checkBusinessHours() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    let isOpen = false;
    
    if (day >= 1 && day <= 5) { // 月〜金
        isOpen = hour >= 8 && hour < 22;
    } else { // 土・日・祝
        isOpen = hour >= 9 && hour < 23;
    }
    
    // 営業状況を表示（オプション）
    if (document.querySelector('.business-status')) {
        const statusElement = document.querySelector('.business-status');
        statusElement.textContent = isOpen ? '営業中' : '営業時間外';
        statusElement.className = `business-status ${isOpen ? 'open' : 'closed'}`;
    }
}

// ページ読み込み時に営業時間をチェック
document.addEventListener('DOMContentLoaded', checkBusinessHours); 