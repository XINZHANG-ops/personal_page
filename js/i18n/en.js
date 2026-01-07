/**
 * English translations
 * Modular translation file - easy to edit and extend
 */

const translations_en = {
    // Site brand
    brand: {
        name: "XIN ZHANG"
    },

    // Navigation
    nav: {
        about: "About",
        projects: "Projects",
        writing: "Writing",
        beer: "Beer",
        contact: "Contact"
    },

    // Hero section
    hero: {
        title: "Data Scientist & Researcher",
        prefix: "I'm a ",
        subtitle: "builder",
        description: "I'm an enthusiastic data scientist who loves turning ideas into living, creative projects. I stay closely aligned with the latest advancements in AI, and I'm a continuous learner exploring cutting-edge technologies, including Unreal Engine 5.",
        contactBtn: "Contact",
        projectsBtn: "Projects",
        writingBtn: "Writing"
    },

    // About section
    about: {
        title: "About",
        subtitle: "Bridging Research and Industry",
        text: "I am a senior AI/ML engineer and data scientist based in Waterloo, Canada, currently working at Geotab. My work focuses on building production-grade generative AI systems, including conversational analytics assistants and large-scale retrieval pipelines that combine vector databases, knowledge graphs, semantic ranking, and SQL generation. I'm deeply involved in both system design and low-level implementation, with a strong preference for solutions that are technically sound, efficient, and measurable.\n\nBeyond my day job, I'm an active independent researcher and builder. I explore reinforcement learning, evolutionary algorithms, and modern generative models through hands-on projects such as RL-based racing simulators, local-LLM-driven agent systems, and 3D reconstruction pipelines (NeRF, Gaussian Splatting). I also write weekly essays on influential AI researchers and algorithms, blending historical context with mathematical intuition and personal reflection.\n\nI value depth over hype, clarity over abstraction, and action over speculation. Whether writing code, studying papers, or building side projects, I approach AI as both an engineering discipline and a creative tool—one that expands human capacity rather than replaces it.",
        skillsTitle: "Skills & Technologies",
        skillMachineLearning: "Machine Learning",
        skillProgramming: "Programming",
        skillFrameworks: "Frameworks & Tools",
        skillGenAI: "Generative AI",
        skillCV: "Computer Vision",
        skillNLP: "Natural Language Processing",
        skillRL: "Reinforcement Learning",
        skillPython: "Python",
        skillSQL: "SQL",
        skillPyTorch: "PyTorch",
        skillScikit: "Scikit-learn",
        skillDocker: "Docker"
    },

    // Projects section
    projects: {
        title: "Projects",
        comment1: "Projects Gallery - Bento Grid Layout",
        comment2: "To add new projects:",
        comment3: "1. Open js/main.js",
        comment4: "2. Find the 'projects' array at the top of the file",
        comment5: "The projects will automatically appear in the gallery below.",
        codeBtn: "Code",
        demoBtn: "Demo"
    },

    // Writing section
    writing: {
        title: "Writing & Reading",
        subtitle: "My continuous weekly blog writing and daily paper reading.",
        comment: "Writing & Reading Section - Timeline Layout",
        filterTitle: "Filter by:",
        filterAll: "All",
        filterBlogPosts: "Blog Posts",
        filterPapers: "Papers Readings",
        typePaperReading: "Paper Reading",
        typeBlogPost: "Blog Post",
        readMoreBtn: "Read More"
    },

    // Beer section
    beer: {
        title: "Beer Scoring",
        subtitle: "My personal journey exploring and rating craft beers from around the world",
        description: "Beyond AI and Coding, I enjoy exploring the world of craft beer. I've developed a scoring system (with myself as the highly subjective judge🤪) to casually rate beers across multiple dimensions, from flavor profiles to overall experience🍺. Each beer gets a very informal evaluation and is visualized through radar charts showing its unique characteristics⭐.",
        viewBtn: "View My Beer Ratings →",
        heroTitle: "🍺 Beer Scoring Collection",
        heroDescription: "My personal ratings of craft beers across 6 key aspects: 麦芽香 (Maltiness), 颜色深浅 (Color Depth), 浑浊度 (Clarity), 苦度 (Bitterness), 其他香味 (Other Aromas), and 综合 (Overall). Each beer is scored on a scale of 1-10 and visualized with a radar chart.",
        sortLabel: "Sort by:",
        sortOverall: "Overall Score",
        sortMaltiness: "Maltiness",
        sortColorDepth: "Color Depth",
        sortClarity: "Clarity",
        sortBitterness: "Bitterness",
        sortOtherAromas: "Other Aromas",
        sortDate: "Date Added (Newest)",
        // Chart labels - keep in Chinese as they are domain-specific
        labelMalt: "Malt",
        labelDepth: "Depth",
        labelClarity: "Clarity",
        labelBitter: "Bitter",
        labelAromas: "Aromas",
        labelOverall: "Overall",
        // Full labels for tooltips
        labelMaltinessFull: "Maltiness",
        labelColorDepthFull: "Color Depth",
        labelClarityFull: "Clarity",
        labelBitternessFull: "Bitterness",
        labelOtherAromasFull: "Other Aromas",
        labelOverallFull: "Overall"
    },

    // Contact section
    contact: {
        title: "Contact",
        subtitle: "Let's connect and explore opportunities to collaborate on AI/ML projects",
        email: "Email",
        location: "Location",
        locationValue: "Waterloo, ON",
        socialTitle: "Connect with me",
        linkedin: "LinkedIn",
        github: "GitHub",
        twitter: "Twitter",
        resume: "Resume",
        ctaText: "let's do fun stuff together",
        ctaButton: "Get in Touch"
    },

    // Footer
    footer: {
        copyright: "© 2024 AI/ML Engineer. All rights reserved."
    },

    // Accessibility labels
    a11y: {
        skipLink: "Skip to main content",
        toggleNav: "Toggle navigation menu",
        contactDesc: "Navigate to contact information section",
        projectsDesc: "Navigate to projects showcase section",
        writingDesc: "Navigate to writing and research section"
    }
};

// Export to window object
window.translations_en = translations_en;
