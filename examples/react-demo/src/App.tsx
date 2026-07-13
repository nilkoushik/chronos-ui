import { useState, useEffect } from 'react'
import '@chronos-ui/core/theme.css'
import '@chronos-ui/core/styles/components/Banner.css'
import '@chronos-ui/core/styles/components/AnnouncementBar.css'
import '@chronos-ui/core/styles/components/GridBanner.css'
import '@chronos-ui/core/styles/components/MediaGrid.css'
import '@chronos-ui/core/styles/components/RowScrollable.css'
import '@chronos-ui/core/styles/components/TimerWidget.css'
import '@chronos-ui/core/styles/components/WysiwygRenderer.css'
import '@chronos-ui/core/styles/components/RichTextEditor.css'
import '@chronos-ui/core/styles/components/SlidingBanner.css'
import '@chronos-ui/core/styles/components/AlternatingSlider.css'

// @ts-ignore
import Banner from '@chronos-ui/core/react/Banner'
// @ts-ignore
import AnnouncementBar from '@chronos-ui/core/react/AnnouncementBar'
// @ts-ignore
import GridBanner from '@chronos-ui/core/react/GridBanner'
// @ts-ignore
import MediaGrid from '@chronos-ui/core/react/MediaGrid'
// @ts-ignore
import RowScrollable from '@chronos-ui/core/react/RowScrollable'
// @ts-ignore
import TimerWidget from '@chronos-ui/core/react/TimerWidget'
// @ts-ignore
import WysiwygRenderer from '@chronos-ui/core/react/WysiwygRenderer'
// @ts-ignore
import RichTextEditor from '@chronos-ui/core/react/RichTextEditor'
// @ts-ignore
import SlidingBanner from '@chronos-ui/core/react/SlidingBanner'
// @ts-ignore
import AlternatingSlider from '@chronos-ui/core/react/AlternatingSlider'

