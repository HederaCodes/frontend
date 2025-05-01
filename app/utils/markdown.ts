import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { highlight } from 'remark-sugar-high';
import remarkHtml from 'remark-html';

export async function renderMarkdown(markdown: string): Promise<string> {
  // Cast remark to any to bypass TypeScript's union type issue
  const processor = (remark as any)();
  
  const result = await processor
    .use(remarkGfm)
    .use(highlight)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);

  return result.toString();
}

// Function to detect code blocks and wrap them in markdown syntax if needed
export function formatMarkdownCode(text: string): string {
  // Check if we already have properly formatted markdown code blocks
  // This is a more robust check for code blocks that looks for the full pattern
  const hasCodeBlock = /```[\w-]*\n[\s\S]*?\n```/.test(text);
  if (hasCodeBlock) {
    return text;
  }
  
  // Simple heuristics to detect if the text appears to be mostly code
  const codeIndicators = [
    'function', 'const', 'let', 'var', 'import', 'export', 
    'class', 'interface', 'return', '() =>', '=>', '{', '};', 
    'def ', 'public', 'private', 'static'
  ];
  
  const lines = text.trim().split('\n');
  let codeLines = 0;
  
  for (const line of lines) {
    if (codeIndicators.some(indicator => line.includes(indicator))) {
      codeLines++;
    }
  }
  
  // If more than 70% of lines appear to be code and there's no markdown
  // formatting yet, wrap it in a code block with language detection
  if (lines.length > 0 && codeLines / lines.length > 0.7) {
    // Try to detect language
    let language = 'javascript'; // Default
    
    if (text.includes('import React') || text.includes('<div') || text.includes('</')) {
      language = 'jsx';
    } else if (text.includes('def ') && text.includes(':')) {
      language = 'python';
    } else if (text.includes('#include')) {
      language = 'cpp';
    } else if (text.includes('public class') || text.includes('private class')) {
      language = 'java';
    }
    
    return '```' + language + '\n' + text + '\n```';
  }
  
  return text;
}

// Process output text to properly format code blocks with markdown
export async function processOutput(text: string): Promise<string> {
  try {
    // If the response appears to be only a code block without explanatory text,
    // format it as a code block
    const formattedText = formatMarkdownCode(text);
    
    // Render the markdown with syntax highlighting
    return await renderMarkdown(formattedText);
  } catch (error) {
    console.error("Error processing markdown output:", error);
    // Return the original text if something goes wrong
    return text;
  }
}