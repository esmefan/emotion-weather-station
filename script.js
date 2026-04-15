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
        currentPage: 'today-page',
        nightMode: false, // 夜间模式状态
        nightSound: 'waves', // 夜间声音选项：waves, campfire, low-voice
        nightCountdownInterval: null // 睡眠倒计时计时器
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

    // 夜间模式配置
    const nightModeConfig = {
        // 夜间声音选项
        sounds: {
            waves: { icon: '🌊', label: '海浪声' },
            campfire: { icon: '🔥', label: '篝火声' },
            'low-voice': { icon: '👤', label: '低频人声' }
        },
        // 夜间微行为
        nightActions: [
            '把手机屏幕亮度调到最低，闭上眼睛数三次呼吸',
            '轻轻按压太阳穴，顺时针按摩五圈',
            '用枕头支撑后背，坐直深呼吸',
            '想象自己站在海边，感受海风轻拂',
            '在心中默念三件今天发生的小事',
            '轻轻拍打手臂和双腿，像弹去灰尘',
            '闭上眼睛，想象一颗星星慢慢变亮',
            '慢慢转动脚踝，左右各五圈',
            '用手掌轻轻覆盖眼睛，感受温暖',
            '在心里对自己说一句温柔的话'
        ],
        // 守塔人消息
        watchtowerMessages: [
            '夜里不太平静也没关系，我在这里陪你到天亮。',
            '夜晚的海洋深不可测，但灯塔的光总会穿透黑暗。',
            '星星在云层后闪烁，就像你的呼吸在寂静中起伏。',
            '风会停歇，雨会止息，我会一直在这里守望。',
            '深夜的思绪像潮水，来了又会退去，我陪你看它流动。'
        ]
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
        watchtowerCard: document.getElementById('watchtower-card'),
        intensityLevels: document.querySelectorAll('.intensity-level'),
        forecastTip: document.getElementById('forecast-tip'),

        // 干预面板
        interventionSection: document.getElementById('intervention-section'),
        sleepCountdown: document.getElementById('sleep-countdown'),
        countdownTimer: document.getElementById('countdown-timer'),
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
        nightModeToggle: document.getElementById('night-mode-toggle'),
        backupBtn: document.getElementById('backup-btn'),
        aboutBtn: document.getElementById('about-btn'),

        // 导航
        navBtns: document.querySelectorAll('.nav-btn'),

        // 模态框
        aboutModal: document.getElementById('about-modal'),
        closeAboutModal: document.getElementById('close-about-modal'),

        // 情绪气候图
        weekTimeline: document.getElementById('week-timeline'),
        cellDetail: document.getElementById('cell-detail'),
        detailDate: document.getElementById('detail-date'),
        detailWeather: document.getElementById('detail-weather'),
        detailTitle: document.getElementById('detail-title'),
        detailIntensity: document.getElementById('detail-intensity'),
        detailAction: document.getElementById('detail-action'),
        detailClose: document.getElementById('detail-close'),
        mostFrequentWeather: document.getElementById('most-frequent-weather'),
        avgIntensity: document.getElementById('avg-intensity'),
        interventionsCount: document.getElementById('interventions-count')
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

        // 初始化夜间模式
        initNightMode();

        // 初始化情绪地图
        initEmotionMap();

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

    // 初始化夜间模式
    function initNightMode() {
        // 检查当前时间是否在夜间时段 (22:00-06:00)
        const now = new Date();
        const currentHour = now.getHours();
        const isNightTime = currentHour >= 22 || currentHour < 6;

        // 从localStorage加载夜间模式设置
        const savedNightMode = localStorage.getItem('nightModeEnabled');
        const nightModeEnabled = savedNightMode !== null ? JSON.parse(savedNightMode) : isNightTime;

        // 更新状态
        state.nightMode = nightModeEnabled;

        // 更新开关状态
        if (dom.nightModeToggle) {
            dom.nightModeToggle.checked = nightModeEnabled;
        }

        // 应用夜间模式
        applyNightMode(nightModeEnabled);

        // 如果启用夜间模式，更新睡眠倒计时
        if (nightModeEnabled) {
            updateSleepCountdown();
            // 每分钟更新一次倒计时
            state.nightCountdownInterval = setInterval(updateSleepCountdown, 60000);
        }
    }

    // 应用夜间模式
    function applyNightMode(enabled) {
        state.nightMode = enabled;

        // 更新HTML属性以应用CSS变量
        document.documentElement.setAttribute('data-night-mode', enabled);

        // 显示/隐藏相关元素
        if (enabled) {
            // 隐藏普通天气卡片，显示守塔人卡片
            if (dom.weatherCard) dom.weatherCard.classList.add('hidden');
            if (dom.watchtowerCard) {
                dom.watchtowerCard.classList.remove('hidden');
                // 生成守塔人卡片内容
                generateWatchtowerCard();
            }
            // 显示睡眠倒计时
            if (dom.sleepCountdown) dom.sleepCountdown.classList.remove('hidden');
            // 更新干预选项为夜间版本
            updateInterventionsForNight();
        } else {
            // 显示普通天气卡片，隐藏守塔人卡片
            if (dom.weatherCard) dom.weatherCard.classList.remove('hidden');
            if (dom.watchtowerCard) dom.watchtowerCard.classList.add('hidden');
            // 隐藏睡眠倒计时
            if (dom.sleepCountdown) dom.sleepCountdown.classList.add('hidden');
            // 恢复日间干预选项
            restoreDayInterventions();
        }

        // 保存设置
        localStorage.setItem('nightModeEnabled', JSON.stringify(enabled));
    }

    // 生成守塔人卡片
    function generateWatchtowerCard() {
        if (!dom.watchtowerCard) return;

        // 随机选择一条守塔人消息
        const messages = nightModeConfig.watchtowerMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // 生成SVG灯塔
        const lighthouseSVG = `
            <svg class="watchtower-lighthouse" viewBox="0 0 60 100">
                <!-- 灯塔底座 -->
                <rect class="lighthouse-base" x="20" y="75" width="20" height="25" rx="3"/>
                <!-- 灯塔塔身 -->
                <rect class="lighthouse-tower" x="22" y="15" width="16" height="60" rx="3"/>
                <!-- 灯塔顶部 -->
                <circle class="lighthouse-light" cx="30" cy="20" r="8"/>
                <!-- 光晕效果 -->
                <circle class="lighthouse-glow" cx="30" cy="20" r="15"/>
            </svg>
        `;

        // 生成卡片HTML
        const cardHTML = `
            ${lighthouseSVG}
            <div class="watchtower-message">${randomMessage}</div>
            <div class="watchtower-quote">—— 夜间守塔人</div>
        `;

        dom.watchtowerCard.innerHTML = cardHTML;
    }

    // 更新睡眠倒计时
    function updateSleepCountdown() {
        if (!dom.countdownTimer) return;

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(7, 0, 0, 0); // 明天早上7点

        // 如果现在已经是早上7点之后，则计算今天早上7点
        if (now.getHours() >= 7) {
            const todayMorning = new Date(now);
            todayMorning.setHours(7, 0, 0, 0);
            if (now > todayMorning) {
                // 已经是今天7点之后，计算明天7点
                tomorrow.setDate(tomorrow.getDate() + 1);
            }
        }

        const timeDiff = tomorrow - now;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        // 格式化显示
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        dom.countdownTimer.textContent = `${formattedHours}:${formattedMinutes}`;
    }

    // 更新干预选项为夜间版本
    function updateInterventionsForNight() {
        // 更新声音选项
        if (dom.soundOptions && dom.soundOptions.length > 0) {
            const nightSounds = nightModeConfig.sounds;

            // 海浪声
            if (dom.soundOptions[0]) {
                dom.soundOptions[0].querySelector('.sound-icon').textContent = nightSounds.waves.icon;
                dom.soundOptions[0].querySelector('.sound-label').textContent = nightSounds.waves.label;
                dom.soundOptions[0].dataset.sound = 'waves';
            }

            // 篝火声
            if (dom.soundOptions[1]) {
                dom.soundOptions[1].querySelector('.sound-icon').textContent = nightSounds.campfire.icon;
                dom.soundOptions[1].querySelector('.sound-label').textContent = nightSounds.campfire.label;
                dom.soundOptions[1].dataset.sound = 'campfire';
            }

            // 低频人声
            if (dom.soundOptions[2]) {
                dom.soundOptions[2].querySelector('.sound-icon').textContent = nightSounds['low-voice'].icon;
                dom.soundOptions[2].querySelector('.sound-label').textContent = nightSounds['low-voice'].label;
                dom.soundOptions[2].dataset.sound = 'low-voice';
            }
        }

        // 更新微行为为夜间版本
        setRandomNightAction();
    }

    // 恢复日间干预选项
    function restoreDayInterventions() {
        // 恢复声音选项
        if (dom.soundOptions && dom.soundOptions.length > 0) {
            // 雨声
            if (dom.soundOptions[0]) {
                dom.soundOptions[0].querySelector('.sound-icon').textContent = '🌧️';
                dom.soundOptions[0].querySelector('.sound-label').textContent = '雨声';
                dom.soundOptions[0].dataset.sound = 'rain';
            }

            // 电台白噪音
            if (dom.soundOptions[1]) {
                dom.soundOptions[1].querySelector('.sound-icon').textContent = '📻';
                dom.soundOptions[1].querySelector('.sound-label').textContent = '电台白噪音';
                dom.soundOptions[1].dataset.sound = 'white-noise';
            }

            // 低语人声
            if (dom.soundOptions[2]) {
                dom.soundOptions[2].querySelector('.sound-icon').textContent = '👥';
                dom.soundOptions[2].querySelector('.sound-label').textContent = '低语人声';
                dom.soundOptions[2].dataset.sound = 'whisper';
            }
        }

        // 恢复日间微行为
        setRandomAction();
    }

    // 设置随机夜间微行为
    function setRandomNightAction() {
        const actions = nightModeConfig.nightActions;
        const randomIndex = Math.floor(Math.random() * actions.length);
        const action = actions[randomIndex];

        if (dom.actionPrompt) {
            dom.actionPrompt.textContent = action;
        }
    }

    // 初始化情绪地图
    function initEmotionMap() {
        // 生成周时间线
        generateWeekTimeline();

        // 更新每周总结
        updateWeeklySummary();

        // 设置单元格点击事件
        setupCellClickEvents();
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

        // 夜间模式切换
        if (dom.nightModeToggle) {
            dom.nightModeToggle.addEventListener('change', function() {
                const enabled = this.checked;
                applyNightMode(enabled);

                // 如果启用夜间模式，启动倒计时；如果禁用，清除倒计时
                if (enabled) {
                    updateSleepCountdown();
                    state.nightCountdownInterval = setInterval(updateSleepCountdown, 60000);
                } else {
                    if (state.nightCountdownInterval) {
                        clearInterval(state.nightCountdownInterval);
                        state.nightCountdownInterval = null;
                    }
                }
            });
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
        let action;

        if (state.nightMode) {
            // 夜间模式使用夜间微行为
            const randomIndex = Math.floor(Math.random() * nightModeConfig.nightActions.length);
            action = nightModeConfig.nightActions[randomIndex];
        } else {
            // 日间模式使用普通微行为
            const randomIndex = Math.floor(Math.random() * microActions.length);
            action = microActions[randomIndex];
        }

        if (dom.actionPrompt) {
            dom.actionPrompt.textContent = action;
        }
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

        // 如果切换到日志页面，更新网格和情绪地图
        if (pageId === 'log-page') {
            renderMoodGrid();
            updateStats();
            generateWeekTimeline();
            updateWeeklySummary();
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
    // 情绪地图功能
    // ====================

    // 生成周时间线
    function generateWeekTimeline() {
        if (!dom.weekTimeline) return;

        // 清空现有内容
        dom.weekTimeline.innerHTML = '';

        // 获取最近7天的数据
        const today = new Date();
        const weekData = [];

        // 生成最近7天的数据（包括今天）
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];

            // 查找当天的情绪记录
            const moodEntry = state.moodHistory.find(entry => entry.date === dateString);
            const emotion = moodEntry ? moodEntry.emotion : 'none';
            const intensity = moodEntry ? moodEntry.intensity : 0;

            // 获取微行为（如果有的话，使用第一条记录）
            const action = moodEntry ? getRandomActionForDay(dateString) : '暂无记录';

            weekData.push({
                date: date,
                dateString: dateString,
                emotion: emotion,
                intensity: intensity,
                action: action,
                dayOfWeek: getDayOfWeekChinese(date.getDay())
            });
        }

        // 生成单元格
        weekData.forEach((dayData, index) => {
            const cell = document.createElement('div');
            cell.className = `weather-cell ${dayData.emotion}`;
            cell.dataset.index = index;
            cell.dataset.date = dayData.dateString;
            cell.dataset.emotion = dayData.emotion;
            cell.dataset.intensity = dayData.intensity;
            cell.dataset.action = dayData.action;

            // 添加日期标签
            const dateLabel = document.createElement('div');
            dateLabel.className = 'cell-date';
            dateLabel.textContent = `${dayData.date.getDate()}日`;

            cell.appendChild(dateLabel);
            dom.weekTimeline.appendChild(cell);
        });
    }

    // 获取星期几的中文名称
    function getDayOfWeekChinese(dayIndex) {
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        return days[dayIndex];
    }

    // 获取某天的随机微行为（模拟数据）
    function getRandomActionForDay(dateString) {
        // 在实际应用中，这里应该从历史数据中获取
        // 现在使用模拟数据
        const actions = [
            '慢慢走去倒一杯水，感受杯子的温度',
            '站在窗前深呼吸三次，观察窗外的一处细节',
            '轻轻按摩双手每个手指，感受触感',
            '闭上眼睛，倾听周围的三种声音',
            '慢慢拉伸颈部，左右各保持5秒',
            '用手指在桌面画一个完整的圆',
            '注意自己的呼吸节奏，不要改变它'
        ];
        return actions[Math.floor(Math.random() * actions.length)];
    }

    // 设置单元格点击事件
    function setupCellClickEvents() {
        if (!dom.weekTimeline) return;

        // 使用事件委托处理单元格点击
        dom.weekTimeline.addEventListener('click', function(e) {
            const cell = e.target.closest('.weather-cell');
            if (!cell) return;

            // 移除其他单元格的active类
            document.querySelectorAll('.weather-cell').forEach(c => {
                c.classList.remove('active');
            });

            // 添加active类到当前单元格
            cell.classList.add('active');

            // 显示详情
            showCellDetail(cell);
        });

        // 详情关闭按钮
        if (dom.detailClose) {
            dom.detailClose.addEventListener('click', function() {
                dom.cellDetail.classList.add('hidden');
                // 移除所有单元格的active状态
                document.querySelectorAll('.weather-cell').forEach(c => {
                    c.classList.remove('active');
                });
            });
        }
    }

    // 显示单元格详情
    function showCellDetail(cell) {
        if (!dom.cellDetail || !cell) return;

        const dateStr = cell.dataset.date;
        const emotion = cell.dataset.emotion;
        const intensity = cell.dataset.intensity;
        const action = cell.dataset.action;

        // 解析日期
        const date = new Date(dateStr + 'T00:00:00');
        const dateFormatted = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        // 获取情绪信息
        const emotionData = emotions[emotion];

        // 更新详情内容
        dom.detailDate.textContent = dateFormatted;

        if (emotionData) {
            // 有情绪记录的情况
            dom.detailWeather.innerHTML = `
                <div class="detail-icon">${emotionData.icon}</div>
                <div class="detail-info">
                    <div class="detail-title">${emotionData.weatherTitle}</div>
                    <div class="detail-intensity">强度: ${intensity}/5</div>
                </div>
            `;
            dom.detailTitle.textContent = emotionData.weatherTitle;
            dom.detailIntensity.textContent = `强度: ${intensity}/5`;
        } else {
            // 无记录的情况
            dom.detailWeather.innerHTML = `
                <div class="detail-icon">🌤️</div>
                <div class="detail-info">
                    <div class="detail-title">晴间多云</div>
                    <div class="detail-intensity">未记录情绪</div>
                </div>
            `;
            dom.detailTitle.textContent = '晴间多云';
            dom.detailIntensity.textContent = '未记录情绪';
        }

        dom.detailAction.innerHTML = `
            <div class="detail-action-label">当日微行为:</div>
            <div class="detail-action-text">${action}</div>
        `;

        // 显示详情面板
        dom.cellDetail.classList.remove('hidden');
    }

    // 更新每周总结
    function updateWeeklySummary() {
        if (!dom.mostFrequentWeather || !dom.avgIntensity || !dom.interventionsCount) return;

        // 获取最近7天的数据
        const today = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];

            const moodEntry = state.moodHistory.find(entry => entry.date === dateString);
            if (moodEntry) {
                weekData.push(moodEntry);
            }
        }

        // 计算统计数据
        const emotionCounts = {};
        let totalIntensity = 0;
        let recordedDays = 0;

        weekData.forEach(entry => {
            // 统计情绪频率
            emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
            // 累计强度
            totalIntensity += entry.intensity;
            recordedDays++;
        });

        // 找出最常见的情绪
        let mostFrequentEmotion = '无记录';
        let maxCount = 0;

        Object.entries(emotionCounts).forEach(([emotion, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentEmotion = emotions[emotion]?.name || emotion;
            }
        });

        // 计算平均强度
        const avgIntensity = recordedDays > 0 ? (totalIntensity / recordedDays).toFixed(1) : '0.0';

        // 干预完成次数（模拟数据）
        const interventionsCount = Math.floor(Math.random() * 15) + 5; // 5-19次

        // 更新DOM
        dom.mostFrequentWeather.textContent = mostFrequentEmotion;
        dom.avgIntensity.textContent = avgIntensity;
        dom.interventionsCount.textContent = interventionsCount;
    }

    // ====================
    // 初始化应用
    // ====================
    init();
});