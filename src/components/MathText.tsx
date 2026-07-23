import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  content: string;
  className?: string;
}

export default function MathText({ content, className = '' }: MathTextProps) {
  return (
    <div className={`math-text-container ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ node, ...props }) => <span {...props} />, // Prevent <p> tags from breaking inline flex layouts
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}
