import { TranslateResponse } from '../translate.service';

export function PostTranslate(text: string, lang: string): TranslateResponse {
  return {
    alternatives: ['alternative' + text + '-' + lang],
    detectedLanguage: {
      confidence: 0.9,
      language: lang,
    },
    translatedText: text + '-' + lang,
  };
}
