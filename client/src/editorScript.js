export const editorScript = `
<script>
  let selectedElement = null;

  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target;

    if (target === selectedElement) {
      return;
    }
    
    if (selectedElement) {
      selectedElement.style.outline = 'none';
      selectedElement.removeAttribute('contenteditable');
    }

    if (target.tagName !== 'HTML' && target.tagName !== 'BODY') {
      selectedElement = target;
      selectedElement.style.outline = '2px solid #3b82f6';
      selectedElement.setAttribute('contenteditable', 'true');
      selectedElement.focus();
    }
  });

  document.addEventListener('blur', function(e) {
    if (e.target === selectedElement) {
      e.target.style.outline = 'none';
      e.target.removeAttribute('contenteditable');

      window.parent.postMessage({
        type: 'CONTENT_UPDATED',
        html: '<!DOCTYPE html>' + (function() {
          const clone = document.documentElement.cloneNode(true);
          const scriptTags = clone.querySelectorAll('script[data-editor-script]');
          scriptTags.forEach(s => s.remove());
          const editableEls = clone.querySelectorAll('[contenteditable]');
          editableEls.forEach(el => {
            el.removeAttribute('contenteditable');
            el.style.outline = '';
          });
          return clone.outerHTML;
        })()
      }, '*');
    }
  }, true);
</script>
`