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
        subtitle: "creator",
        description: "I work as a data scientist, passionate about turning ideas into real projects. I try my best to keep up with the latest advancements in AI, learning the newest techniques and methods. Recently, I'm also starting new learning including technologies I'm interested in such as Unreal Engine 5.",
        contactBtn: "Contact Me",
        projectsBtn: "Projects",
        writingBtn: "Writing"
    },

    // About section
    about: {
        title: "About Me",
        subtitle: "Connecting Research and Industry",
        text: "I work as a data scientist, currently living in Waterloo, Canada, and employed at Geotab. My current work focuses on building production-level generative AI systems, including AI conversational agents and large-scale retrieval systems, combining technologies such as vector databases, knowledge graphs, semantic ranking, agents, SQL generation, and more.\n\nBeyond my day job, I'm also passionate about working on my own projects. Recently, I've been enthusiastic about reinforcement learning, evolutionary algorithms, and 3D reconstruction techniques. More specifically, projects like reinforcement learning-based racing simulators, local open-source LLM agent virtual games, and 3D reconstruction models (NeRF, Gaussian Splatting). I also write weekly articles about AI researchers and algorithms, incorporating a lot of personal thinking.\n\nI value clear explanations of algorithms, preferring clarity over abstract concept listings, and I believe in the power of persistence. Whether writing code, reading papers, or working on hobby projects, I try my best to integrate AI into my workflow.",
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
        title: "Beer Self-Ratings",
        subtitle: "Tasting Various Beers",
        description: "Besides AI and programming, I also enjoy exploring and drinking some beer. I've developed my own rating system (all subjective, no objectivity🤪), casually evaluating from multiple dimensions, flavor characteristics to overall experience🍺. Each beer gets an informal rating⭐.",
        viewBtn: "View My Beer Ratings →",
        heroTitle: "🍺 Beer Scoring Reviews",
        heroDescription: "My personal beer ratings covering 6 key aspects: Maltiness, Color Depth, Clarity, Bitterness, Other Aromas, and Overall. Each aspect is rated on a scale of 1-10.",
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
        subtitle: "Explore collaboration opportunities for AI/ML projects together",
        email: "Email",
        location: "Location",
        locationValue: "Waterloo, Ontario",
        socialTitle: "Connect with me",
        linkedin: "LinkedIn",
        github: "GitHub",
        twitter: "Twitter",
        resume: "Resume",
        ctaText: "Let's do fun stuff together",
        ctaButton: "Contact Me"
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
