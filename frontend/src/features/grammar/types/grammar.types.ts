export interface GrammarReplacement {
  value: string;
}

export interface GrammarMatch {
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements: GrammarReplacement[];
  context: { text: string; offset: number; length: number };
  rule: {
    id: string;
    description: string;
    category: { id: string; name: string };
  };
}

export interface GrammarCheckResult {
  matches: GrammarMatch[];
}
