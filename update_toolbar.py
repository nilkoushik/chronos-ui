import codecs

content = """import { useStore, useRef, onMount, Show } from '@builder.io/mitosis';

export interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onMediaRequest?: (type: 'image' | 'video' | 'audio') => Promise<string>;
  availableClasses?: string[];
  className?: string;
}

export default function RichTextEditor(props: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  const state = useStore({
    mode: 'visual',
    isFullscreen: false,
    editorTheme: 'light', // Force light theme based on the image
    internalContent: props.content || '',
    
    // Modal states
    showTableModal: false,
    tableRows: '3',
    tableCols: '3',
    tableHasHeader: true,
    showLinkModal: false,
    linkUrl: '',
    showWidgetModal: false,
    selectedWidget: 'banner',
    
    savedRange: null as any,

    saveSelection() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        state.savedRange = sel.getRangeAt(0);
      }
    },
    restoreSelection() {
      if (state.savedRange && editorRef) {
        editorRef.focus();
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(state.savedRange);
        }
      }
    },

    formatHTML(html: string) {
      if (!html) return '';
      let formatted = '';
      let indent = '';
      const tab = '  ';
      html.split(/>\s*</).forEach(function(node) {
        if (node.match(/^\/\w/)) {
          indent = indent.substring(tab.length);
        }
        formatted += indent + '<' + node + '>' + String.fromCharCode(10);
        if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith("input") && !node.startsWith("img") && !node.startsWith("br") && !node.startsWith("hr")) {
          indent += tab;
        }
      });
      if (formatted.length > 3) {
        return formatted.substring(1, formatted.length-2);
      }
      return html;
    },

    format(cmd: string, val?: string) {
      document.execCommand(cmd, false, val);
      state.syncContent();
    },
    formatHeading(level: string) {
      document.execCommand('formatBlock', false, level);
      state.syncContent();
    },
    applyClass(className: string) {
      if (!className) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.className = className;
        span.appendChild(range.extractContents());
        range.insertNode(span);
        state.syncContent();
      }
    },
    insertButton() {
      document.execCommand('insertHTML', false, '<button class="btn btn-primary" style="padding: 8px 16px; border-radius: 4px; background: #8b5cf6; color: white; border: none; cursor: pointer;">Button</button>');
      state.syncContent();
    },
    syncContent() {
      if (editorRef) {
        state.internalContent = editorRef.innerHTML;
        if (props.onChange) {
          props.onChange(state.internalContent);
        }
      }
    },
    handleInput() {
      state.syncContent();
    },
    handleSourceInput(e: any) {
      state.internalContent = e.target.value;
      if (props.onChange) {
        props.onChange(state.internalContent);
      }
      if (editorRef) {
        editorRef.innerHTML = state.internalContent;
      }
    },
    
    // Modals
    openTableModal() {
      state.saveSelection();
      state.showTableModal = true;
      state.tableRows = '3';
      state.tableCols = '3';
      state.tableHasHeader = true;
    },
    confirmTable() {
      state.showTableModal = false;
      const rows = parseInt(state.tableRows, 10);
      const cols = parseInt(state.tableCols, 10);
      if (rows > 0 && cols > 0) {
        state.restoreSelection();
        let table = '<table border="1" style="width:100%; border-collapse: collapse; min-width: 50px;">';
        if (state.tableHasHeader) {
          table += '<thead style="background-color: rgba(0,0,0,0.05);"><tr>';
          for(let j=0; j<cols; j++) {
            table += '<th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Header</th>';
          }
          table += '</tr></thead>';
        }
        table += '<tbody>';
        for(let i=0; i<rows; i++) {
          table += '<tr>';
          for(let j=0; j<cols; j++) {
            table += '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>';
          }
          table += '</tr>';
        }
        table += '</tbody></table><p><br></p>';
        document.execCommand('insertHTML', false, table);
        state.syncContent();
      }
    },
    closeTableModal() {
      state.showTableModal = false;
    },

    openLinkModal() {
      state.saveSelection();
      state.showLinkModal = true;
      state.linkUrl = '';
    },
    confirmLink() {
      state.showLinkModal = false;
      if (state.linkUrl) {
        state.restoreSelection();
        document.execCommand('createLink', false, state.linkUrl);
        state.syncContent();
      }
    },
    closeLinkModal() {
      state.showLinkModal = false;
    },

    openWidgetModal() {
      state.saveSelection();
      state.showWidgetModal = true;
    },
    confirmWidget() {
      state.showWidgetModal = false;
      state.restoreSelection();
      let html = `<div class="contentvidya-widget" data-widget="${state.selectedWidget}" style="padding: 20px; border: 2px dashed #8b5cf6; background: rgba(139,92,246,0.1); text-align: center; border-radius: 8px; margin: 10px 0;">[Widget: ${state.selectedWidget}]</div><p><br></p>`;
      document.execCommand('insertHTML', false, html);
      state.syncContent();
    },
    closeWidgetModal() {
      state.showWidgetModal = false;
    },

    insertMedia(type: string) {
      state.saveSelection();
      if (props.onMediaRequest) {
        props.onMediaRequest(type as any).then((url: string) => {
          if (url) {
            state.restoreSelection();
            let html = '';
            if (type === 'image') html = `<img src="${url}" style="max-width:100%; height:auto;" />`;
            else if (type === 'video') html = `<video src="${url}" controls style="max-width:100%;"></video>`;
            else if (type === 'audio') html = `<audio src="${url}" controls></audio>`;
            document.execCommand('insertHTML', false, html);
            state.syncContent();
          }
        });
      } else {
        const url = prompt(`Enter ${type} URL:`);
        if (url) {
          state.restoreSelection();
          let html = '';
          if (type === 'image') html = `<img src="${url}" style="max-width:100%; height:auto;" />`;
          else if (type === 'video') html = `<video src="${url}" controls style="max-width:100%;"></video>`;
          else if (type === 'audio') html = `<audio src="${url}" controls></audio>`;
          document.execCommand('insertHTML', false, html);
          state.syncContent();
        }
      }
    },
    toggleMode() {
      if (state.mode === 'visual') {
        state.internalContent = state.formatHTML(state.internalContent);
        state.mode = 'source';
      } else {
        state.mode = 'visual';
        if (editorRef) {
          editorRef.innerHTML = state.internalContent;
        }
      }
    },
    toggleFullscreen() {
      state.isFullscreen = !state.isFullscreen;
    }
  });

  onMount(() => {
    if (editorRef) {
      editorRef.innerHTML = state.internalContent;
    }
  });

  return (
    <div 
      class={`contentvidya-rich-text-editor flex flex-col rounded-xl overflow-hidden relative shadow-lg ${state.isFullscreen ? 'fixed inset-0 z-[9999]' : 'border border-[var(--border)]'}`}
      style={{
        boxSizing: 'border-box'
      }}
    >
      <div class="editor-toolbar flex flex-col gap-3 p-4 bg-[#f8fafc] border-b border-[var(--border)] select-none sticky top-0 z-10 w-full" style={{ borderBottom: '1px solid #e2e8f0' }}>
        
        {/* ROW 1 */}
        <div class="flex items-center gap-4 flex-wrap">
          <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#f3e8ff] text-[#6b21a8] rounded-md font-semibold text-sm hover:bg-[#e9d5ff] transition-colors" onClick={() => state.toggleFullscreen()} title="Full Screen">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            Full Screen
          </button>

          <button type="button" class={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${state.mode === 'source' ? 'text-[#6b21a8]' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => state.toggleMode()} title="Source Code">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Source Code
          </button>

          <div class="flex items-center gap-2 text-slate-600 ml-2">
            <button type="button" class="font-bold text-lg px-1 hover:text-slate-900" onClick={() => state.format('bold')} title="Bold">B</button>
            <button type="button" class="italic text-lg px-1 font-serif hover:text-slate-900" onClick={() => state.format('italic')} title="Italic">I</button>
            <button type="button" class="underline text-lg px-1 hover:text-slate-900" onClick={() => state.format('underline')} title="Underline">U</button>
            <button type="button" class="line-through text-lg px-1 hover:text-slate-900" onClick={() => state.format('strikeThrough')} title="Strikethrough">T</button>
          </div>

          <div class="w-px h-5 bg-slate-300 mx-1"></div>

          <div class="flex items-center gap-3 text-slate-600">
            <button type="button" class="hover:text-slate-900 font-bold" onClick={() => state.formatHeading('PRE')} title="Code Block">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900 font-bold" onClick={() => state.formatHeading('BLOCKQUOTE')} title="Blockquote">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900 font-bold" onClick={() => state.format('removeFormat')} title="Clear Formatting">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6a2 2 0 0 1 2-2h4"/><path d="M15 9l5 5"/><path d="M20 9l-5 5"/></svg>
            </button>
          </div>

          <div class="w-px h-5 bg-slate-300 mx-1"></div>

          <select class="bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-md px-3 py-1.5 outline-none focus:border-indigo-400" onChange={(e) => state.formatHeading(e.target.value)}>
            <option value="P">Paragraph</option>
            <option value="H1">Heading 1</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
          </select>

          <div class="w-px h-5 bg-slate-300 mx-1"></div>
        </div>

        {/* ROW 2 */}
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-3 text-slate-600">
            <button type="button" class="hover:text-slate-900" onClick={() => state.format('justifyLeft')} title="Align Left">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900" onClick={() => state.format('justifyCenter')} title="Align Center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900" onClick={() => state.format('justifyRight')} title="Align Right">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
            </button>
          </div>

          <div class="w-px h-5 bg-slate-300 mx-1"></div>

          <div class="flex items-center gap-4 text-slate-600">
            <button type="button" class="hover:text-slate-900" onClick={() => state.insertMedia('image')} title="Image">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900" onClick={() => state.openLinkModal()} title="Link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900" onClick={() => state.openTableModal()} title="Table">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900" onClick={() => state.format('insertUnorderedList')} title="Bullet List">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900" onClick={() => state.format('insertHorizontalRule')} title="Horizontal Line">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <div class="w-px h-5 bg-slate-300 mx-1"></div>

          <div class="flex items-center gap-3">
            <button type="button" class="text-slate-600 hover:text-slate-900" onClick={() => state.insertMedia('video')} title="Video">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
            </button>
            <button type="button" class="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors" onClick={() => state.insertButton()}>Insert Button</button>
          </div>
          
          <div class="w-px h-5 bg-slate-300 mx-1"></div>
        </div>

        {/* ROW 3 */}
        <div class="flex items-center justify-between w-full flex-wrap gap-4">
          <div class="flex items-center gap-4 text-slate-600">
            <button type="button" class="flex items-center gap-1.5 font-semibold text-sm hover:text-slate-900" onClick={() => state.openWidgetModal()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Add Widget
            </button>
            <button type="button" class="hover:text-slate-900" onClick={() => state.syncContent()} title="Save">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900" title="RSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
            </button>
            <button type="button" class="hover:text-slate-900" title="Globe">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </button>
          </div>

          <div class="flex items-center bg-white border border-slate-300 rounded-md px-3 py-1.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
            <span class="text-[11px] font-bold text-slate-700 tracking-wide mr-2">CLASS</span>
            <input 
              type="text" 
              placeholder="Add custom..." 
              class="text-sm outline-none w-32 text-slate-800 placeholder-slate-400 bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  state.applyClass((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      <div class="editor-content flex-1 overflow-y-auto relative min-h-[400px]" style={{
        display: state.mode === 'visual' ? 'block' : 'none',
        padding: '2rem 3rem',
        backgroundColor: '#ffffff',
        color: '#0f172a'
      }}>
        <div 
          ref={editorRef}
          contentEditable="true"
          class="wysiwyg-content outline-none"
          onInput={() => state.handleInput()}
          onBlur={() => state.handleInput()}
          style={{ minHeight: '100%', fontFamily: 'Inter, sans-serif', lineHeight: '1.7', fontSize: '15px' }}
        ></div>
        
        {/* Modals */}
        <Show when={state.showTableModal || state.showLinkModal || state.showWidgetModal}>
          <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-[100] backdrop-blur-sm">
            
            <Show when={state.showTableModal}>
              <div class="bg-white border border-slate-200 rounded-xl shadow-2xl p-6 w-[320px] text-slate-800">
                <h3 class="text-base font-bold mb-5 flex items-center gap-2">Table</h3>
                <div class="flex flex-col gap-4 mb-6">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium">Rows</label>
                    <input type="number" min="1" max="20" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-24 text-sm outline-none" value={state.tableRows} onInput={(e) => state.tableRows = e.target.value} />
                  </div>
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium">Columns</label>
                    <input type="number" min="1" max="20" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-24 text-sm outline-none" value={state.tableCols} onInput={(e) => state.tableCols = e.target.value} />
                  </div>
                </div>
                <div class="flex justify-end gap-3">
                  <button type="button" class="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium" onClick={() => state.closeTableModal()}>Cancel</button>
                  <button type="button" class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold" onClick={() => state.confirmTable()}>Insert</button>
                </div>
              </div>
            </Show>

            <Show when={state.showLinkModal}>
              <div class="bg-white border border-slate-200 rounded-xl shadow-2xl p-6 w-[360px] text-slate-800">
                <h3 class="text-base font-bold mb-5 flex items-center gap-2">Link</h3>
                <div class="flex flex-col gap-2 mb-6">
                  <label class="text-sm font-medium">Link URL</label>
                  <input type="url" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full text-sm outline-none" placeholder="https://" value={state.linkUrl} onInput={(e) => state.linkUrl = e.target.value} />
                </div>
                <div class="flex justify-end gap-3">
                  <button type="button" class="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium" onClick={() => state.closeLinkModal()}>Cancel</button>
                  <button type="button" class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold" onClick={() => state.confirmLink()}>Insert</button>
                </div>
              </div>
            </Show>

            <Show when={state.showWidgetModal}>
              <div class="bg-white border border-slate-200 rounded-xl shadow-2xl p-6 w-[360px] text-slate-800">
                <h3 class="text-base font-bold mb-5 flex items-center gap-2">Widget</h3>
                <div class="flex flex-col gap-2 mb-6">
                  <label class="text-sm font-medium">Select Widget</label>
                  <select class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full text-sm outline-none" value={state.selectedWidget} onChange={(e) => state.selectedWidget = e.target.value}>
                    <option value="banner">Banner</option>
                    <option value="grid-banner">Grid Banner</option>
                    <option value="media-grid">Media Grid</option>
                  </select>
                </div>
                <div class="flex justify-end gap-3">
                  <button type="button" class="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium" onClick={() => state.closeWidgetModal()}>Cancel</button>
                  <button type="button" class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold" onClick={() => state.confirmWidget()}>Insert</button>
                </div>
              </div>
            </Show>

          </div>
        </Show>
      </div>
      
      <div class="editor-source flex-1 overflow-y-auto bg-[#020617]" style={{
        display: state.mode === 'source' ? 'block' : 'none'
      }}>
        <textarea
          class="w-full h-full p-6 bg-transparent text-emerald-400 font-mono text-[14px] leading-loose outline-none resize-none"
          value={state.internalContent}
          onInput={(e) => state.handleSourceInput(e)}
          style={{ whiteSpace: 'pre-wrap' }}
          spellcheck={false}
        ></textarea>
      </div>
    </div>
  );
}
"""

with codecs.open(r"c:\projects\cms\contentvidya-ui\src\components\RichTextEditor.lite.tsx", "w", "utf-8") as f:
    f.write(content)
