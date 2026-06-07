const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const wcSrcDir = path.join(__dirname, 'dist', 'webcomponent', 'src', 'components');
const wcDistDir = path.join(__dirname, 'dist', 'webcomponent', 'dist');

if (!fs.existsSync(wcSrcDir)) {
  console.log('Web component source directory not found, skipping compile.');
  process.exit(0);
}

if (!fs.existsSync(wcDistDir)) {
  fs.mkdirSync(wcDistDir, { recursive: true });
}

// 1. Generate index.ts
const files = fs.readdirSync(wcSrcDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
const exportsList = files.map(f => `export * from './${f.replace('.ts', '')}.js';`).join('\n');
fs.writeFileSync(path.join(wcSrcDir, 'index.ts'), exportsList);

// 2. Transpile files individually ignoring type errors
console.log('Compiling Web Components to JavaScript (skipping type checks)...');
const allFiles = [...files, 'index.ts'];

for (const file of allFiles) {
  const code = fs.readFileSync(path.join(wcSrcDir, file), 'utf8');
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020
    }
  });
  
  const outPath = path.join(wcDistDir, file.replace('.ts', '.js'));
  let finalCode = result.outputText;
  
  // Fix invalid custom element names that don't have a hyphen (e.g. "banner")
  finalCode = finalCode.replace(/customElements\.define\("([^"-]+)",/g, 'customElements.define("chronos-$1",');
  
  // Fix strict mode TypeError: Cannot set property which has only a getter by adding a companion setter.
  // Mitosis generates both `get _fooRef()` and `this._fooRef = el` in updateBindings.
  finalCode = finalCode.replace(/get _([a-zA-Z0-9_]+Ref)\(\) \{\s*return this\._root\.querySelector\("\[data-ref='([^']+)'\]"\);\s*\}/g, (match, refName, refId) => {
    return `get _${refName}() { return this.__${refName} || this._root.querySelector("[data-ref='${refId}']"); }
    set _${refName}(val) { this.__${refName} = val; }`;
  });
  
  // Fix TypeError: Cannot read properties of undefined (reading 'content')
  // Move `this.props = {}` initialization BEFORE `this.state = {}` in the constructor.
  finalCode = finalCode.replace(/const self = this;\s*this\.state = \{/g, 'const self = this;\n        if (!this.props) { this.props = {}; }\n        this.state = {');
  
  // Fix ReferenceError: colIndex is not defined in AlternatingSlider.js
  // Wrap in try-catch because Mitosis querySelectorAll matches un-stamped <template> tags
  // Using a robust brace-matching parser to avoid breaking nested object/function braces (e.g. Object.assign)
  const queryRegex = /this\._root\s*\.querySelectorAll\("\[data-el='(.*?)'\]"\)\s*\.forEach\(\(el\)\s*=>\s*\{/g;
  let match;
  while ((match = queryRegex.exec(finalCode)) !== null) {
    const startIdx = match.index;
    const matchStr = match[0];
    const dataElValue = match[1];
    
    const searchStart = startIdx + matchStr.length;
    let braceCount = 1;
    let endIdx = -1;
    for (let i = searchStart; i < finalCode.length; i++) {
      if (finalCode[i] === '{') {
        braceCount++;
      } else if (finalCode[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          if (finalCode.substring(i, i + 3) === '});') {
            endIdx = i + 3;
            break;
          }
        }
      }
    }
    
    if (endIdx !== -1) {
      let innerContent = finalCode.substring(searchStart, endIdx - 3);
      
      // Remove local declarations of scope variables to avoid duplicate declaration and TDZ ReferenceErrors.
      // Mitosis sometimes puts el.key = ... before declaring the scope variable used in it.
      const scopeVars = ['colIndex', 'slideIndex', 'slideRow', 'index', 'rowIndex', 'mediaIndex', 'item', 'cls'];
      for (const name of scopeVars) {
        const declRegex = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*this\\.getScope\\(el,\\s*["']${name}["']\\);?\\s*`, 'g');
        innerContent = innerContent.replace(declRegex, '');
      }

      const varsToInject = [];
      if (!/const\s+colIndex\b|let\s+colIndex\b|var\s+colIndex\b/.test(innerContent)) {
        varsToInject.push('let colIndex = this.getScope ? this.getScope(el, "colIndex") : 0;');
      }
      if (!/const\s+slideIndex\b|let\s+slideIndex\b|var\s+slideIndex\b/.test(innerContent)) {
        varsToInject.push('let slideIndex = this.getScope ? this.getScope(el, "slideIndex") : 0;');
      }
      if (!/const\s+slideRow\b|let\s+slideRow\b|var\s+slideRow\b/.test(innerContent)) {
        varsToInject.push('let slideRow = this.getScope ? this.getScope(el, "slideRow") : null;');
      }
      if (!/const\s+index\b|let\s+index\b|var\s+index\b/.test(innerContent)) {
        varsToInject.push('let index = this.getScope ? this.getScope(el, "index") : 0;');
      }
      if (!/const\s+rowIndex\b|let\s+rowIndex\b|var\s+rowIndex\b/.test(innerContent)) {
        varsToInject.push('let rowIndex = this.getScope ? this.getScope(el, "rowIndex") : 0;');
      }
      if (!/const\s+mediaIndex\b|let\s+mediaIndex\b|var\s+mediaIndex\b/.test(innerContent)) {
        varsToInject.push('let mediaIndex = this.getScope ? this.getScope(el, "mediaIndex") : 0;');
      }
      if (!/const\s+item\b|let\s+item\b|var\s+item\b/.test(innerContent)) {
        varsToInject.push('let item = this.getScope ? this.getScope(el, "item") : null;');
      }
      if (!/const\s+cls\b|let\s+cls\b|var\s+cls\b/.test(innerContent)) {
        varsToInject.push('let cls = this.getScope ? this.getScope(el, "cls") : null;');
      }
      
      const injectedVars = varsToInject.join(' ');
      const newInnerContent = ` try { ${injectedVars} ${innerContent} } catch(e) {} `;
      const replacement = `this._root.querySelectorAll("[data-el='${dataElValue}']").forEach((el) => {${newInnerContent}});`;
      
      finalCode = finalCode.substring(0, startIdx) + replacement + finalCode.substring(endIdx);
      queryRegex.lastIndex = startIdx + replacement.length;
    }
  }

  // Rewrite destroyAnyNodes to preserve elements marked with __persistent
  const destroyRegex = /destroyAnyNodes\(\)\s*\{[\s\S]*?this\.nodesToDestroy\s*=\s*\[\];\s*\}/g;
  finalCode = finalCode.replace(destroyRegex, `destroyAnyNodes() {
        this.nodesToDestroy.forEach((el) => {
            if (!el.__persistent) {
                el.remove();
            }
        });
        this.nodesToDestroy = this.nodesToDestroy.filter(el => el.__persistent);
    }`);

  // Rewrite showContent to support toggle/conditional updates in-place
  const showContentRegex = /showContent\(el\)\s*\{[\s\S]*?el\.after\(elementFragment\);\s*\}/g;
  finalCode = finalCode.replace(showContentRegex, `showContent(el, condition) {
        if (condition) {
            if (el.__renderedNodes) {
                return;
            }
            const elementFragment = el.content.cloneNode(true);
            const children = Array.from(elementFragment.childNodes);
            el.__renderedNodes = children;
            children.forEach((child) => {
                if (el?.scope) {
                    child.scope = el.scope;
                }
                if (el?.context) {
                    child.context = el.context;
                }
                child.__persistent = true;
                this.nodesToDestroy.push(child);
            });
            el.after(elementFragment);
        } else {
            if (el.__renderedNodes) {
                el.__renderedNodes.forEach((child) => {
                    child.remove();
                    const idx = this.nodesToDestroy.indexOf(child);
                    if (idx !== -1) {
                        this.nodesToDestroy.splice(idx, 1);
                    }
                });
                el.__renderedNodes = null;
            }
        }
    }`);

  // Rewrite renderLoop to cache previously rendered array values and preserve rendered nodes in-place
  const renderLoopRegex = /renderLoop\(template,\s*array,\s*itemName,\s*itemIndex,\s*collectionName\)\s*\{[\s\S]*?collection\.forEach\(\(child\)\s*=>\s*template\.after\(child\)\);\s*\}/g;
  finalCode = finalCode.replace(renderLoopRegex, `renderLoop(template, array, itemName, itemIndex, collectionName) {
        if (!array) array = [];
        const isSameArray = template.__renderedArray && 
                            template.__renderedArray.length === array.length && 
                            array.every((val, i) => template.__renderedArray[i] === val);
        console.log('[WC Debug] renderLoop template:', template.getAttribute('data-el'), 'isSameArray:', isSameArray);
        if (isSameArray) {
            return;
        }
        console.log('[WC Debug] renderLoop recreating nodes for template:', template.getAttribute('data-el'));
        if (template.__renderedNodes) {
            template.__renderedNodes.forEach((child) => {
                child.remove();
                const idx = this.nodesToDestroy.indexOf(child);
                if (idx !== -1) {
                    this.nodesToDestroy.splice(idx, 1);
                }
            });
        }
        const collection = [];
        const renderedNodes = [];
        for (let [index, value] of array.entries()) {
            const elementFragment = template.content.cloneNode(true);
            const children = Array.from(elementFragment.childNodes);
            const localScope = {};
            let scope = localScope;
            if (template?.scope) {
                const getParent = {
                    get(target, prop, receiver) {
                        if (prop in target) {
                            return target[prop];
                        }
                        if (prop in template.scope) {
                            return template.scope[prop];
                        }
                        return target[prop];
                    },
                };
                scope = new Proxy(localScope, getParent);
            }
            children.forEach((child) => {
                if (itemName !== undefined) {
                    scope[itemName] = value;
                }
                if (itemIndex !== undefined) {
                    scope[itemIndex] = index;
                }
                if (collectionName !== undefined) {
                    scope[collectionName] = array;
                }
                child.scope = scope;
                if (template.context) {
                    child.context = template.context;
                }
                child.__persistent = true;
                this.nodesToDestroy.push(child);
                collection.unshift(child);
                renderedNodes.push(child);
            });
        }
        collection.forEach((child) => template.after(child));
        template.__renderedArray = [...array];
        template.__renderedNodes = renderedNodes;
    }`);

  // Rewrite conditional elements calls: if (whenCondition) { this.showContent(el); }
  finalCode = finalCode.replace(/if\s*\(whenCondition\)\s*\{\s*this\.showContent\(el\);\s*\}/g, 'this.showContent(el, !!whenCondition);');

  // Inject observedAttributes and attributeChangedCallback for reactivity
  const propNamesMatch = finalCode.match(/this\.componentProps\s*=\s*(\[[\s\S]*?\]);/);
  if (propNamesMatch) {
    try {
      const matches = propNamesMatch[1].match(/"([^"]+)"|'([^']+)'/g);
      const propsArray = matches ? matches.map(s => s.slice(1, -1)) : [];
      const kebabProps = propsArray.map(p => p.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase());
      
      const className = file.replace('.ts', '');
      const classDef = `class ${className} extends HTMLElement {`;
      const observedCode = `class ${className} extends HTMLElement {
    static get observedAttributes() {
        return ${JSON.stringify(kebabProps)};
    }
    attributeChangedCallback(name, oldValue, newValue) {
        const jsVar = name.replace(/-/g, "");
        const regexp = new RegExp(jsVar, "i");
        if (this.componentProps) {
            this.componentProps.forEach((prop) => {
                if (regexp.test(prop)) {
                    let attrValue = newValue;
                    try {
                        if (attrValue && (attrValue.trim().startsWith('{') || attrValue.trim().startsWith('['))) {
                            attrValue = JSON.parse(attrValue);
                        }
                    } catch(e) {}
                    this.props[prop] = attrValue;
                }
            });
            this.update();
        }
    }
    forceUpdate(propsObj) {
        if (propsObj && typeof propsObj === 'object') {
            Object.assign(this.props, propsObj);
        }
        if (typeof this.update === 'function') this.update();
    }`;
      finalCode = finalCode.replace(classDef, observedCode);
    } catch (e) {
      console.warn('Failed to inject observedAttributes for', file, e);
    }
  }

  fs.writeFileSync(outPath, finalCode);
}
console.log('Successfully compiled Web Components.');
