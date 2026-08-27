/**
 * data.js — single source of truth for every piece of content on the site.
 * Edit here; markup and animations pick the changes up automatically.
 */

export const profile = {
  name: "Mohamed Haneef Yaseen",
  initials: "MHY",
  location: "Chennai, Tamil Nadu, India",
  available: "Open to collaboration",

  roles: ["Software Development Engineer 2, IQVIA", "Building Markecast on the side"],

  lede:
    "I build the systems that move health data between hospitals, labs and platforms \u2014 and, in my own time, the data infrastructure behind stock-market forecasting.",

  about: [
    "I am a software engineer in Chennai with over five years of experience, currently a <strong>Software Development Engineer 2 at IQVIA</strong>. Most of my career has been spent in health information technology, designing and maintaining the interfaces that let clinical systems talk to each other reliably.",
    "I started at Aigilx Health as an interface analyst working in <strong>Mirth Connect and Rhapsody</strong>, grew into a senior software engineer role there, and carried that integration-first mindset into product work \u2014 full-stack web and desktop applications across the MERN stack, Django and .NET.",
    "Outside work I have been building <strong>Markecast</strong> since 2024 \u2014 the data infrastructure and analytics behind stock-market forecasting. My degree is in ceramic technology, which is an unusual route into software, but it left me with a materials-science habit of breaking problems down to first principles."
  ],

  stats: [
    { value: 5.5, suffix: "+", label: "Years in software", decimals: 1 },
    { value: 3, suffix: "", label: "Roles held", decimals: 0 },
    { value: 16, suffix: "", label: "Public repositories", decimals: 0 }
  ],

  experience: [
    {
      title: "Software Development Engineer 2",
      org: "IQVIA",
      period: "Nov 2024 — Present",
      location: "Chennai, India",
      current: true,
      points: [
        "Work on ERP systems and LIS integrations, connecting laboratory and enterprise platforms so clinical and operational data moves between them reliably.",
        "Build and maintain Mirth Connect channels alongside Node.js services that handle the routing and transformation behind those integrations.",
        "Support the full delivery lifecycle, from interface design and implementation through to production support of live data flows."
      ],
      tags: ["ERP Systems", "LIS Integrations", "Mirth Connect", "Node.js"]
    },
    {
      title: "Senior Software Engineer",
      org: "Aigilx Health",
      period: "2023 — Nov 2024",
      location: "Chennai, India",
      points: [
        "Led research and development on analytics, investigating how clinical and operational data could be turned into reporting and insight.",
        "Delivered full-stack web and desktop applications, including chatbot work, across MERN, Django and .NET.",
        "Stepped up from interface analysis into broader engineering ownership across the product and integration stack."
      ],
      tags: ["Analytics", "R&D", "MERN", "Django", ".NET"]
    },
    {
      title: "Software Engineer",
      alias: "Interface Analyst",
      org: "Aigilx Health",
      period: "Apr 2021 — 2023",
      location: "Chennai, India",
      points: [
        "Delivered interface and integration work for eMOLST, an electronic medical orders for life-sustaining treatment platform.",
        "Designed, developed and maintained the interfaces that exchange health information between systems and stakeholders.",
        "Worked daily in Mirth Connect and Rhapsody on HL7 message routing, transformation and troubleshooting."
      ],
      tags: ["eMOLST", "Mirth Connect", "Rhapsody", "HL7", "Interface Design"]
    }
  ],

  skills: [
    {
      title: "Healthcare Interoperability",
      items: ["Mirth Connect", "Rhapsody", "HL7", "Interface Design", "Message Routing", "Health Data Exchange"]
    },
    {
      title: "Frontend",
      items: ["React", "Vue", "React Native", "TypeScript", "JavaScript ES6+", "Redux", "HTML5", "CSS3"]
    },
    {
      title: "Backend",
      items: ["Node.js", "Express", "Django", "Flask", ".NET", "Python", "REST APIs"]
    },
    {
      title: "Data & Infrastructure",
      items: ["Elasticsearch", "MongoDB", "SQL", "Data Pipelines", "Google Sheets API", "Analytics", "Vercel"]
    },
    {
      title: "Practice",
      items: ["Git", "Data Structures", "Algorithms", "Chatbots", "Desktop Apps", "Excel", "Godot"]
    }
  ],

  projects: [
    {
      name: "Stocks Way",
      repo: "stocks-way",
      description:
        "The app side of Markecast. Learn, track and forecast equities on top of a data pipeline that feeds market analytics into a TypeScript web app.",
      tags: ["TypeScript", "Analytics", "Fintech"],
      live: "https://stocks-way.vercel.app",
      source: "https://github.com/Haneefyaseen/stocks-way"
    },
    {
      name: "TNPSC Prep",
      repo: "tnpsc",
      description:
        "A study platform built for students preparing for Tamil Nadu government examinations, organising material and practice into a structured learning flow.",
      tags: ["TypeScript", "EdTech", "Next.js"],
      live: "https://tnpsc-seven.vercel.app",
      source: "https://github.com/Haneefyaseen/tnpsc"
    },
    {
      name: "Arabic Learn",
      repo: "arabic-learn",
      description:
        "A language-learning application for Arabic, focused on progressive lessons and retention rather than one-off vocabulary drills.",
      tags: ["TypeScript", "Learning", "UI"],
      live: "https://arabic-learn-sooty.vercel.app",
      source: "https://github.com/Haneefyaseen/arabic-learn"
    },
    {
      name: "DSA Mastery",
      repo: "dsa-mastery",
      description:
        "A working library of data structures and algorithms in TypeScript, kept as a reference implementation and interview-preparation resource.",
      tags: ["TypeScript", "Algorithms", "Reference"],
      source: "https://github.com/Haneefyaseen/dsa-mastery"
    },
    {
      name: "Investics",
      repo: "investics",
      description:
        "The earlier exploration into stock-market prediction, built with Python and Flask and pulling its data through the Google Sheets API. It shaped the thinking that became Markecast.",
      tags: ["Python", "Flask", "Google Sheets API"],
      source: "https://github.com/Haneefyaseen/investics"
    },
    {
      name: "Elasticsearch + Node",
      repo: "elasticsearch",
      description:
        "An integration study wiring Elasticsearch into a Node.js service, covering indexing, query construction and search relevance.",
      tags: ["Elasticsearch", "Node.js", "Search"],
      source: "https://github.com/Haneefyaseen/elasticsearch"
    }
  ],

  venture: {
    name: "Markecast",
    role: "Side project",
    since: "Since 2024",
    description:
      "What I build in my own time: data infrastructure and analytics for stock-market prediction. Getting market data in, making it queryable, and turning it into forecasts a retail investor can actually act on.",
    href: "https://stocks-way.vercel.app",
    points: [
      { term: "Focus", detail: "Data infrastructure and analytics for equity-market forecasting." },
      { term: "Scope", detail: "Built end to end \u2014 ingestion pipelines, storage, the analytics layer and the product surface." },
      { term: "Product", detail: "Stocks Way, a web app for learning, tracking and forecasting stocks." }
    ]
  },

  education: [
    {
      degree: "B.Tech, Ceramic Technology",
      org: "Anna University, Chennai",
      period: "2017 — 2021",
      score: "CGPA 7.08"
    },
    {
      degree: "HSC, Higher Secondary Certificate",
      org: "Shri KrishnaSwamy Matriculation Higher Secondary School",
      period: "2016 — 2017",
      score: "96.67%"
    },
    {
      degree: "SSLC, Secondary School Leaving Certificate",
      org: "Shri KrishnaSwamy Matriculation Higher Secondary School",
      period: "2014 — 2015",
      score: "94%"
    }
  ],

  contact: {
    title: "Let's build something",
    lede:
      "I am always up for a conversation about healthcare interoperability, data infrastructure, or an idea that needs an engineer who has shipped in both.",
    /* Add your address here and a Mail channel appears automatically. */
    email: ""
  },

  links: {
    linkedin: "https://in.linkedin.com/in/mohamed-haneef-yaseen-5665b8189",
    github: "https://github.com/Haneefyaseen",
    x: "https://x.com/haneef12"
  }
};

/** Section metadata: label, index number, and the 3D stage each one drives. */
export const sections = [
  { id: "hero", nav: "Home", num: "00" },
  { id: "about", nav: "About", num: "01", title: "Engineer first,\nintegrator by trade", eyebrow: "About" },
  { id: "experience", nav: "Experience", num: "02", title: "Where I have\nbeen building", eyebrow: "Experience" },
  { id: "skills", nav: "Skills", num: "03", title: "The toolkit", eyebrow: "Capabilities" },
  { id: "projects", nav: "Work", num: "04", title: "Things I have\nshipped", eyebrow: "Selected work" },
  { id: "venture", nav: "Markecast", num: "05", title: "Building Markecast", eyebrow: "Side project" },
  { id: "education", nav: "Education", num: "06", title: "Foundations", eyebrow: "Education" },
  { id: "contact", nav: "Contact", num: "07", eyebrow: "Contact" }
];
