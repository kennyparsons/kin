export function markdownToPlainText(md: string): string {
  if (!md) return '';

  let text = md;

  // 1. Headers: # Header -> HEADER
  text = text.replace(/^#+\s+(.*)$/gm, (_, p1) => p1.toUpperCase());

  // 2. Bold: **text** -> *text* (common email styling)
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/__(.*?)__/g, '$1');

  // 3. Italics: *text* -> text
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/_(.*?)_/g, '$1');

  // 4. Links: [text](url) -> text (url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // 5. Lists: Keep as is (- item)
  
  // 6. Code blocks: Remove backticks
  text = text.replace(/`{3,}(.*?)`{3,}/gs, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');

  return text;
}
