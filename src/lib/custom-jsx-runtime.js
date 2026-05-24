import * as originalRuntime from '../../node_modules/react/jsx-runtime.js';
import i18n from '../i18n';

function translateText(text) {
  if (typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return text;
  
  const lower = trimmed.toLowerCase();
  if (lower === 'milvexa' || lower.includes('milvexa') || lower === 'farm owner') return text;
  
  // Skip translating numbers, punctuation-only strings, or single characters/icons
  if (/^[0-9\s\p{P}₹•#+-\/*%=<>:!@&()]+$/u.test(trimmed)) return text;
  
  const key = trimmed.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
    
  if (!key) return text;
  
  if (i18n.exists(key)) {
    return i18n.t(key);
  }
  
  return text;
}

function translateProps(props) {
  if (!props) return props;
  const newProps = { ...props };
  
  if (typeof newProps.children === 'string') {
    newProps.children = translateText(newProps.children);
  } else if (Array.isArray(newProps.children)) {
    newProps.children = newProps.children.map(child => {
      if (typeof child === 'string') {
        return translateText(child);
      }
      return child;
    });
  }
  
  const attributesToTranslate = ['placeholder', 'label', 'title', 'buttonText'];
  attributesToTranslate.forEach(attr => {
    if (typeof newProps[attr] === 'string') {
      newProps[attr] = translateText(newProps[attr]);
    }
  });
  
  return newProps;
}

export function jsx(type, props, key) {
  return originalRuntime.jsx(type, translateProps(props), key);
}

export function jsxs(type, props, key) {
  return originalRuntime.jsxs(type, translateProps(props), key);
}

export const Fragment = originalRuntime.Fragment;
