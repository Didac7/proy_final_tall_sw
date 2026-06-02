/**
 * Editor de código con Monaco Editor (el editor de VS Code).
 * Soporta syntax highlighting para Python y Java.
 */
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'python' | 'java';
  height?: string;
}

const languageMap: Record<string, string> = {
  python: 'python',
  java: 'java',
};

const defaultCode: Record<string, string> = {
  python: '# Escribe tu solución aquí\nimport sys\ninput = sys.stdin.readline\n\n',
  java: '// Escribe tu solución aquí\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n    }\n}\n',
};

export default function CodeEditor({ value, onChange, language, height = '400px' }: CodeEditorProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-surface-700">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-950 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/70"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/70"></span>
          </div>
          <span className="text-surface-500 text-xs font-mono ml-2">
            {language === 'python' ? 'solution.py' : 'Main.java'}
          </span>
        </div>
        <span className="text-surface-600 text-xs">Monaco Editor</span>
      </div>
      <Editor
        height={height}
        language={languageMap[language] || 'plaintext'}
        value={value || defaultCode[language] || ''}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          roundedSelection: true,
          padding: { top: 12, bottom: 12 },
          suggestOnTriggerCharacters: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'on',
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
        }}
      />
    </div>
  );
}
