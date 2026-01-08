/**
 * Chinese translations (简体中文)
 * 模块化翻译文件 - 易于编辑和扩展
 */

const translations_zh = {
    // 网站品牌
    brand: {
        name: "张信"
    },

    // 导航
    nav: {
        about: "关于",
        projects: "项目",
        writing: "文章",
        beer: "啤酒",
        contact: "联系"
    },

    // 主页横幅
    hero: {
        title: "数据科学家与研究员",
        prefix: "我是一个 ",
        subtitle: "创造者",
        description: "我的工作是数据科学家，热衷于将想法落地成真实的的项目。我平时尽量让自己跟上人工智能的最新进展，学习最新的技术方法，最近也要开展新的学习包括虚幻引擎5等我感兴趣的技术。",
        contactBtn: "联系我",
        projectsBtn: "项目展示",
        writingBtn: "文章作品"
    },

    // 关于部分
    about: {
        title: "关于我",
        subtitle: "连接研究与产业",
        text: "我的工作是数据科学家，现在住在加拿大滑铁卢，目前就职于Geotab。我目前的工作重点是搭建生产级生成式AI系统，包括人工智能对话Agent和大规模检索系统，这部分工作结合了向量数据库、知识图谱、语义排序、智能体、SQL生成等等一系列技术。\n\n在本职工作之外，我也热衷于做自己的项目，最近热衷于强化学习、进化算法和三维重建技术。具体一些讲比如说基于强化学习的赛车模拟器、本地开源LLM的智能体虚拟游戏以及3D重建模型（NeRF、高斯溅射）。我还每周撰写关于的AI研究者和算法的文章，也融合了很多个人思考。\n\n我重视算法讲解，喜欢调理清晰清晰而非抽象罗列概念，重视坚持的力量。无论是写代码、阅读论文还是业余项目，我都尽量将AI整合到我的工作流程之中。",
        skillsTitle: "技能与技术",
        skillMachineLearning: "机器学习",
        skillProgramming: "编程",
        skillFrameworks: "框架与工具",
        skillGenAI: "生成式AI",
        skillCV: "计算机视觉",
        skillNLP: "自然语言处理",
        skillRL: "强化学习",
        skillPython: "Python",
        skillSQL: "SQL",
        skillPyTorch: "PyTorch",
        skillScikit: "Scikit-learn",
        skillDocker: "Docker"
    },

    // 项目部分
    projects: {
        title: "项目展示",
        comment1: "项目画廊 - Bento网格布局",
        comment2: "添加新项目：",
        comment3: "1. 打开 js/main.js",
        comment4: "2. 找到文件顶部的 'projects' 数组",
        comment5: "项目将自动显示在下方的画廊中。",
        codeBtn: "代码",
        demoBtn: "演示"
    },

    // 文章部分
    writing: {
        title: "写作与阅读",
        subtitle: "我的每周博客写作和每日论文阅读。",
        comment: "写作与阅读部分 - 时间轴布局",
        filterTitle: "筛选：",
        filterAll: "全部",
        filterBlogPosts: "博客文章",
        filterPapers: "论文阅读",
        typePaperReading: "论文阅读",
        typeBlogPost: "博客文章",
        readMoreBtn: "阅读更多"
    },

    // 啤酒部分
    beer: {
        title: "啤酒自评",
        subtitle: "品鉴各种啤酒",
        description: "除了AI和编程，我还喜欢探索喝点啤酒。我开发了自己的评分系统（全是主观，没有客观🤪），从几个维度随意评价，风味特征到整体体验🍺。每款啤酒都会得到一个非正式的评价⭐。",
        viewBtn: "查看我的啤酒评鉴 →",
        heroTitle: "🍺 啤酒评分评鉴",
        heroDescription: "我对啤酒的个人评分，涵盖6个关键方面：麦芽香、颜色深浅、清澈度、苦度、其他香味和综合评价。每项的评分范围为1-10分。",
        sortLabel: "排序方式：",
        sortOverall: "综合评分",
        sortMaltiness: "麦芽香",
        sortColorDepth: "颜色深浅",
        sortClarity: "清澈度",
        sortBitterness: "苦度",
        sortOtherAromas: "其他香味",
        sortDate: "添加日期（最新）",
        // 图表标签 - 保持中文，因为这些是特定领域术语
        labelMalt: "麦芽",
        labelDepth: "深浅",
        labelClarity: "清澈",
        labelBitter: "苦度",
        labelAromas: "香味",
        labelOverall: "综合",
        // 工具提示的完整标签
        labelMaltinessFull: "麦芽香",
        labelColorDepthFull: "颜色深浅",
        labelClarityFull: "清澈度",
        labelBitternessFull: "苦度",
        labelOtherAromasFull: "其他香味",
        labelOverallFull: "综合"
    },

    // 联系部分
    contact: {
        title: "联系方式",
        subtitle: "一起探索AI/ML项目的合作机会",
        email: "邮箱",
        location: "位置",
        locationValue: "滑铁卢，安大略省",
        socialTitle: "与我联系",
        linkedin: "领英",
        github: "GitHub",
        twitter: "推特",
        resume: "简历",
        ctaText: "让我们一起做有趣的事情",
        ctaButton: "联系我"
    },

    // 页脚
    footer: {
        copyright: "© 2024 AI/ML工程师。保留所有权利。"
    },

    // 无障碍标签
    a11y: {
        skipLink: "跳转到主要内容",
        toggleNav: "切换导航菜单",
        contactDesc: "跳转到联系信息部分",
        projectsDesc: "跳转到项目展示部分",
        writingDesc: "跳转到写作和研究部分"
    }
};

// Export to window object
window.translations_zh = translations_zh;
