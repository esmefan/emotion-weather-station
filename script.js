// 情绪气候站 - 主JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    // ====================
    // 全局状态和配置
    // ====================
    const state = {
        currentEmotion: null,
        currentIntensity: 3,
        selectedSound: 'rain',
        isBreathingActive: false,
        breathingInterval: null,
        currentBreathPhase: 'inhale', // inhale, hold, exhale
        moodHistory: [],
        currentPage: 'today-page'
    };

    // 情绪数据配置
    const emotions = {
        anxiety: {
            name: '焦虑',
            englishName: 'Thunderstorm Anxiety',
            icon: '🌩️',
            color: '#6d67e4',
            weatherTitle: '雷暴焦虑',
            poem: '思绪如闪电般穿梭，内心如雷声般轰鸣',
            forecasts: [
                '今晚可能有轻度失眠，建议减少屏幕时间',
                '明日午后情绪可能波动，预留安静时间',
                '未来48小时注意呼吸急促，练习深呼吸',
                '本周中期可能有决策困难，重要决定延后',
                '注意肩颈紧张，每小时做一次伸展'
            ]
        },
        emptiness: {
            name: '空虚',
            englishName: 'Low-Pressure Emptiness',
            icon: '🌫️',
            color: '#8b95b3',
            weatherTitle: '低压空虚',
            poem: '心如雾中荒原，方向在朦胧中消散',
            forecasts: [
                '今日动力可能不足，设定微小可实现目标',
                '明日注意社交回避，尝试简短问候',
                '未来24小时可能感到意义缺失，回忆小确幸',
                '本周注意饮食规律，避免跳过正餐',
                '下午可能精力下降，安排短暂户外活动'
            ]
        },
        irritability: {
            name: '烦躁',
            englishName: 'Runaway Wind',
            icon: '🌬️',
            color: '#ff9a3c',
            weatherTitle: '失控风',
            poem: '情绪如阵风骤起，平静水面泛起涟漪',
            forecasts: [
                '今日易被小事激怒，预留缓冲时间',
                '明日注意沟通语气，发言前深呼吸三次',
                '未来12小时可能有不耐烦，避免多重任务',
                '本周中期注意路怒或排队焦虑，提前出发',
                '晚上可能思绪纷乱，尝试书写释放'
            ]
        },
        burnout: {
            name: '倦怠',
            englishName: 'Persistent Overcast',
            icon: '🌧️',
            color: '#38b2ac',
            weatherTitle: '持续阴雨',
            poem: '精神如连绵阴雨，阳光在云层后等待',
            forecasts: [
                '今日能量可能较低，取消非必要安排',
                '明日注意拖延倾向，使用番茄工作法',
                '未来36小时可能有自我怀疑，回顾成就清单',
                '本周注意过度承诺，练习说"不"',
                '下午可能注意力分散，分段完成任务'
            ]
        }
    };

    // 微行为建议库
    const microActions = [
        '慢慢走去倒一杯水，感受杯子的温度',
        '站在窗前深呼吸三次，观察窗外的一处细节',
        '轻轻按摩双手每个手指，感受触感',
        '闭上眼睛，倾听周围的三种声音',
        '慢慢拉伸颈部，左右各保持5秒',
        '用手指在桌面画一个完整的圆',
        '注意自己的呼吸节奏，不要改变它',
        '感受双脚与地面的接触',
        '观察房间内的一种颜色，注意它的深浅变化',
        '慢慢咀嚼一颗糖果或一片水果，注意味道'
    ];

    // ====================
    // DOM 元素引用
    // ====================
    const dom = {
        // 时间显示
        currentTime: document.getElementById('current-time'),

        // 页面
        pages: {
            today: document.getElementById('today-page'),
            log: document.getElementById('log-page'),
            settings: document.getElementById('settings-page')
        },

        // 情绪按钮
        emotionBtns: document.querySelectorAll('.emotion-btn'),

        // 自由文本
        freeTextInput: document.getElementById('free-text-input'),

        // 天气报告部分
        weatherReportSection: document.getElementById('weather-report-section'),
        weatherCard: document.getElementById('weather-card'),
        intensityLevels: document.querySelectorAll('.intensity-level'),
        forecastTip: document.getElementById('forecast-tip'),

        // 干预面板
        interventionSection: document.getElementById('intervention-section'),
        soundOptions: document.querySelectorAll('.sound-option'),
        actionPrompt: document.getElementById('action-prompt'),
        refreshActionBtn: document.getElementById('refresh-action-btn'),
        breathingWave: document.getElementById('breathing-wave'),
        breathingText: document.getElementById('breathing-text'),
        startBreathingBtn: document.getElementById('start-breathing-btn'),

        // 日志页面
        moodGrid: document.getElementById('mood-grid'),
        anxietyCount: document.getElementById('anxiety-count'),
        emptinessCount: document.getElementById('emptiness-count'),
        irritabilityCount: document.getElementById('irritability-count'),
        burnoutCount: document.getElementById('burnout-count'),

        // 设置页面
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        dailyReminderToggle: document.getElementById('daily-reminder-toggle'),
        backupBtn: document.getElementById('backup-btn'),
        aboutBtn: document.getElementById('about-btn'),

        // 导航
        navBtns: document.querySelectorAll('.nav-btn'),

        // 模态框
        aboutModal: document.getElementById('about-modal'),
        closeAboutModal: document.getElementById('close-about-modal')
    };

    // ====================
    // 初始化函数
    // ====================
    function init() {
        // 更新时间
        updateTime();
        setInterval(updateTime, 60000); // 每分钟更新一次

        // 加载历史数据
        loadMoodHistory();
        renderMoodGrid();
        updateStats();

        // 初始化呼吸动画SVG
        initBreathingWave();

        // 设置事件监听器
        setupEventListeners();

        // 设置初始微行为
        setRandomAction();
    }

    // ====================
    // 工具函数
    // ====================
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const dateString = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        if (dom.currentTime) {
            dom.currentTime.textContent = `${dateString} ${timeString}`;
        }
    }

    // ====================
    // 情绪选择功能
    // ====================
    function setupEventListeners() {
        // 情绪按钮点击
        dom.emotionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const emotion = this.dataset.emotion;
                selectEmotion(emotion);
            });
        });

        // 强度级别点击
        dom.intensityLevels.forEach(level => {
            level.addEventListener('click', function() {
                const intensity = parseInt(this.dataset.level);
                selectIntensity(intensity);
            });
        });

        // 声音选项点击
        dom.soundOptions.forEach(option => {
            option.addEventListener('click', function() {
                const sound = this.dataset.sound;
                selectSound(sound);
            });
        });

        // 刷新微行为按钮
        dom.refreshActionBtn.addEventListener('click', setRandomAction);

        // 呼吸练习按钮
        dom.startBreathingBtn.addEventListener('click', toggleBreathing);

        // 导航按钮点击
        dom.navBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const pageId = this.dataset.page;
                navigateToPage(pageId);
            });
        });

        // 设置页面按钮
        if (dom.aboutBtn) {
            dom.aboutBtn.addEventListener('click', () => {
                dom.aboutModal.classList.remove('hidden');
            });
        }

        if (dom.closeAboutModal) {
            dom.closeAboutModal.addEventListener('click', () => {
                dom.aboutModal.classList.add('hidden');
            });
        }

        // 点击模态框外部关闭
        dom.aboutModal.addEventListener('click', (e) => {
            if (e.target === dom.aboutModal) {
                dom.aboutModal.classList.add('hidden');
            }
        });

        // 备份按钮
        if (dom.backupBtn) {
            dom.backupBtn.addEventListener('click', backupData);
        }
    }

    function selectEmotion(emotion) {
        // 更新按钮状态
        dom.emotionBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.emotion === emotion) {
                btn.classList.add('active');
            }
        });

        // 更新状态
        state.currentEmotion = emotion;

        // 显示天气报告部分
        dom.weatherReportSection.classList.remove('hidden');

        // 生成天气报告
        generateWeatherReport(emotion);

        // 显示干预面板（延迟一点以提供更好的用户体验）
        setTimeout(() => {
            dom.interventionSection.classList.remove('hidden');
            dom.interventionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);

        // 记录情绪到历史
        recordMood(emotion);
    }

    function selectIntensity(intensity) {
        // 更新按钮状态
        dom.intensityLevels.forEach(level => {
            level.classList.remove('active');
            if (parseInt(level.dataset.level) === intensity) {
                level.classList.add('active');
            }
        });

        // 更新状态
        state.currentIntensity = intensity;

        // 更新预报提示
        updateForecastTip();
    }

    function selectSound(sound) {
        // 更新按钮状态
        dom.soundOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.sound === sound) {
                option.classList.add('active');
            }
        });

        // 更新状态
        state.selectedSound = sound;
    }

    // ====================
    // 天气报告生成
    // ====================
    function generateWeatherReport(emotion) {
        const emotionData = emotions[emotion];
        if (!emotionData) return;

        // 根据强度调整颜色透明度
        const intensity = state.currentIntensity;
        const opacity = Math.min(0.1 + (intensity * 0.05), 0.3);

        // 创建天气卡片HTML
        const weatherCardHTML = `
            <div class="weather-header">
                <div class="weather-icon">${emotionData.icon}</div>
                <div>
                    <div class="weather-title">${emotionData.weatherTitle}</div>
                    <div class="weather-desc">${emotionData.englishName}</div>
                </div>
            </div>
            <div class="weather-poem">${emotionData.poem}</div>
            <div class="weather-intensity">
                <div class="intensity-label">当前强度: ${intensity}/5</div>
                <div class="intensity-bar">
                    <div class="intensity-fill" style="width: ${intensity * 20}%; background-color: ${emotionData.color}; opacity: ${opacity};"></div>
                </div>
            </div>
        `;

        // 更新DOM
        dom.weatherCard.innerHTML = weatherCardHTML;
        dom.weatherCard.className = `weather-card ${emotion}`;

        // 更新预报提示
        updateForecastTip();

        // 添加一些视觉效果
        addWeatherEffects(emotion);
    }

    function updateForecastTip() {
        if (!state.currentEmotion) return;

        const emotionData = emotions[state.currentEmotion];
        const intensity = state.currentIntensity;

        // 根据强度选择不同的预报
        let forecastIndex = Math.min(intensity - 1, emotionData.forecasts.length - 1);
        if (forecastIndex < 0) forecastIndex = 0;

        const forecast = emotionData.forecasts[forecastIndex];

        // 创建预报提示HTML
        const forecastHTML = `
            <div class="forecast-tip-title">情绪预报 (强度 ${intensity})</div>
            <div class="forecast-tip-text">${forecast}</div>
        `;

        // 更新DOM
        dom.forecastTip.innerHTML = forecastHTML;
    }

    function addWeatherEffects(emotion) {
        // 这里可以添加更多的视觉效果，比如微妙的动画
        // 目前留作扩展点
    }

    // ====================
    // 干预面板功能
    // ====================
    function setRandomAction() {
        const randomIndex = Math.floor(Math.random() * microActions.length);
        const action = microActions[randomIndex];
        dom.actionPrompt.textContent = action;
    }

    function initBreathingWave() {
        // 创建呼吸波浪SVG
        const svgNS = "http://www.w3.org/2000/svg";
        const width = 400;
        const height = 100;

        // 清空现有内容
        dom.breathingWave.innerHTML = '';

        // 创建路径
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", generateBreathingWavePath(0.5));
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#7c3aed");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-linecap", "round");
        path.id = "breathing-path";

        dom.breathingWave.appendChild(path);
    }

    function generateBreathingWavePath(phase) {
        const width = 400;
        const height = 100;
        const amplitude = 30 * phase;
        const frequency = 0.03;

        let path = `M 0 ${height/2}`;

        for (let x = 0; x <= width; x += 5) {
            const y = height/2 + amplitude * Math.sin(frequency * x + phase * Math.PI);
            path += ` L ${x} ${y}`;
        }

        return path;
    }

    function toggleBreathing() {
        if (state.isBreathingActive) {
            stopBreathing();
        } else {
            startBreathing();
        }
    }

    function startBreathing() {
        state.isBreathingActive = true;
        state.currentBreathPhase = 'inhale';

        // 更新按钮状态
        dom.startBreathingBtn.classList.add('breathing');
        dom.startBreathingBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停呼吸练习';

        // 开始呼吸循环
        breathingCycle();
        state.breathingInterval = setInterval(breathingCycle, 4000); // 4秒一个完整循环
    }

    function stopBreathing() {
        state.isBreathingActive = false;

        // 清除间隔
        if (state.breathingInterval) {
            clearInterval(state.breathingInterval);
            state.breathingInterval = null;
        }

        // 重置按钮状态
        dom.startBreathingBtn.classList.remove('breathing');
        dom.startBreathingBtn.innerHTML = '<i class="fas fa-play"></i> 开始呼吸练习';

        // 重置呼吸文本
        dom.breathingText.textContent = '吸气...';

        // 重置波浪
        const path = document.getElementById('breathing-path');
        if (path) {
            path.setAttribute("d", generateBreathingWavePath(0.5));
        }
    }

    function breathingCycle() {
        const phases = [
            { name: 'inhale', text: '吸气...', duration: 1600, phase: 0 },
            { name: 'hold', text: '保持...', duration: 800, phase: 0.5 },
            { name: 'exhale', text: '呼气...', duration: 1600, phase: 1 }
        ];

        const currentPhaseIndex = phases.findIndex(p => p.name === state.currentBreathPhase);
        const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;

        // 更新当前阶段
        state.currentBreathPhase = phases[nextPhaseIndex].name;
        dom.breathingText.textContent = phases[nextPhaseIndex].text;

        // 更新波浪动画
        animateBreathingWave(phases[nextPhaseIndex].phase, phases[nextPhaseIndex].duration);
    }

    function animateBreathingWave(targetPhase, duration) {
        const path = document.getElementById('breathing-path');
        if (!path) return;

        const startPhase = parseFloat(path.getAttribute('data-phase') || '0');
        const startTime = Date.now();

        function update() {
            if (!state.isBreathingActive) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 使用缓动函数
            const easedProgress = easeInOutCubic(progress);
            const currentPhase = startPhase + (targetPhase - startPhase) * easedProgress;

            path.setAttribute("d", generateBreathingWavePath(currentPhase));
            path.setAttribute('data-phase', currentPhase);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // ====================
    // 情绪历史记录
    // ====================
    function loadMoodHistory() {
        // 从localStorage加载历史数据
        const saved = localStorage.getItem('moodClimateHistory');
        if (saved) {
            state.moodHistory = JSON.parse(saved);
        } else {
            // 生成示例数据
            generateSampleHistory();
        }
    }

    function generateSampleHistory() {
        const emotionsList = ['anxiety', 'emptiness', 'irritability', 'burnout'];
        const today = new Date();

        for (let i = 28; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // 随机跳过一些日期
            if (Math.random() > 0.7) continue;

            const emotion = emotionsList[Math.floor(Math.random() * emotionsList.length)];
            const intensity = Math.floor(Math.random() * 5) + 1;

            state.moodHistory.push({
                date: date.toISOString().split('T')[0],
                emotion: emotion,
                intensity: intensity
            });
        }

        saveMoodHistory();
    }

    function recordMood(emotion) {
        const today = new Date().toISOString().split('T')[0];
        const intensity = state.currentIntensity;

        // 检查今天是否已有记录
        const existingIndex = state.moodHistory.findIndex(entry => entry.date === today);

        if (existingIndex >= 0) {
            // 更新现有记录
            state.moodHistory[existingIndex] = { date: today, emotion, intensity };
        } else {
            // 添加新记录
            state.moodHistory.push({ date: today, emotion, intensity });
        }

        // 保存并更新UI
        saveMoodHistory();
        renderMoodGrid();
        updateStats();
    }

    function saveMoodHistory() {
        localStorage.setItem('moodClimateHistory', JSON.stringify(state.moodHistory));
    }

    function renderMoodGrid() {
        // 清空现有内容
        dom.moodGrid.innerHTML = '';

        // 生成28个点（4周 x 7天）
        const today = new Date();

        for (let i = 27; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];

            // 查找当天的情绪记录
            const moodEntry = state.moodHistory.find(entry => entry.date === dateString);
            const emotion = moodEntry ? moodEntry.emotion : 'none';
            const intensity = moodEntry ? moodEntry.intensity : 0;

            // 创建情绪点
            const dot = document.createElement('div');
            dot.className = `mood-dot ${emotion}`;
            dot.dataset.date = dateString;
            dot.dataset.emotion = emotion;
            dot.dataset.intensity = intensity;

            // 设置透明度基于强度
            if (emotion !== 'none') {
                const opacity = 0.3 + (intensity * 0.14);
                dot.style.opacity = opacity;
            }

            // 添加工具提示
            dot.title = getMoodTooltip(date, emotion, intensity);

            dom.moodGrid.appendChild(dot);
        }
    }

    function getMoodTooltip(date, emotion, intensity) {
        const dateStr = date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        });

        if (emotion === 'none') {
            return `${dateStr}: 无记录`;
        }

        const emotionName = emotions[emotion]?.name || emotion;
        return `${dateStr}: ${emotionName} (强度: ${intensity}/5)`;
    }

    function updateStats() {
        const counts = {
            anxiety: 0,
            emptiness: 0,
            irritability: 0,
            burnout: 0
        };

        // 统计最近28天的情绪
        state.moodHistory.forEach(entry => {
            if (counts.hasOwnProperty(entry.emotion)) {
                counts[entry.emotion]++;
            }
        });

        // 更新DOM
        if (dom.anxietyCount) dom.anxietyCount.textContent = counts.anxiety;
        if (dom.emptinessCount) dom.emptinessCount.textContent = counts.emptiness;
        if (dom.irritabilityCount) dom.irritabilityCount.textContent = counts.irritability;
        if (dom.burnoutCount) dom.burnoutCount.textContent = counts.burnout;
    }

    // ====================
    // 导航功能
    // ====================
    function navigateToPage(pageId) {
        // 更新页面显示
        Object.values(dom.pages).forEach(page => {
            page.classList.remove('active');
        });

        if (dom.pages[pageId.replace('-page', '')]) {
            dom.pages[pageId.replace('-page', '')].classList.add('active');
        }

        // 更新导航按钮状态
        dom.navBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === pageId) {
                btn.classList.add('active');
            }
        });

        // 更新状态
        state.currentPage = pageId;

        // 如果切换到日志页面，更新网格
        if (pageId === 'log-page') {
            renderMoodGrid();
            updateStats();
        }
    }

    // ====================
    // 数据备份
    // ====================
    function backupData() {
        const data = {
            moodHistory: state.moodHistory,
            backupDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `情绪气候站备份_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('数据备份已下载！');
    }

    // ====================
    // 初始化应用
    // ====================
    init();
});