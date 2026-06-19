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

      const clone = document.documentElement.cloneNode(true);
      const scriptTags = clone.querySelectorAll('script[data-editor-script]');
      scriptTags.forEach(s => s.remove());

      window.parent.postMessage({
        type: 'CONTENT_UPDATED',
        html: '<!DOCTYPE html>' + clone.outerHTML
      }, '*');
    }
  }, true);
</script>
`