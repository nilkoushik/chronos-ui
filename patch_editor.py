import re

file_path = r'c:\projects\cms\contentvidya-ui\src\components\RichTextEditor.lite.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace state.content with state.internalContent
text = text.replace('content: props.content || \'\',', 'internalContent: props.content || \'\',')
text = text.replace('state.content =', 'state.internalContent =')
text = text.replace('state.content ===', 'state.internalContent ===')
text = text.replace('state.content;', 'state.internalContent;')
text = text.replace('state.content}', 'state.internalContent}')
text = text.replace('props.onChange(state.content)', 'props.onChange(state.internalContent)')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
