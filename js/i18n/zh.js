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
        description: "我是一位热情的数据科学家，热衷于将想法转化为生动、富有创意的项目。我紧跟人工智能的最新进展，不断学习探索前沿技术，包括虚幻引擎5。",
        contactBtn: "联系我",
        projectsBtn: "项目展示",
        writingBtn: "文章作品"
    },

    // 关于部分
    about: {
        title: "关于我",
        subtitle: "连接研究与产业",
        text: "我是一名高级AI/ML工程师和数据科学家，现居加拿大滑铁卢，目前就职于Geotab。我的工作专注于构建生产级生成式AI系统，包括对话式分析助手和大规模检索管道，这些管道结合了向量数据库、知识图谱、语义排序和SQL生成。我深入参与系统设计和底层实现，强烈偏好技术上稳健、高效且可衡量的解决方案。\n\n在本职工作之外，我是一名活跃的独立研究者和构建者。我通过实践项目探索强化学习、进化算法和现代生成模型，如基于强化学习的赛车模拟器、本地LLM驱动的智能体系统以及3D重建管道（NeRF、高斯溅射）。我还每周撰写关于有影响力的AI研究者和算法的文章，融合历史背景、数学直觉和个人思考。\n\n我重视深度而非炒作，重视清晰而非抽象，重视行动而非空谈。无论是编写代码、研究论文还是构建副项目，我都将AI视为一门工程学科和创意工具——它扩展而非替代人类的能力。",
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
        subtitle: "我的持续每周博客写作和每日论文阅读。",
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
        title: "啤酒评分",
        subtitle: "我探索和品鉴世界各地精酿啤酒的个人旅程",
        description: "除了AI和编程，我还喜欢探索精酿啤酒的世界。我开发了一套评分系统（以我自己作为高度主观的评委🤪），从多个维度随意评价啤酒，从风味特征到整体体验🍺。每款啤酒都会得到一个非正式的评价，并通过雷达图可视化其独特特征⭐。",
        viewBtn: "查看我的啤酒评分 →",
        heroTitle: "🍺 啤酒评分集合",
        heroDescription: "我对精酿啤酒的个人评分，涵盖6个关键方面：麦芽香、颜色深浅、浑浊度、苦度、其他香味和综合评价。每款啤酒的评分范围为1-10分，并通过雷达图进行可视化。",
        sortLabel: "排序方式：",
        sortOverall: "综合评分",
        sortMaltiness: "麦芽香",
        sortColorDepth: "颜色深浅",
        sortClarity: "浑浊度",
        sortBitterness: "苦度",
        sortOtherAromas: "其他香味",
        sortDate: "添加日期（最新）",
        // 图表标签 - 保持中文，因为这些是特定领域术语
        labelMalt: "麦芽",
        labelDepth: "深浅",
        labelClarity: "浑浊",
        labelBitter: "苦度",
        labelAromas: "香味",
        labelOverall: "综合",
        // 工具提示的完整标签
        labelMaltinessFull: "麦芽香",
        labelColorDepthFull: "颜色深浅",
        labelClarityFull: "浑浊度",
        labelBitternessFull: "苦度",
        labelOtherAromasFull: "其他香味",
        labelOverallFull: "综合"
    },

    // 联系部分
    contact: {
        title: "联系方式",
        subtitle: "让我们联系并探索AI/ML项目的合作机会",
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
