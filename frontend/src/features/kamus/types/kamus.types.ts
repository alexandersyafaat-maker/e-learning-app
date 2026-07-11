export interface VerbForms {
  v1: string;
  v2: string;
  v3: string;
  ving: string;
  vs: string;
  isIrregular: boolean;
}

export interface VerbDefinition {
  partOfSpeech: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
  antonyms: string[];
}

export interface VerbResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  forms: VerbForms;
  definitions: VerbDefinition[];
}