// Default template states
const DEFAULTS = {
  Banner: {
    title: "Unleash Your Potential",
    subtitle: "Discover our new summer collection designed for high performance and daily comfort.",
    ctaText: "Shop Collection",
    isLoading: false,
    textAlignment: "center" as "center" | "left" | "right",
    media: { type: "image" as "image" | "video", url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80" },
    mapLinks: [{ label: "Shop", url: "#shop" }],
    backgroundImageUrl: "",
    ctaLink: "",
    config: {
      align: "center" as "center" | "left" | "right",
      padding: "lg",
      bgGradient: "",
      autoplay: true
    }
  },
  AnnouncementBar: {
    message: "⚡ FLASH SALE: Save 25% off all accessories today only! Code: CHRONOS25",
    backgroundColor: "#8b5cf6",
    textColor: "#ffffff",
    mapLinks: [{ url: "/sale" }]
  },
  GridBanner: {
    columns: 3,
    isLoading: false,
    items: [
      { id: "1", title: "Activewear", subtitle: "Comfort meets speed", media: { type: "image", url: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=600&q=80" }, mapLinks: [{ label: "Explore", url: "/activewear" }] },
      { id: "2", title: "Footwear", subtitle: "Step into future", media: { type: "image", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" }, mapLinks: [{ label: "Shop Shoes", url: "/footwear" }] },
      { id: "3", title: "Accessories", subtitle: "Complete the look", media: { type: "image", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" }, mapLinks: [{ label: "View All", url: "/accessories" }] }
    ]
  },
  MediaGrid: {
    isLoading: false,
    primaryMedia: { id: "1", title: "Premium Sound", subtitle: "Immersive audio experience", media: { type: "image", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80" }, mapLinks: [{ label: "Buy Now", url: "/audio" }] },
    secondaryMedia: [
      { id: "2", title: "Wireless Comfort", subtitle: "Up to 40 hours playtime", media: { type: "image", url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80" }, mapLinks: [{ label: "Details", url: "/headphones" }] },
      { id: "3", title: "Smart Integration", subtitle: "Voice assistant enabled", media: { type: "image", url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80" }, mapLinks: [{ label: "Features", url: "/smart" }] }
    ]
  },
  RowScrollable: {
    isLoading: false,
    title: "Trending Items",
    items: [
      { id: "1", title: "Smart Watch v2", price: "$299", media: { type: "image", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80" } },
      { id: "2", title: "Leather Wallet", price: "$49", media: { type: "image", url: "https://images.unsplash.com/photo-1627124765135-56c24f6f227b?auto=format&fit=crop&w=400&q=80" } },
      { id: "3", title: "Bluetooth Speaker", price: "$129", media: { type: "image", url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80" } },
      { id: "4", title: "Minimalist Backpack", price: "$89", media: { type: "image", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80" } }
    ],
    config: {
      showArrows: true,
      hideArrowsIfNoScroll: true,
      hideScrollbar: false
    }
  },
  SlidingBanner: {
    isLoading: false,
    items: [
      { id: "1", title: "Elevate Your Space", subtitle: "Modern minimalist design", media: { type: "image", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80" } },
      { id: "2", title: "Smart Workspace", subtitle: "Engineered for productivity", media: { type: "image", url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80" } },
      { id: "3", title: "Outdoor Essentials", subtitle: "Built to withstand the elements", media: { type: "image", url: "https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=1200&q=80" } }
    ],
    config: {
      autoStart: false,
      rotateAgain: true,
      delayMs: 4000,
      showNextPrev: true,
      showDots: true,
      animationEffect: "slide",
      backgroundEffect: "none",
      hideArrowsIfNoScroll: true
    }
  },
  AlternatingSlider: {
    isLoading: false,
    items: [
      { id: "1", title: "Ocean Breeze", subtitle: "Fresh styles", media: { type: "image", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" } },
      { id: "2", title: "Forest Trail", subtitle: "Eco materials", media: { type: "image", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80" } },
      { id: "3", title: "Desert Sun", subtitle: "Warm tones", media: { type: "image", url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80" } },
      { id: "4", title: "Mountain Peak", subtitle: "Durable wear", media: { type: "image", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" } }
    ],
    config: {
      columns: 2,
      autoStart: false,
      delayMs: 3000,
      showArrows: true,
      showDots: true,
      hideArrowsIfNoScroll: true
    }
  },
  TimerWidget: {
    title: "Special Offer Ends In:",
    targetDate: "2026-12-31T23:59:59Z"
  },
  WysiwygRenderer: {
    htmlContent: `<div style="padding:10px;">
  <h3 style="font-size:1.5rem; color:#8b5cf6; font-weight:600; margin-bottom:10px;">Wysiwyg Rich Text Renderer</h3>
  <p style="margin-bottom:12px;">This component renders HTML safely with scoped typography classes. It supports standard semantic markup:</p>
  <ul style="margin-left: 20px; list-style-type: disc; margin-bottom: 12px;">
    <li><strong>Bold</strong> and <em>italic</em> styled text</li>
    <li>Inline code blocks like <code>const score = 100;</code></li>
    <li>Custom hyperlinks like <a href="#" style="color:#3b82f6; text-decoration:underline;">Chronos Homepage</a></li>
  </ul>
  <blockquote style="border-left: 4px solid #8b5cf6; padding-left: 12px; font-style: italic; color: #94a3b8; margin: 15px 0;">
    "This is a blockquote rendered using the core CSS styles. Beautiful, semantic, and simple."
  </blockquote>
</div>`
  },
  RichTextEditor: {
    initialContent: `<p>Welcome to the <strong>RichTextEditor</strong>! Try selecting text to apply formatting, inline styles, or use the toolbar above.</p>`,
    availableClasses: ["text-red", "bg-yellow", "font-serif", "text-xl"]
  }
}

type ComponentKey = keyof typeof DEFAULTS;

export default function App() {
  const [activeTab, setActiveTab] = useState<ComponentKey>("Banner");
  const [states, setStates] = useState(JSON.parse(JSON.stringify(DEFAULTS)));
  const [previewBg, setPreviewBg] = useState<"dark" | "light" | "checker">("dark");
  const [codeTab, setCodeTab] = useState<"react" | "svelte" | "wc">("react");
  const [copied, setCopied] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  // Store raw text values for JSON inputs to handle typing gracefully
  const [jsonInputs, setJsonInputs] = useState<Record<string, string>>({});
  const [jsonErrors, setJsonErrors] = useState<Record<string, string | null>>({});

  // Initialize JSON input string representation when states change or tabs switch
  useEffect(() => {
    const componentState = states[activeTab];
    const newJsonInputs: Record<string, string> = {};
    
    Object.entries(componentState).forEach(([key, val]) => {
      if (typeof val === 'object') {
        newJsonInputs[key] = JSON.stringify(val, null, 2);
      }
    });

    setJsonInputs(newJsonInputs);
    setJsonErrors({});
  }, [activeTab]);

  const handlePropChange = (key: string, value: any) => {
    setStates((prev: any) => {
      const newState = {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [key]: value
        }
      };
      // Keep json textarea input synchronized if changed programmatically
      if (typeof value === 'object') {
        setJsonInputs(prevJson => ({
          ...prevJson,
          [key]: JSON.stringify(value, null, 2)
        }));
      }
      return newState;
    });
  };

  const handleConfigChange = (subKey: string, value: any) => {
    const activeProps = states[activeTab];
    const newConfig = {
      ...activeProps.config,
      [subKey]: value
    };
    handlePropChange("config", newConfig);
  };

  const handleJsonChange = (key: string, rawText: string) => {
    setJsonInputs(prev => ({ ...prev, [key]: rawText }));
    try {
      const parsed = JSON.parse(rawText);
      handlePropChange(key, parsed);
      setJsonErrors(prev => ({ ...prev, [key]: null }));
    } catch (err: any) {
      setJsonErrors(prev => ({ ...prev, [key]: err.message }));
    }
  };

  const resetComponent = () => {
    const freshDefault = JSON.parse(JSON.stringify(DEFAULTS[activeTab]));
    setStates((prev: any) => ({
      ...prev,
      [activeTab]: freshDefault
    }));
    
    const newJsonInputs: Record<string, string> = {};
    Object.entries(freshDefault).forEach(([k, v]) => {
      if (typeof v === 'object') {
        newJsonInputs[k] = JSON.stringify(v, null, 2);
      }
    });
    setJsonInputs(newJsonInputs);
    setJsonErrors({});
  };

  const activeProps = states[activeTab];

  // Helper to generate the JSX code snippet
  const generateReactCode = () => {
    const propLines = Object.entries(activeProps)
      .filter(([k]) => k !== 'initialContent' && k !== 'availableClasses')
      .map(([k, v]) => {
        if (typeof v === 'string') return `  ${k}="${v}"`;
        if (typeof v === 'boolean') return v ? `  ${k}` : `  ${k}={false}`;
        return `  ${k}={${JSON.stringify(v)}}`;
      });
      
    if (activeTab === 'RichTextEditor') {
      propLines.push(`  initialContent={${JSON.stringify(activeProps.initialContent)}}`);
      propLines.push(`  availableClasses={${JSON.stringify(activeProps.availableClasses)}}`);
      propLines.push(`  onChange={(html) => console.log(html)}`);
    }

    return `import ${activeTab} from '@chronos-ui/core/react/${activeTab}';
import '@chronos-ui/core/theme.css';
import '@chronos-ui/core/styles/components/${activeTab}.css';

function App() {
  return (
    <${activeTab}
${propLines.join('\n')}
    />
  );
}`;
  };

  // Helper to generate the Svelte code snippet
  const generateSvelteCode = () => {
    const propLines = Object.entries(activeProps)
      .filter(([k]) => k !== 'initialContent' && k !== 'availableClasses')
      .map(([k, v]) => {
        if (typeof v === 'string') return `  ${k}="${v}"`;
        if (typeof v === 'boolean') return v ? `  ${k}` : `  ${k}={false}`;
        return `  ${k}={${JSON.stringify(v)}}`;
      });

    if (activeTab === 'RichTextEditor') {
      propLines.push(`  initialContent={${JSON.stringify(activeProps.initialContent)}}`);
      propLines.push(`  availableClasses={${JSON.stringify(activeProps.availableClasses)}}`);
    }

    return `<script>
  import ${activeTab} from '@chronos-ui/core/svelte/${activeTab}.svelte';
  import '@chronos-ui/core/theme.css';
  import '@chronos-ui/core/styles/components/${activeTab}.css';
</script>

<${activeTab}
${propLines.join('\n')}
/>`;
  };

  // Helper to generate the Web Component code snippet
  const generateWcCode = () => {
    const kebabCase = activeTab.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() + '-element';
    const attrLines = Object.entries(activeProps)
      .filter(([k]) => k !== 'initialContent' && k !== 'availableClasses')
      .map(([k, v]) => {
        const attr = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        if (typeof v === 'string') return `  ${attr}="${v}"`;
        if (typeof v === 'boolean') return v ? `  ${attr}` : '';
        return `  ${attr}='${JSON.stringify(v)}'`;
      }).filter(Boolean);

    if (activeTab === 'RichTextEditor') {
      attrLines.push(`  content='${JSON.stringify(activeProps.initialContent)}'`);
      attrLines.push(`  available-classes='${JSON.stringify(activeProps.availableClasses)}'`);
    }

    return `<!-- Include global variables and module script -->
<link rel="stylesheet" href="node_modules/@chronos-ui/core/theme.css" />
<link rel="stylesheet" href="node_modules/@chronos-ui/core/styles/components/${activeTab}.css" />
<script type="module" src="node_modules/@chronos-ui/core/webcomponents/${activeTab}.js"></script>

<${kebabCase}
${attrLines.join('\n')}
></${kebabCase}>`;
  };

  const getCodeString = () => {
    switch (codeTab) {
      case "svelte": return generateSvelteCode();
      case "wc": return generateWcCode();
      default: return generateReactCode();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCodeString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // List of all components and descriptive subtitles
  const componentList: { name: ComponentKey; desc: string; icon: string }[] = [
    { name: "AnnouncementBar", desc: "Global notification stripe", icon: "📢" },
    { name: "Banner", desc: "Hero segment with backgrounds", icon: "🖼️" },
    { name: "GridBanner", desc: "CSS grids of cards", icon: "📊" },
    { name: "MediaGrid", desc: "Split responsive layout", icon: "🍱" },
    { name: "RowScrollable", desc: "Snap-scroll card row", icon: "↔️" },
    { name: "SlidingBanner", desc: "Adaptive banner slider", icon: "🎚️" },
    { name: "AlternatingSlider", desc: "Multi-scroll columns", icon: "↕️" },
    { name: "TimerWidget", desc: "Dynamic countdown clock", icon: "⏳" },
    { name: "WysiwygRenderer", desc: "CSS scoped rich text", icon: "📄" },
    { name: "RichTextEditor", desc: "Visual/HTML editor field", icon: "✍️" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-lg font-bold shadow-lg shadow-indigo-500/20">
            ⏳
          </span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Chronos UI Playground
            </h1>
            <p className="text-xs text-slate-400">Interactive Framework-Agnostic Component Lab</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/nilkoushik/chronos-ui"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <span>GitHub</span>
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Work Area */}
      <div className="flex h-full min-h-0 flex-1">
        {/* Component Selector Sidebar */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/30 overflow-y-auto shrink-0 p-4">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 px-2">Components</div>
          <div className="space-y-1">
            {componentList.map((comp) => {
              const isSelected = activeTab === comp.name;
              return (
                <button
                  key={comp.name}
                  onClick={() => setActiveTab(comp.name)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 shadow-inner"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <span className="text-lg">{comp.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate leading-tight">{comp.name}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{comp.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Dynamic Preview & Interactive Controls */}
        <main className="flex-1 flex min-w-0 overflow-hidden">
          {/* Component Render Sandbox */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-slate-300">Live Preview</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setPreviewBg("dark")}
                  className={`px-2 py-1 rounded transition-colors ${previewBg === "dark" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setPreviewBg("light")}
                  className={`px-2 py-1 rounded transition-colors ${previewBg === "light" ? "bg-slate-200 text-slate-900 font-medium" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Light
                </button>
                <button
                  onClick={() => setPreviewBg("checker")}
                  className={`px-2 py-1 rounded transition-colors ${previewBg === "checker" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Grid
                </button>
              </div>
            </div>

            {/* Canvas Frame */}
            <div
              className={`flex-1 min-h-[350px] border border-slate-800 rounded-xl flex items-center justify-center p-6 relative overflow-auto transition-colors ${
                previewBg === "dark"
                  ? "bg-slate-900"
                  : previewBg === "light"
                  ? "bg-slate-50 text-slate-900"
                  : "bg-[linear-gradient(45deg,#121b2a_25%,transparent_25%),linear-gradient(-45deg,#121b2a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#121b2a_75%),linear-gradient(-45deg,transparent_75%,#121b2a_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] bg-slate-950"
              }`}
            >
              <div className="w-full">
                {activeTab === "Banner" && (
                  <Banner {...activeProps} />
                )}
                {activeTab === "AnnouncementBar" && (
                  <AnnouncementBar {...activeProps} />
                )}
                {activeTab === "GridBanner" && (
                  <GridBanner {...activeProps} />
                )}
                {activeTab === "MediaGrid" && (
                  <MediaGrid {...activeProps} />
                )}
                {activeTab === "RowScrollable" && (
                  <RowScrollable {...activeProps} />
                )}
                {activeTab === "SlidingBanner" && (
                  <SlidingBanner {...activeProps} />
                )}
                {activeTab === "AlternatingSlider" && (
                  <AlternatingSlider {...activeProps} />
                )}
                {activeTab === "TimerWidget" && (
                  <TimerWidget {...activeProps} />
                )}
                {activeTab === "WysiwygRenderer" && (
                  <WysiwygRenderer {...activeProps} />
                )}
                {activeTab === "RichTextEditor" && (
                  <div className="w-full">
                    <RichTextEditor 
                      {...activeProps} 
                      onChange={(html: string) => setEditorContent(html)} 
                    />
                    <div className="mt-4 p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 max-h-40 overflow-y-auto">
                      <div className="text-slate-400 font-bold mb-1">Editor onChange Event Content:</div>
                      {editorContent || <span className="text-slate-500 font-italic">[Typing content inside the editor triggers this output]</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Code Integration Block */}
            <div className="mt-6 border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden flex flex-col shrink-0">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-2 text-xs">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCodeTab("react")}
                    className={`px-2.5 py-1.5 rounded transition-all font-medium ${codeTab === "react" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/25" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    React
                  </button>
                  <button
                    onClick={() => setCodeTab("svelte")}
                    className={`px-2.5 py-1.5 rounded transition-all font-medium ${codeTab === "svelte" ? "bg-amber-600/20 text-amber-400 border border-amber-500/25" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Svelte
                  </button>
                  <button
                    onClick={() => setCodeTab("wc")}
                    className={`px-2.5 py-1.5 rounded transition-all font-medium ${codeTab === "wc" ? "bg-sky-600/20 text-sky-400 border border-sky-500/25" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Web Component
                  </button>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 px-3 py-1 font-medium transition-colors text-slate-300"
                >
                  {copied ? (
                    <>
                      <span className="text-emerald-400">✓</span>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] font-mono text-indigo-200 leading-relaxed bg-slate-950/60 max-h-48">
                <code>{getCodeString()}</code>
              </pre>
            </div>
          </div>

          {/* Configuration Inspector Sidebar */}
          <div className="w-96 border-l border-slate-800 bg-slate-900/30 overflow-y-auto shrink-0 flex flex-col">
            <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between shrink-0 bg-slate-900/50">
              <span className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-1.5">
                ⚙️ Config Dashboard
              </span>
              <button
                onClick={resetComponent}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded transition-colors"
                title="Reset active component to defaults"
              >
                Reset
              </button>
            </div>

            {/* Config Form fields */}
            <div className="flex-1 p-5 space-y-6 overflow-y-auto">
              {/* Dynamic Prop Inputs */}
              
              {/* Banner Controls */}
              {activeTab === "Banner" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Title</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.title}
                      onChange={(e) => handlePropChange("title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Subtitle</label>
                    <textarea
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.subtitle}
                      onChange={(e) => handlePropChange("subtitle", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">CTA Text</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.ctaText}
                      onChange={(e) => handlePropChange("ctaText", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Text Alignment</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.textAlignment}
                      onChange={(e) => handlePropChange("textAlignment", e.target.value)}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  {/* Toggle Inputs */}
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Loading State</span>
                      <span className="text-[10px] text-slate-500">Enable skeleton shimmer style</span>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      checked={activeProps.isLoading}
                      onChange={(e) => handlePropChange("isLoading", e.target.checked)}
                    />
                  </div>

                  {/* JSON Editor for Media */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Media Config (JSON)</label>
                      {jsonErrors.media && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={3}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.media ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.media || ''}
                      onChange={(e) => handleJsonChange("media", e.target.value)}
                    />
                  </div>

                  {/* JSON Editor for MapLinks */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Map Links (JSON Array)</label>
                      {jsonErrors.mapLinks && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={3}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.mapLinks ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.mapLinks || ''}
                      onChange={(e) => handleJsonChange("mapLinks", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Background Media URL (Direct Prop)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.backgroundImageUrl || ''}
                      onChange={(e) => handlePropChange("backgroundImageUrl", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">CTA Link / Deeplink (Direct Prop)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.ctaLink || ''}
                      onChange={(e) => handlePropChange("ctaLink", e.target.value)}
                    />
                  </div>

                  {/* Banner Configuration */}
                  <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
                    <span className="text-xs font-semibold text-slate-400 block">Banner Config Object</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Alignment (config.align)</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={activeProps.config?.align || "center"}
                        onChange={(e) => handleConfigChange("align", e.target.value)}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Padding (config.padding)</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={activeProps.config?.padding || "lg"}
                        onChange={(e) => handleConfigChange("padding", e.target.value)}
                      >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Gradient Overlay (config.bgGradient)</label>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. linear-gradient(to right, black, transparent)"
                        value={activeProps.config?.bgGradient || ""}
                        onChange={(e) => handleConfigChange("bgGradient", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-300">Autoplay Video (config.autoplay)</span>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        checked={activeProps.config?.autoplay ?? true}
                        onChange={(e) => handleConfigChange("autoplay", e.target.checked)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Announcement Bar Controls */}
              {activeTab === "AnnouncementBar" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Message</label>
                    <textarea
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.message}
                      onChange={(e) => handlePropChange("message", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Background Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          className="h-8 w-8 bg-transparent border-0 cursor-pointer animate-none"
                          value={activeProps.backgroundColor.startsWith('#') ? activeProps.backgroundColor : '#8b5cf6'}
                          onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                          value={activeProps.backgroundColor}
                          onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Text Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          className="h-8 w-8 bg-transparent border-0 cursor-pointer animate-none"
                          value={activeProps.textColor.startsWith('#') ? activeProps.textColor : '#ffffff'}
                          onChange={(e) => handlePropChange("textColor", e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                          value={activeProps.textColor}
                          onChange={(e) => handlePropChange("textColor", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* JSON Editor for MapLinks */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Map Links (JSON Array)</label>
                      {jsonErrors.mapLinks && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={3}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.mapLinks ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.mapLinks || ''}
                      onChange={(e) => handleJsonChange("mapLinks", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Grid Banner Controls */}
              {activeTab === "GridBanner" && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Columns (Desktop)</label>
                      <span className="text-xs text-indigo-400 font-mono">{activeProps.columns}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      value={activeProps.columns}
                      onChange={(e) => handlePropChange("columns", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Loading State</span>
                      <span className="text-[10px] text-slate-500">Show card skeleton loaders</span>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      checked={activeProps.isLoading}
                      onChange={(e) => handlePropChange("isLoading", e.target.checked)}
                    />
                  </div>

                  {/* JSON Editor for Items */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Items List (JSON Array)</label>
                      {jsonErrors.items && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={6}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.items ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.items || ''}
                      onChange={(e) => handleJsonChange("items", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Media Grid Controls */}
              {activeTab === "MediaGrid" && (
                <>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Loading State</span>
                      <span className="text-[10px] text-slate-500">Show skeleton loader</span>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      checked={activeProps.isLoading}
                      onChange={(e) => handlePropChange("isLoading", e.target.checked)}
                    />
                  </div>

                  {/* JSON Editor for primaryMedia */}
                  <div className="space-y-1.5 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Primary Featured Media (JSON)</label>
                      {jsonErrors.primaryMedia && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={5}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.primaryMedia ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.primaryMedia || ''}
                      onChange={(e) => handleJsonChange("primaryMedia", e.target.value)}
                    />
                  </div>

                  {/* JSON Editor for secondaryMedia */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Secondary Stacked Media (JSON Array)</label>
                      {jsonErrors.secondaryMedia && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={5}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.secondaryMedia ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.secondaryMedia || ''}
                      onChange={(e) => handleJsonChange("secondaryMedia", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Row Scrollable Controls */}
              {activeTab === "RowScrollable" && (
                <>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Loading State</span>
                      <span className="text-[10px] text-slate-500">Show skeleton shimmer loader</span>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      checked={activeProps.isLoading}
                      onChange={(e) => handlePropChange("isLoading", e.target.checked)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Section Title</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.title}
                      onChange={(e) => handlePropChange("title", e.target.value)}
                    />
                  </div>

                  {/* Config settings */}
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <span className="text-xs font-semibold text-slate-400 block">Scroll Navigation Settings</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                        <span className="text-xs font-medium text-slate-300">Show Arrows</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          checked={activeProps.config?.showArrows ?? true}
                          onChange={(e) => handleConfigChange("showArrows", e.target.checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                        <span className="text-xs font-medium text-slate-300">Hide If Fits</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          checked={activeProps.config?.hideArrowsIfNoScroll ?? true}
                          onChange={(e) => handleConfigChange("hideArrowsIfNoScroll", e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-medium text-slate-300">Hide Scrollbar</span>
                        <span className="text-[10px] text-slate-500">Only navigate using scroll-arrows or swipe</span>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        checked={activeProps.config?.hideScrollbar ?? false}
                        onChange={(e) => handleConfigChange("hideScrollbar", e.target.checked)}
                      />
                    </div>
                  </div>

                  {/* JSON Editor for Items */}
                  <div className="space-y-1.5 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Cards List (JSON Array)</label>
                      {jsonErrors.items && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={6}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.items ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.items || ''}
                      onChange={(e) => handleJsonChange("items", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Sliding Banner Controls */}
              {activeTab === "SlidingBanner" && (
                <>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Loading State</span>
                      <span className="text-[10px] text-slate-500">Show skeleton layout</span>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      checked={activeProps.isLoading}
                      onChange={(e) => handlePropChange("isLoading", e.target.checked)}
                    />
                  </div>

                  {/* Config settings */}
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <span className="text-xs font-semibold text-slate-400 block">Slider Configuration</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                        <span className="text-xs font-medium text-slate-300">Auto Play</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          checked={activeProps.config?.autoStart ?? true}
                          onChange={(e) => handleConfigChange("autoStart", e.target.checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                        <span className="text-xs font-medium text-slate-300">Infinite Loop</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          checked={activeProps.config?.rotateAgain ?? true}
                          onChange={(e) => handleConfigChange("rotateAgain", e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                        <span className="text-xs font-medium text-slate-300">Show Arrows</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          checked={activeProps.config?.showNextPrev ?? true}
                          onChange={(e) => handleConfigChange("showNextPrev", e.target.checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                        <span className="text-xs font-medium text-slate-300">Show Dots</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          checked={activeProps.config?.showDots ?? true}
                          onChange={(e) => handleConfigChange("showDots", e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-medium text-slate-300">Hide Arrows If No Scroll</span>
                        <span className="text-[10px] text-slate-500">Hide arrows when slide deck has only 1 item</span>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        checked={activeProps.config?.hideArrowsIfNoScroll ?? true}
                        onChange={(e) => handleConfigChange("hideArrowsIfNoScroll", e.target.checked)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-400">Delay between slides (ms)</span>
                        <span className="font-mono text-indigo-400">{activeProps.config?.delayMs ?? 5000}</span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={10000}
                        step={500}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        value={activeProps.config?.delayMs ?? 5000}
                        onChange={(e) => handleConfigChange("delayMs", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Animation Effect</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={activeProps.config?.animationEffect ?? "slide"}
                        onChange={(e) => handleConfigChange("animationEffect", e.target.value)}
                      >
                        <option value="slide">Slide</option>
                        <option value="fade">Fade</option>
                        <option value="cube">Cube</option>
                        <option value="flip">Flip</option>
                        <option value="zoom">Zoom</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Background Canvas Effect</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={activeProps.config?.backgroundEffect ?? "none"}
                        onChange={(e) => handleConfigChange("backgroundEffect", e.target.value)}
                      >
                        <option value="none">None</option>
                        <option value="particles">Particles</option>
                        <option value="waves">Waves</option>
                      </select>
                    </div>
                  </div>

                  {/* JSON Editor for Items */}
                  <div className="space-y-1.5 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Slides List (JSON Array)</label>
                      {jsonErrors.items && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={5}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.items ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.items || ''}
                      onChange={(e) => handleJsonChange("items", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Alternating Slider Controls */}
              {activeTab === "AlternatingSlider" && (
                <>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Loading State</span>
                      <span className="text-[10px] text-slate-500">Skeleton loaders active</span>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      checked={activeProps.isLoading}
                      onChange={(e) => handlePropChange("isLoading", e.target.checked)}
                    />
                  </div>

                  {/* Config settings */}
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <span className="text-xs font-semibold text-slate-400 block">Slider Configuration</span>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-400">Columns (Layout)</span>
                        <span className="font-mono text-indigo-400">{activeProps.config?.columns ?? 2}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={4}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        value={activeProps.config?.columns ?? 2}
                        onChange={(e) => handleConfigChange("columns", parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-900/30 border border-slate-800 rounded-lg text-center">
                        <span className="text-[10px] font-medium text-slate-400 mb-1">Auto Start</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          checked={activeProps.config?.autoStart ?? true}
                          onChange={(e) => handleConfigChange("autoStart", e.target.checked)}
                        />
                      </div>

                      <div className="flex flex-col items-center justify-center p-2 bg-slate-900/30 border border-slate-800 rounded-lg text-center">
                        <span className="text-[10px] font-medium text-slate-400 mb-1">Arrows</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          checked={activeProps.config?.showArrows ?? true}
                          onChange={(e) => handleConfigChange("showArrows", e.target.checked)}
                        />
                      </div>

                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/30 border border-slate-800 rounded-lg">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-medium text-slate-300">Hide Arrows If No Scroll</span>
                        <span className="text-[10px] text-slate-500">Hide arrows when slide sets are 1 or fewer</span>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        checked={activeProps.config?.hideArrowsIfNoScroll ?? true}
                        onChange={(e) => handleConfigChange("hideArrowsIfNoScroll", e.target.checked)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-400">Delay between slides (ms)</span>
                        <span className="font-mono text-indigo-400">{activeProps.config?.delayMs ?? 3000}</span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={10000}
                        step={500}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        value={activeProps.config?.delayMs ?? 3000}
                        onChange={(e) => handleConfigChange("delayMs", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* JSON Editor for Items */}
                  <div className="space-y-1.5 border-t border-slate-800 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Cells List (JSON Array)</label>
                      {jsonErrors.items && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={5}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.items ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.items || ''}
                      onChange={(e) => handleJsonChange("items", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Timer Widget Controls */}
              {activeTab === "TimerWidget" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Timer Header</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.title}
                      onChange={(e) => handlePropChange("title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Target Date/Time</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      // Format targetDate (e.g. 2026-12-31T23:59:59Z) to datetime-local friendly format (2026-12-31T23:59)
                      value={activeProps.targetDate.replace('Z', '').substring(0, 16)}
                      onChange={(e) => handlePropChange("targetDate", e.target.value ? `${e.target.value}:00Z` : "")}
                    />
                  </div>
                </>
              )}

              {/* Wysiwyg Renderer Controls */}
              {activeTab === "WysiwygRenderer" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Raw HTML Content</label>
                    <textarea
                      rows={10}
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                      value={activeProps.htmlContent}
                      onChange={(e) => handlePropChange("htmlContent", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Rich Text Editor Controls */}
              {activeTab === "RichTextEditor" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Initial Rich Content</label>
                    <textarea
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      value={activeProps.initialContent}
                      onChange={(e) => handlePropChange("initialContent", e.target.value)}
                    />
                  </div>

                  {/* JSON Editor for Available Classes */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Available Custom Styles (JSON Array)</label>
                      {jsonErrors.availableClasses && <span className="text-[10px] text-rose-400 font-bold">Invalid JSON</span>}
                    </div>
                    <textarea
                      rows={3}
                      className={`w-full bg-slate-950/70 border rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none ${jsonErrors.availableClasses ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                      value={jsonInputs.availableClasses || ''}
                      onChange={(e) => handleJsonChange("availableClasses", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
