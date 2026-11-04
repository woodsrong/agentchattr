/**
 * i18n.js -- theme + language preferences for agentchattr
 *
 * Both are per-browser preferences kept in localStorage (not server settings),
 * so each viewer picks their own. The theme is applied as data-theme on <html>
 * (an inline script in <head> sets it before first paint to avoid a flash).
 *
 * Translation is DOM-based: the English UI text is the key. Text nodes and the
 * title/placeholder/aria-label attributes whose whole text matches a dictionary
 * entry (or a pattern below) are swapped for Chinese, and a MutationObserver
 * keeps dynamically rendered UI translated. The English original is remembered
 * per node so switching back restores it. Chat/job message bodies, names and
 * other user content are never touched (see SKIP_SELECTOR).
 */

const I18n = (() => {
    const LS_LANG = 'agentchattr-lang';
    const LS_THEME = 'agentchattr-theme';
    const LANGS = ['en', 'zh'];
    const THEMES = ['dark', 'light'];

    // Content written by users or agents; must stay exactly as sent.
    const SKIP_SELECTOR = [
        '[data-no-i18n]',
        '.msg-text', '.msg-sender', '.job-msg-text', '.job-title', '.job-brief-text',
        '.proposal-title', '.proposal-body', '.summary-text', '.rule-text',
        '.rule-proposal-text', '.mention-name', '.session-tmpl-name',
    ].join(',');
    // Elements whose own text is never UI text (their attributes still are).
    const SKIP_TEXT_TAGS = 'script,style,textarea,input,pre,code';
    const ATTRS = ['title', 'placeholder', 'aria-label'];

    const ZH = {
        // --- Header / settings ---
        'Jobs': '任务',
        'Rules': '规则',
        'Pinned messages': '置顶消息',
        'Pinned': '置顶',
        'Settings': '设置',
        'Help': '帮助',
        'Guide': '指南',
        'Join the Discord': '加入 Discord',
        'Name': '名称',
        'your name': '你的名字',
        'This server': '本服务器',
        'e.g. urbly': '例如 urbly',
        'Shown next to agentchattr, to tell this server apart from others': '显示在 agentchattr 旁边，用于区分不同的服务器',
        'Theme': '主题',
        'Dark': '深色',
        'Light': '浅色',
        'Language': '语言',
        'Font': '字体',
        'Monospace': '等宽',
        'Sans': '无衬线',
        'Loop guard': '循环保护',
        'Max agent-to-agent hops before pausing': '暂停前智能体之间的最大转发次数',
        'History': '历史记录',
        'All': '全部',
        'Contrast': '对比度',
        'Normal': '普通',
        'High': '高',
        'Channels': '频道',
        'Top bar': '顶部栏',
        'Sidebar': '侧边栏',
        'Show channels in a sidebar (Discord/Slack-style) instead of a top bar': '在侧边栏（类似 Discord/Slack）而不是顶部栏显示频道',
        'Rule refresh': '规则刷新',
        'How often to re-send active rules to agents': '多久向智能体重新发送一次已启用的规则',
        'On rule changes': '规则变更时',
        'Project History': '项目历史',
        'Export History': '导出历史',
        'Import History': '导入历史',
        'Default sound': '默认提示音',
        'Background alerts': '后台提醒',
        'Use default': '使用默认',
        'Soft Chime': '轻柔钟声',
        'Bright Ping': '明亮提示',
        'Gentle Pop': '轻柔气泡',
        'Alert Tone': '警示音',
        'Pluck': '拨弦',
        'Click': '点击',
        'Warm Bell': '温暖铃声',
        'None': '无',

        // --- Channels / session bar ---
        'Add channel': '添加频道',
        'Support development': '支持开发',
        'Rename': '重命名',
        'Create': '创建',
        'channel-name': '频道名称',
        'Confirm delete': '确认删除',
        'Go to channel': '前往频道',
        'End Session': '结束会话',
        'End Session?': '确定结束会话？',
        'Confirm end session': '确认结束会话',
        'Waiting for your choice': '等待你的选择',
        'Paused': '已暂停',

        // --- Timeline / agents ---
        'Loading messages...': '正在加载消息…',
        'is thinking...': '正在思考…',
        'joined': '加入了',
        'left': '离开了',
        'Name this agent': '为此智能体命名',
        'Rename agent': '重命名智能体',
        'Confirm': '确认',
        'Role': '角色',
        'Color': '颜色',
        'Custom...': '自定义…',
        'Custom role...': '自定义角色…',
        'Set role': '设置角色',
        'choose a role': '选择角色',
        'Pick custom color': '选择自定义颜色',
        'Reset to default': '恢复默认',
        'Reset': '重置',
        'all agents': '所有智能体',
        'No pinned messages': '没有置顶消息',
        'Remove from todos': '从待办中移除',
        'reply': '回复',
        'replying to': '回复',
        'del': '删除',
        'Delete': '删除',
        'Cancel': '取消',
        'Dismiss': '忽略',
        'Accept': '接受',
        'Accepted': '已接受',
        'Dismissed': '已忽略',
        'Activate': '启用',
        'Add to drafts': '加入草稿',
        'Request Changes': '请求修改',
        'Job Proposal': '任务提案',
        'Rule Proposal': '规则提案',
        'Session Proposal': '会话提案',
        'Summary': '摘要',
        'You chose:': '你选择了：',
        'convert to job': '转为任务',
        'Convert to job': '转为任务',
        'Copy message': '复制消息',
        'copy': '复制',
        'copied!': '已复制！',
        'failed': '失败',
        'pin': '置顶',
        'unpin': '取消置顶',
        'done?': '完成？',
        'Open in file manager': '在文件管理器中打开',
        'Press Esc or click outside to close': '按 Esc 或点击外部关闭',

        // --- Footer / input ---
        'Clear Chat': '清空聊天',
        'Clear Chat?': '确定清空聊天？',
        'Clear chat in this channel': '清空此频道的聊天',
        'Confirm clear chat': '确认清空聊天',
        'See all': '查看全部',
        'Start a session': '开始会话',
        'Type a message... (use @name to mention agents)': '输入消息…（使用 @名称 提及智能体）',
        'Voice typing (local speech-to-text)': '语音输入（本地语音转文字）',
        'Voice typing': '语音输入',
        'Send': '发送',
        'Schedule message': '定时发送消息',
        'Schedule': '定时',
        'When': '日期',
        'At': '时间',
        'Today': '今天',
        'Tomorrow': '明天',
        'Sunday': '星期日',
        'Monday': '星期一',
        'Tuesday': '星期二',
        'Wednesday': '星期三',
        'Thursday': '星期四',
        'Friday': '星期五',
        'Saturday': '星期六',
        'In a while from now': '从现在起一段时间后',
        'In': '在',
        'Recurring': '重复',
        'Every': '每隔',
        'minutes': '分钟',
        'hours': '小时',
        'days': '天',
        'Toggle an agent to set a target': '请选择一个智能体作为目标',
        'Type a message first': '请先输入消息',
        'Set how long from now': '请设置距现在的时长',
        'That time has already passed': '该时间已过',
        'Enter to send · Shift+Enter for newline · Paste or drop files · Mic for voice · Type / or @ for autocomplete':
            '回车发送 · Shift+回车换行 · 粘贴或拖入文件 · 麦克风语音输入 · 输入 / 或 @ 自动补全',
        'Drop files here': '拖放文件到此处',
        'Reconnecting. Your message has not been sent.': '正在重新连接，你的消息尚未发送。',
        'Remove from queue': '从队列中移除',

        // --- Slash commands ---
        'SVG art challenge — all agents create artwork (optional theme)': 'SVG 艺术挑战：所有智能体创作作品（可指定主题）',
        'All agents design a hat to wear on their avatar': '所有智能体为自己的头像设计一顶帽子',
        'Get all agents to review and roast each other\'s work': '让所有智能体互相评审并吐槽对方的作品',
        'Agents write a haiku about the codebase': '智能体围绕代码库写一首俳句',
        'Agents write a limerick about the codebase': '智能体围绕代码库写一首五行打油诗',
        'Agents write a sonnet about the codebase': '智能体围绕代码库写一首十四行诗',
        'Summarize recent messages — tag an agent (e.g. /summary @claude)': '总结最近的消息：需 @ 一个智能体（如 /summary @claude）',
        'Summarize recent messages — tag an agent (e.g. /summarise @claude)': '总结最近的消息：需 @ 一个智能体（如 /summarise @claude）',
        'Resume after loop guard pauses': '循环保护暂停后继续',
        'Clear messages in current channel': '清空当前频道的消息',

        // --- Jobs ---
        'Create Job': '创建任务',
        'Back': '返回',
        'To Do': '待办',
        'Active': '进行中',
        'Closed': '已关闭',
        'TO DO': '待办',
        'ACTIVE': '进行中',
        'CLOSED': '已关闭',
        'Reply target': '回复对象',
        'To': '发给',
        'Clear reply target': '清除回复对象',
        'Reply target: none (Tab to choose)': '回复对象：无（按 Tab 选择）',
        'none': '无',
        'Message...': '消息…',
        'Send to assign · click to edit': '发送即可分配 · 点击编辑',
        'Job title': '任务标题',
        'Description (optional)': '描述（可选）',
        'Open job': '打开任务',
        'Unread messages': '未读消息',
        'Create your first job': '创建你的第一个任务',
        'Track work items with threaded conversations. Use @mentions to loop in agents.': '通过会话串跟踪工作事项，使用 @ 提及让智能体参与。',
        'An agent will write a job proposal for you to accept': '智能体会撰写任务提案供你接受',
        'Ask agent to write proposal': '让智能体撰写提案',
        'Convert to Job': '转为任务',
        'Convert': '转换',
        'Suggestion': '建议',
        'DEL': '删除',
        'Delete?': '确定删除？',
        'Delete Job Permanently?': '永久删除此任务？',
        'This removes the job and its messages permanently. This cannot be undone.': '这会永久删除该任务及其消息，且无法撤销。',
        'Drag here to delete': '拖到此处删除',
        'Failed to load messages.': '加载消息失败。',
        'No messages yet. Start the conversation!': '还没有消息，开始对话吧！',
        'Yes': '是',
        'No': '否',

        // --- Rules ---
        'Remind agents': '提醒智能体',
        'Add Rule': '添加规则',
        'No rules yet': '还没有规则',
        'Tell your agents how to work': '告诉智能体该如何工作',
        'Write a short rule agents should follow': '写一条智能体应遵守的简短规则',
        'Save': '保存',
        'Queued — next trigger': '已排队，下次触发时发送',
        'New rules are sent on the next agent trigger': '新规则将在下次触发智能体时发送',

        // --- Sessions ---
        'Start a Session': '开始会话',
        'Start Session': '开始会话',
        'Ask an agent to draft a custom session template': '让智能体起草自定义会话模板',
        'Ask': '询问',
        'Run': '运行',
        'Save Template': '保存模板',
        'Saved': '已保存',
        'Delete custom template': '删除自定义模板',
        'Invalid session draft': '会话草稿无效',
        'This draft needs changes before it can be run or saved.': '此草稿需要修改后才能运行或保存。',
        'View output': '查看输出',
        'Describe the session you want...': '描述你想要的会话…',
        'Goal (optional) -- what should this session achieve?': '目标（可选）：这个会话要达成什么？',
        'Goal (optional)': '目标（可选）',
        'What changes do you want?': '你想做哪些修改？',

        // --- Toasts ---
        'History exported': '历史已导出',
        'Export failed': '导出失败',
        'Import failed': '导入失败',
        'Importing...': '正在导入…',
    };

    // Strings with interpolated values. First match wins.
    const PATTERNS = [
        [/^Every (\d+) triggers$/, (m) => `每 ${m[1]} 次触发`],
        [/^Waiting for (.+)$/, (m) => `等待 ${m[1]}`],
        [/^(\d+) active$/, (m) => `${m[1]} 条已启用`],
        [/^(\d+) paused schedules?$/, (m) => `${m[1]} 个已暂停的定时任务`],
        [/^(.*) \(paused\)$/, (m) => `${m[1]}（已暂停）`],
        [/^Uploading (.+)…$/, (m) => `正在上传 ${m[1]}…`],
        [/^Export failed: (.*)$/, (m) => `导出失败：${m[1]}`],
        [/^Import failed: (.*)$/, (m) => `导入失败：${m[1]}`],
        [/^Delete (\d+) selected$/, (m) => `删除所选 ${m[1]} 项`],
        [/^Reply target: (.+) \(Tab to cycle\)$/, (m) => `回复对象：${m[1]}（按 Tab 切换）`],
        [/^Remove (.+)$/, (m) => `移除 ${m[1]}`],
        [/^A new (.+) instance connected$/, (m) => `有新的 ${m[1]} 实例已连接`],
        [/^Current ID: (.+)$/, (m) => `当前 ID：${m[1]}`],
        [/^delete #(.+)\?$/, (m) => `删除 #${m[1]}？`],
        [/^Could not update rule: (.*)$/, (m) => `无法更新规则：${m[1]}`],
        [/^Could not dismiss rule: (.*)$/, (m) => `无法忽略规则：${m[1]}`],
    ];

    function read(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
    }

    let lang = LANGS.includes(read(LS_LANG)) ? read(LS_LANG) : 'en';
    let theme = THEMES.includes(read(LS_THEME)) ? read(LS_THEME) : 'dark';

    function translate(text) {
        if (lang === 'en') return text;
        const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
        const core = m[2].replace(/\s+/g, ' ');
        if (!core) return text;
        let out = ZH[core];
        if (out === undefined) {
            for (const [re, fn] of PATTERNS) {
                const hit = core.match(re);
                if (hit) { out = fn(hit); break; }
            }
        }
        // Keep the original leading/trailing whitespace (e.g. " joined" after a name).
        return out === undefined ? text : m[1] + out + m[3];
    }

    // Swap text for a node/attribute, remembering the English original so that the
    // text can be restored, and so text the app rewrites later is treated as new.
    const textState = new WeakMap();   // Text node -> {orig, shown}
    const attrState = new WeakMap();   // Element -> {attr: {orig, shown}}

    function skipped(el) {
        return !el || !!el.closest(SKIP_SELECTOR);
    }

    function processText(node) {
        const parent = node.parentElement;
        if (skipped(parent) || parent.closest(SKIP_TEXT_TAGS)) return;
        const cur = node.nodeValue;
        const st = textState.get(node);
        const orig = st && st.shown === cur ? st.orig : cur;
        const target = translate(orig);
        if (target !== cur) node.nodeValue = target;
        if (target !== orig || st) textState.set(node, { orig, shown: target });
    }

    function processAttr(el, attr) {
        if (skipped(el)) return;
        const cur = el.getAttribute(attr);
        if (cur === null) return;
        let states = attrState.get(el);
        const st = states && states[attr];
        const orig = st && st.shown === cur ? st.orig : cur;
        const target = translate(orig);
        if (target !== cur) el.setAttribute(attr, target);
        if (target !== orig || st) {
            if (!states) { states = {}; attrState.set(el, states); }
            states[attr] = { orig, shown: target };
        }
    }

    function processTree(root) {
        if (root.nodeType === Node.TEXT_NODE) { processText(root); return; }
        if (root.nodeType !== Node.ELEMENT_NODE || skipped(root)) return;
        const attrSel = ATTRS.map((a) => `[${a}]`).join(',');
        if (root.matches(attrSel)) ATTRS.forEach((a) => processAttr(root, a));
        root.querySelectorAll(attrSel).forEach((el) => ATTRS.forEach((a) => processAttr(el, a)));
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) processText(n);
    }

    const observer = new MutationObserver((records) => {
        if (lang === 'en') return;
        for (const r of records) {
            if (r.type === 'childList') r.addedNodes.forEach(processTree);
            else if (r.type === 'characterData') processText(r.target);
            else if (r.type === 'attributes') processAttr(r.target, r.attributeName);
        }
    });

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', theme);
    }

    function applyLanguage() {
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
        processTree(document.body);
    }

    function setTheme(value) {
        if (!THEMES.includes(value)) return;
        theme = value;
        write(LS_THEME, value);
        applyTheme();
    }

    function setLanguage(value) {
        if (!LANGS.includes(value)) return;
        lang = value;
        write(LS_LANG, value);
        applyLanguage();
    }

    // For strings built in JS that the DOM pass cannot see (e.g. confirm dialogs).
    function t(text) {
        return translate(text);
    }

    function init() {
        applyTheme();
        for (const [id, get, set] of [
            ['setting-theme', () => theme, setTheme],
            ['setting-language', () => lang, setLanguage],
        ]) {
            const el = document.getElementById(id);
            if (!el) continue;
            el.value = get();
            el.addEventListener('change', () => set(el.value));
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && typeof toggleSettings === 'function') toggleSettings();
            });
        }
        applyLanguage();
        observer.observe(document.body, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ATTRS,
        });
    }

    init();
    return { t, setTheme, setLanguage, get lang() { return lang; }, get theme() { return theme; } };
})();

window.I18n = I18n;
