import { useStore, useRef, onMount, Show } from '@builder.io/mitosis';

export interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onMediaRequest?: (type: 'image' | 'video' | 'audio') => Promise<string>;
  availableClasses?: string[];
  className?: string;
}

export default function RichTextEditor(props: RichTextEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const state = useStore({
    mode: 'visual',
    isFullscreen: false,
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
    showSocialModal: false,
    socialUrl: '',
    socialPlatform: 'x',
    showButtonModal: false,
    btnText: 'Click Here',
    btnUrl: '',
    btnStyle: 'primary',
    
    activeFormats: {
      bold: false,
      italic: false,
      underline: false,
      strikeThrough: false,
      justifyLeft: false,
      justifyCenter: false,
      justifyRight: false,
      quote: false,
      code: false,
      unorderedList: false,
      orderedList: false,
      inTable: false,
    },
    headingFormat: 'P',

    checkFormats() {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        let isQuote = false;
        let isCode = false;
        let inTable = false;

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          let node = sel.getRangeAt(0).startContainer as any;
          while (node && node.nodeName !== 'DIV' && node.className !== 'wysiwyg-content') {
            if (node.nodeName === 'BLOCKQUOTE') isQuote = true;
            if (node.nodeName === 'PRE' || node.nodeName === 'CODE') isCode = true;
            if (node.nodeName === 'TD' || node.nodeName === 'TH') inTable = true;
            node = node.parentNode;
          }
        }

        state.activeFormats = {
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          strikeThrough: document.queryCommandState('strikeThrough'),
          justifyLeft: document.queryCommandState('justifyLeft'),
          justifyCenter: document.queryCommandState('justifyCenter'),
          justifyRight: document.queryCommandState('justifyRight'),
          unorderedList: document.queryCommandState('insertUnorderedList'),
          orderedList: document.queryCommandState('insertOrderedList'),
          quote: isQuote,
          code: isCode,
          inTable: inTable,
        };

        const formatBlock = document.queryCommandValue('formatBlock');
        if (formatBlock) {
          if (formatBlock.includes('1')) state.headingFormat = 'H1';
          else if (formatBlock.includes('2')) state.headingFormat = 'H2';
          else if (formatBlock.includes('3')) state.headingFormat = 'H3';
          else if (formatBlock.includes('4')) state.headingFormat = 'H4';
          else if (formatBlock.toLowerCase().includes('blockquote')) { state.activeFormats.quote = true; state.headingFormat = 'P'; }
          else if (formatBlock.toLowerCase().includes('pre')) { state.activeFormats.code = true; state.headingFormat = 'P'; }
          else if (formatBlock.includes('p')) state.headingFormat = 'P';
          else if (formatBlock.includes('div')) state.headingFormat = 'P';
        }
      }
    },
    
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
      state.checkFormats();
    },
    formatHeading(level: string) {
      document.execCommand('formatBlock', false, level);
      state.syncContent();
      state.checkFormats();
    },
    
    insertMedia(type: 'image' | 'video' | 'audio') {
      state.saveSelection();
      
      const insertContent = (url: string) => {
        if (editorRef) {
          editorRef.focus();
        }
        state.restoreSelection();
        if (!url) return;
        
        let html = '';
        if (type === 'image') {
          html = `<img src="${url}" alt="Image" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" /><p><br></p>`;
        } else if (type === 'video') {
          html = `<video src="${url}" controls style="max-width: 100%; border-radius: 8px; margin: 16px 0;"></video><p><br></p>`;
        } else if (type === 'audio') {
          html = `<audio src="${url}" controls style="margin: 16px 0;"></audio><p><br></p>`;
        }
        
        const success = document.execCommand('insertHTML', false, html);
        if (!success) {
           // Fallback if execCommand fails (e.g. some browsers when focus is tricky)
           if (state.savedSelection && state.savedSelection.insertNode) {
               const template = document.createElement('template');
               template.innerHTML = html.trim();
               const frag = template.content;
               state.savedSelection.deleteContents();
               state.savedSelection.insertNode(frag);
               state.savedSelection.collapse(false); // Move caret after inserted node
           } else {
               editorRef.innerHTML += html;
           }
        }
        state.syncContent();
      };

      if (props.onMediaRequest) {
        props.onMediaRequest(type).then((url) => {
          if (url) insertContent(url);
        }).catch((err) => {
          console.error('Media request failed', err);
        });
      } else {
        const url = window.prompt(`Enter ${type} URL:`);
        if (url) insertContent(url);
      }
    },
    
    clearAllFormatting() {
      // Native clear format for inline styles (bold, italic, etc.)
      document.execCommand('removeFormat', false, null);
      // Reset block formatting (removes headings, blockquotes, pre)
      document.execCommand('formatBlock', false, 'P');
      // If we have custom class spans, a quick trick to strip them without losing lines
      // is usually sufficient with removeFormat and formatBlock, but to be sure we also run:
      document.execCommand('unlink', false, null);
      state.syncContent();
      state.checkFormats();
    },
    toggleBlock(type: string) {
      state.checkFormats();
      const isActive = type === 'PRE' ? state.activeFormats.code : state.activeFormats.quote;
      if (isActive) {
        document.execCommand('formatBlock', false, 'P');
      } else {
        document.execCommand('formatBlock', false, type);
      }
      state.syncContent();
      state.checkFormats();
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
    
    openButtonModal() {
      state.saveSelection();
      state.showButtonModal = true;
      state.btnText = 'Click Here';
      state.btnUrl = '';
      state.btnStyle = 'primary';
    },
    closeButtonModal() {
      state.showButtonModal = false;
    },
    confirmButton() {
      state.showButtonModal = false;
      if (state.btnText) {
        if (editorRef) {
          editorRef.focus();
        }
        state.restoreSelection();
        let styleStr = 'padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-block; text-decoration: none; transition: all 0.2s;';
        if (state.btnStyle === 'primary') {
          styleStr += ' background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; border: none; box-shadow: 0 4px 14px rgba(139,92,246,0.3);';
        } else if (state.btnStyle === 'secondary') {
          styleStr += ' background: #1e293b; color: white; border: 1px solid rgba(255,255,255,0.1);';
        } else if (state.btnStyle === 'outline') {
          styleStr += ' background: transparent; color: #8b5cf6; border: 2px solid #8b5cf6;';
        }
        const url = state.btnUrl || '#';
        const html = `<a href="${url}" class="chronos-btn" style="${styleStr}">${state.btnText}</a>&nbsp;`;
        const success = document.execCommand('insertHTML', false, html);
        if (!success) {
           if (state.savedSelection && state.savedSelection.insertNode) {
               const template = document.createElement('template');
               template.innerHTML = html.trim();
               const frag = template.content;
               state.savedSelection.deleteContents();
               state.savedSelection.insertNode(frag);
               state.savedSelection.collapse(false);
           } else {
               editorRef.innerHTML += html;
           }
        }
        state.syncContent();
      }
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
          table += '<thead style="background-color: rgba(255,255,255,0.05);"><tr>';
          for(let j=0; j<cols; j++) {
            table += '<th style="padding: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: left; color: #a78bfa;">Header</th>';
          }
          table += '</tr></thead>';
        }
        table += '<tbody>';
        for(let i=0; i<rows; i++) {
          table += '<tr>';
          for(let j=0; j<cols; j++) {
            table += '<td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1); color: #f1f5f9;">Cell</td>';
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
    
    modifyTable(action: 'addRow' | 'removeRow' | 'addCol' | 'removeCol') {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      
      let node = sel.getRangeAt(0).startContainer as any;
      let td = null;
      let tr = null;
      let table = null;
      
      while (node && node.nodeName !== 'DIV' && node.className !== 'wysiwyg-content') {
        if (node.nodeName === 'TD' || node.nodeName === 'TH') td = node;
        if (node.nodeName === 'TR') tr = node;
        if (node.nodeName === 'TABLE') table = node;
        node = node.parentNode;
      }
      
      if (!table || !tr || !td) return;
      
      const colIndex = Array.from(tr.children).indexOf(td);
      
      if (action === 'addRow') {
        const newTr = document.createElement('tr');
        const numCols = tr.children.length;
        for (let i = 0; i < numCols; i++) {
          const newTd = document.createElement('td');
          newTd.style.cssText = "padding: 10px; border: 1px solid rgba(255,255,255,0.1); color: #f1f5f9;";
          newTd.innerHTML = "Cell";
          newTr.appendChild(newTd);
        }
        tr.parentNode.insertBefore(newTr, tr.nextSibling);
      } else if (action === 'removeRow') {
        if (tr.parentNode.children.length > 1) {
          tr.parentNode.removeChild(tr);
        } else {
          table.parentNode.removeChild(table);
        }
      } else if (action === 'addCol') {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row: any) => {
          const newCell = document.createElement(row.parentNode.nodeName === 'THEAD' ? 'th' : 'td');
          newCell.style.cssText = row.parentNode.nodeName === 'THEAD' ? "padding: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: left; color: #a78bfa;" : "padding: 10px; border: 1px solid rgba(255,255,255,0.1); color: #f1f5f9;";
          newCell.innerHTML = row.parentNode.nodeName === 'THEAD' ? "Header" : "Cell";
          const sibling = row.children[colIndex];
          row.insertBefore(newCell, sibling ? sibling.nextSibling : null);
        });
      } else if (action === 'removeCol') {
        const rows = table.querySelectorAll('tr');
        if (tr.children.length > 1) {
          rows.forEach((row: any) => {
            if (row.children[colIndex]) {
              row.removeChild(row.children[colIndex]);
            }
          });
        } else {
          table.parentNode.removeChild(table);
        }
      }
      
      state.syncContent();
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
      let html = `<div class="chronos-widget" data-widget="${state.selectedWidget}" style="padding: 24px; border: 2px dashed rgba(139,92,246,0.5); background: rgba(139,92,246,0.05); text-align: center; border-radius: 12px; margin: 16px 0; color: #a78bfa; font-weight: 600;">[Chronos Widget: ${state.selectedWidget.toUpperCase()}]</div><p><br></p>`;
      document.execCommand('insertHTML', false, html);
      state.syncContent();
    },
    closeWidgetModal() {
      state.showWidgetModal = false;
    },

    openSocialModal() {
      state.saveSelection();
      state.showSocialModal = true;
      state.socialUrl = '';
      state.socialPlatform = 'x';
    },
    confirmSocial() {
      state.showSocialModal = false;
      if (state.socialUrl) {
        state.restoreSelection();
        let embedHtml = `<div class="social-embed-placeholder" data-platform="${state.socialPlatform}" data-url="${state.socialUrl}" style="padding: 24px; border: 2px dashed rgba(14, 165, 233, 0.5); background: rgba(14, 165, 233, 0.05); text-align: center; border-radius: 12px; margin: 16px 0; color: #38bdf8; font-weight: 600;">[Embedded ${state.socialPlatform.toUpperCase()} Post: ${state.socialUrl}]</div><p><br></p>`;
        document.execCommand('insertHTML', false, embedHtml);
        state.syncContent();
      }
    },
    closeSocialModal() {
      state.showSocialModal = false;
    },

    insertMedia(type: string) {
      state.saveSelection();
      if (props.onMediaRequest) {
        props.onMediaRequest(type as any).then((url: string) => {
          if (url) {
            state.restoreSelection();
            let html = '';
            if (type === 'image') html = `<img src="${url}" style="max-width:100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />`;
            else if (type === 'video') html = `<video src="${url}" controls style="max-width:100%; border-radius: 8px;"></video>`;
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
          if (type === 'image') html = `<img src="${url}" style="max-width:100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />`;
          else if (type === 'video') html = `<video src="${url}" controls style="max-width:100%; border-radius: 8px;"></video>`;
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
    toggleFullScreen() {
      state.isFullscreen = !state.isFullscreen;
      if (typeof document !== 'undefined') {
        if (state.isFullscreen) {
          if (rootRef && rootRef.requestFullscreen) {
            rootRef.requestFullscreen().catch(err => console.warn('Fullscreen denied', err));
          }
        } else {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    },
  });

  onMount(() => {
    if (editorRef) {
      editorRef.innerHTML = state.internalContent;
    }
    if (typeof document !== 'undefined') {
      const styleId = 'chronos-editor-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = ".wysiwyg-content blockquote { border-left: 4px solid #8b5cf6 !important; background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.02) 100%) !important; padding: 20px 24px !important; margin: 24px 0 !important; border-radius: 0 16px 16px 0 !important; font-style: italic !important; color: #e2e8f0 !important; font-size: 1.1em !important; line-height: 1.8 !important; position: relative; box-shadow: inset 2px 0 0px rgba(255,255,255,0.1); } .wysiwyg-content pre { background: #0f172a !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; padding: 20px !important; color: #38bdf8 !important; font-family: 'Fira Code', monospace !important; overflow-x: auto !important; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5) !important; } .wysiwyg-content ul { list-style-type: disc !important; padding-left: 2rem !important; margin-bottom: 1em !important; } .wysiwyg-content ol { list-style-type: decimal !important; padding-left: 2rem !important; margin-bottom: 1em !important; } .wysiwyg-content li { margin-bottom: 0.5em !important; display: list-item !important; } .wysiwyg-content a:not(.chronos-btn) { color: #8b5cf6 !important; text-decoration: underline !important; text-underline-offset: 3px !important; }";
        document.head.appendChild(style);
      }
      
      const fsHandler = () => {
        state.isFullscreen = !!document.fullscreenElement;
      };
      document.addEventListener('fullscreenchange', fsHandler);
      return () => {
        document.removeEventListener('fullscreenchange', fsHandler);
      };
    }
  });

  return (
    <div 
      ref={rootRef}
      class={`chronos-rich-text-editor flex flex-col rounded-xl overflow-hidden relative ${state.isFullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none' : 'w-full'}`}
      style={{
        boxSizing: 'border-box',
        background: '#0f172a',
        border: state.isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      {/* Fluid Toolbar container - Dark Premium Aesthetics */}
      <div class="editor-toolbar flex flex-wrap gap-x-4 gap-y-3 px-6 py-4 select-none sticky top-0 z-10 w-full backdrop-blur-md" 
           style={{ 
             background: 'rgba(15, 23, 42, 0.85)', 
             borderBottom: '1px solid rgba(255,255,255,0.08)', 
             alignItems: 'center',
             padding: '16px 24px'
           }}>
        
        <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200" 
                style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: 'none' }} 
                onClick={() => state.toggleFullscreen()} title="Full Screen">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          {state.isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>

        <button type="button" class={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${state.mode === 'source' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`} onClick={() => state.toggleMode()} title="Source Code">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Source Code
        </button>

        <div class="flex items-center gap-2 text-slate-300">
          <button type="button" class={`font-bold text-sm w-9 h-9 flex items-center justify-center rounded transition-colors ${state.activeFormats.bold ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('bold')} title="Bold">B</button>
          <button type="button" class={`italic text-sm w-9 h-9 flex items-center justify-center rounded transition-colors font-serif ${state.activeFormats.italic ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('italic')} title="Italic">I</button>
          <button type="button" class={`underline text-sm w-9 h-9 flex items-center justify-center rounded transition-colors ${state.activeFormats.underline ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('underline')} title="Underline">U</button>
          <button type="button" class={`line-through text-sm w-9 h-9 flex items-center justify-center rounded transition-colors ${state.activeFormats.strikeThrough ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('strikeThrough')} title="Strikethrough">T</button>
        </div>

        <div class="w-px h-6 bg-white/10"></div>

        <div class="flex items-center gap-2 text-slate-300">
          <button type="button" class={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${state.activeFormats.code ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.toggleBlock('PRE')} title="Code Block">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </button>
          <button type="button" class={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${state.activeFormats.quote ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.toggleBlock('BLOCKQUOTE')} title="Blockquote">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </button>
          <button type="button" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.clearAllFormatting()} title="Clear Formatting">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"/><path d="M4 18V6a2 2 0 0 1 2-2h4"/><path d="M15 9l5 5"/><path d="M20 9l-5 5"/></svg>
          </button>
        </div>

        <div class="w-px h-6 bg-white/10"></div>

        <select class="bg-black/20 border border-white/10 text-slate-300 font-semibold text-sm rounded-lg px-3 py-1.5 outline-none focus:border-violet-500 transition-colors cursor-pointer" value={state.headingFormat} onMouseDown={(e) => { state.saveSelection(); }} onChange={(e) => { state.restoreSelection(); state.formatHeading(e.target.value); editorRef.focus(); }}>
          <option value="P" class="bg-slate-800" style={{ fontSize: '14px', fontWeight: 'normal' }}>Paragraph</option>
          <option value="H1" class="bg-slate-800" style={{ fontSize: '24px', fontWeight: 'bold' }}>Heading 1</option>
          <option value="H2" class="bg-slate-800" style={{ fontSize: '20px', fontWeight: 'bold' }}>Heading 2</option>
          <option value="H3" class="bg-slate-800" style={{ fontSize: '18px', fontWeight: 'bold' }}>Heading 3</option>
        </select>

        <div class="w-px h-6 bg-white/10"></div>

        <div class="flex items-center gap-1 text-slate-300">
          <label class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer relative" title="Text Color">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>
            <input type="color" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onMouseDown={() => state.saveSelection()} onChange={(e) => { state.restoreSelection(); document.execCommand('foreColor', false, (e.target as HTMLInputElement).value); state.syncContent(); }} />
          </label>
          <label class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer relative" title="Highlight Color">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
            <input type="color" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onMouseDown={() => state.saveSelection()} onChange={(e) => { state.restoreSelection(); document.execCommand('hiliteColor', false, (e.target as HTMLInputElement).value); document.execCommand('backColor', false, (e.target as HTMLInputElement).value); state.syncContent(); }} />
          </label>
        </div>

        <div class="w-px h-6 bg-white/10"></div>

        <div class="flex items-center gap-2 text-slate-300">
          <button type="button" class={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${state.activeFormats.justifyLeft ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('justifyLeft')} title="Align Left">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </button>
          <button type="button" class={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${state.activeFormats.justifyCenter ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('justifyCenter')} title="Align Center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>
          </button>
          <button type="button" class={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${state.activeFormats.justifyRight ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('justifyRight')} title="Align Right">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
          </button>
        </div>

        <div class="w-px h-6 bg-white/10"></div>

        <div class="flex items-center gap-2 text-slate-300">
          <button type="button" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.insertMedia('image')} title="Image">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button type="button" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.openLinkModal()} title="Link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
          <button type="button" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.openTableModal()} title="Table">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          </button>
          
          <Show when={state.activeFormats.inTable}>
            <div class="flex items-center bg-violet-500/20 rounded-lg p-0.5 border border-violet-500/30 ml-1 mr-1 shadow-inner">
              <button type="button" class="w-7 h-7 flex items-center justify-center rounded hover:bg-violet-500/40 text-violet-300 transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.modifyTable('addRow')} title="Add Row Below">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                <span class="text-[10px] font-bold ml-0.5">R</span>
              </button>
              <button type="button" class="w-7 h-7 flex items-center justify-center rounded hover:bg-rose-500/40 text-rose-300 transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.modifyTable('removeRow')} title="Delete Row">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                <span class="text-[10px] font-bold ml-0.5">R</span>
              </button>
              <div class="w-px h-4 bg-violet-500/30 mx-0.5"></div>
              <button type="button" class="w-7 h-7 flex items-center justify-center rounded hover:bg-violet-500/40 text-violet-300 transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.modifyTable('addCol')} title="Add Column Right">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                <span class="text-[10px] font-bold ml-0.5">C</span>
              </button>
              <button type="button" class="w-7 h-7 flex items-center justify-center rounded hover:bg-rose-500/40 text-rose-300 transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.modifyTable('removeCol')} title="Delete Column">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                <span class="text-[10px] font-bold ml-0.5">C</span>
              </button>
            </div>
          </Show>
          <button type="button" class={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${state.activeFormats.unorderedList ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('insertUnorderedList')} title="Bullet List">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button type="button" class={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${state.activeFormats.orderedList ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/10 hover:text-white'}`} onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('insertOrderedList')} title="Numbered List">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </button>
          <button type="button" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.format('insertHorizontalRule')} title="Horizontal Line">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button type="button" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.insertMedia('video')} title="Video">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
          </button>
          <button type="button" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.openSocialModal()} title="Social Media Embed">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </button>
        </div>

        <div class="w-px h-6 bg-white/10"></div>

        <div class="flex items-center gap-2">
          <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 border-none text-slate-300 hover:bg-white/10 hover:text-white" onMouseDown={(e) => e.preventDefault()} onClick={() => state.openButtonModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Insert Button
          </button>
          
          <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 bg-pink-500/10 text-pink-400 border-none hover:bg-pink-500/20" onMouseDown={(e) => e.preventDefault()} onClick={() => state.openWidgetModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Add Widget
          </button>
        </div>
        
        <div class="w-px h-6 bg-white/10"></div>

        <div class="flex items-center gap-1 text-slate-400">
          <button type="button" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors" onMouseDown={(e) => e.preventDefault()} onClick={() => state.syncContent()} title="Save">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </button>
        </div>

        {/* Dynamic Class Input */}
        <div class="ml-auto flex items-center bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 shadow-inner focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-all">
          <span class="text-[10px] font-bold text-slate-500 tracking-wider mr-2">CLASS</span>
          <input 
            type="text" 
            list="editor-class-list"
            placeholder="e.g. text-pink-500" 
            class="text-xs outline-none w-32 text-slate-200 placeholder-slate-600 bg-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                state.applyClass((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <Show when={props.availableClasses && props.availableClasses.length > 0}>
            <datalist id="editor-class-list">
              {props.availableClasses?.map((cls) => (
                <option value={cls}>{cls}</option>
              ))}
            </datalist>
          </Show>
        </div>

      </div>

      {/* Editor Main Content Area */}
      <div class="editor-content flex-1 overflow-y-auto relative min-h-[350px]" style={{
        display: state.mode === 'visual' ? 'block' : 'none',
        padding: '2rem 3rem',
        color: '#f1f5f9'
      }}>
        <div 
          ref={editorRef}
          contentEditable="true"
          class="wysiwyg-content outline-none prose prose-invert max-w-none"
          onInput={() => { state.handleInput(); state.checkFormats(); }}
          onBlur={() => state.handleInput()}
          onKeyUp={() => state.checkFormats()}
          onMouseUp={() => state.checkFormats()}
          style={{ minHeight: '350px', fontFamily: 'Inter, sans-serif', lineHeight: '1.7', fontSize: '15px' }}
        ></div>
        
        {/* Premium Modals with Guaranteed Inline CSS to prevent Tailwind purging */}
        <Show when={state.showTableModal || state.showLinkModal || state.showWidgetModal || state.showSocialModal || state.showButtonModal}>
          <div class="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-md" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
            
            <Show when={state.showButtonModal}>
              <div class="shadow-2xl" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '380px' }}>
                <h3 class="flex items-center text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  Insert Button
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Button Style</label>
                    <select style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', width: '100%', fontSize: '14px', color: 'white', outline: 'none' }} value={state.btnStyle} onChange={(e) => state.btnStyle = e.target.value}>
                      <option value="primary" style={{ background: '#1e293b' }}>Primary (Gradient)</option>
                      <option value="secondary" style={{ background: '#1e293b' }}>Secondary (Dark)</option>
                      <option value="outline" style={{ background: '#1e293b' }}>Outline (Violet)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Button Text</label>
                    <input type="text" placeholder="Click Here" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', width: '100%', fontSize: '14px', color: 'white', outline: 'none' }} value={state.btnText} onInput={(e) => state.btnText = e.target.value} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Link URL</label>
                    <input type="url" placeholder="https://..." style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', width: '100%', fontSize: '14px', color: 'white', outline: 'none' }} value={state.btnUrl} onInput={(e) => state.btnUrl = e.target.value} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }} onClick={() => state.closeButtonModal()}>Cancel</button>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: 'white', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(139,92,246,0.2)' }} onClick={() => state.confirmButton()}>Insert</button>
                </div>
              </div>
            </Show>
            
            <Show when={state.showTableModal}>
              <div class="shadow-2xl" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '340px' }}>
                <h3 class="flex items-center text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--violet, #8b5cf6)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                  Insert Table
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#cbd5e1' }}>Rows</label>
                    <input type="number" min="1" max="20" style={{ background: 'transparent', border: 'none', textAlign: 'right', color: 'white', fontWeight: 'bold', width: '64px', fontSize: '14px', outline: 'none' }} value={state.tableRows} onInput={(e) => state.tableRows = e.target.value} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#cbd5e1' }}>Columns</label>
                    <input type="number" min="1" max="20" style={{ background: 'transparent', border: 'none', textAlign: 'right', color: 'white', fontWeight: 'bold', width: '64px', fontSize: '14px', outline: 'none' }} value={state.tableCols} onInput={(e) => state.tableCols = e.target.value} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }} onClick={() => state.closeTableModal()}>Cancel</button>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: 'white', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }} onClick={() => state.confirmTable()}>Insert Table</button>
                </div>
              </div>
            </Show>

            <Show when={state.showLinkModal}>
              <div class="shadow-2xl" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '380px' }}>
                <h3 class="flex items-center text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sky, #0ea5e9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Insert Hyperlink
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination URL</label>
                  <input type="url" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', width: '100%', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box' }} placeholder="https://example.com" value={state.linkUrl} onInput={(e) => state.linkUrl = e.target.value} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }} onClick={() => state.closeLinkModal()}>Cancel</button>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: 'white', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }} onClick={() => state.confirmLink()}>Insert Link</button>
                </div>
              </div>
            </Show>

            <Show when={state.showWidgetModal}>
              <div class="shadow-2xl" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '380px' }}>
                <h3 class="flex items-center text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pink, #ec4899)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Insert Component
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Chronos Widget</label>
                  <select style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', width: '100%', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box' }} value={state.selectedWidget} onChange={(e) => state.selectedWidget = e.target.value}>
                    <option value="banner" style={{ background: '#1e293b' }}>Banner Component</option>
                    <option value="grid-banner" style={{ background: '#1e293b' }}>Grid Banner Component</option>
                    <option value="media-grid" style={{ background: '#1e293b' }}>Media Grid Component</option>
                    <option value="slider" style={{ background: '#1e293b' }}>Slider Carousel</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }} onClick={() => state.closeWidgetModal()}>Cancel</button>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: 'white', background: 'linear-gradient(135deg, #ec4899, #f43f5e)', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }} onClick={() => state.confirmWidget()}>Insert Widget</button>
                </div>
              </div>
            </Show>

            <Show when={state.showSocialModal}>
              <div class="shadow-2xl" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '380px' }}>
                <h3 class="flex items-center text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sky, #0ea5e9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Embed Social Post
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</label>
                    <select style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', width: '100%', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box' }} value={state.socialPlatform} onChange={(e) => state.socialPlatform = e.target.value}>
                      <option value="x" style={{ background: '#1e293b' }}>X (Twitter)</option>
                      <option value="instagram" style={{ background: '#1e293b' }}>Instagram</option>
                      <option value="facebook" style={{ background: '#1e293b' }}>Facebook</option>
                      <option value="linkedin" style={{ background: '#1e293b' }}>LinkedIn</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Post URL</label>
                    <input type="url" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', width: '100%', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box' }} placeholder="https://..." value={state.socialUrl} onInput={(e) => state.socialUrl = e.target.value} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }} onClick={() => state.closeSocialModal()}>Cancel</button>
                  <button type="button" style={{ padding: '10px 20px', fontSize: '14px', color: 'white', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }} onClick={() => state.confirmSocial()}>Embed Post</button>
                </div>
              </div>
            </Show>

          </div>
        </Show>
      </div>
      
      <div class="editor-source flex-1 overflow-y-auto bg-[#020617] min-h-[350px]" style={{
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
