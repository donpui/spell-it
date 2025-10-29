const input = document.getElementById('wordInput');
const button = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const manVoiceBtn = document.getElementById('manVoice');
const womanVoiceBtn = document.getElementById('womanVoice');
const languageSelect = document.getElementById('languageSelect');
const themeToggle = document.getElementById('themeToggle');
const fullModeBtn = document.getElementById('fullMode');
const minimalModeBtn = document.getElementById('minimalMode');

let selectedVoice = 'man'; // default to man voice
let voices = [];
let selectedLang = '';
let speechTimeouts = [];
let spellingMode = 'minimal'; // 'full' or 'minimal'

// Sanitize user input: trim, remove control characters, and cap length
function sanitizeInput(rawValue) {
  if (typeof rawValue !== 'string') return '';
  const trimmed = rawValue.trim();
  // Remove ASCII control chars and DEL
  const withoutControls = trimmed.replace(/[\u0000-\u001F\u007F]/g, '');
  // Cap to 64 characters to avoid abuse
  return withoutControls.slice(0, 64);
}

// Process input based on mode: minimal mode converts to lowercase and removes symbols
function processInputForSpelling(text, mode) {
  if (mode === 'minimal') {
    // Convert to lowercase, keep only letters and spaces
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  } else {
    // Full mode: keep everything (already sanitized)
    return text;
  }
}

// Dark mode functionality
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const html = document.documentElement;
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  if (themeToggle) {
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    if (moonIcon && sunIcon) {
      if (theme === 'dark') {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
      } else {
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
      }
    }
  }
}

// Initialize theme immediately
initTheme();

// Add event listener when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  });
} else {
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function loadVoices() {
  voices = speechSynthesis.getVoices();
  populateLanguageOptions();
}

function populateLanguageOptions() {
  if (!languageSelect) return;
  const seen = new Set();
  const keepFirst = languageSelect.options[0];
  languageSelect.innerHTML = '';
  languageSelect.appendChild(keepFirst);
  const langs = voices
    .map(v => v.lang)
    .filter(Boolean)
    .filter(l => {
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));
  langs.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = formatLocaleLabel(l);
    languageSelect.appendChild(opt);
  });
  
  // Set English (United States) as default if not already set
  if (!selectedLang) {
    const lowerLangs = langs.map(l => l.toLowerCase());
    const preferredOrder = ['en-gb', 'en-us'];
    let chosen = '';
    for (const pref of preferredOrder) {
      const idx = lowerLangs.indexOf(pref);
      if (idx !== -1) {
        chosen = langs[idx];
        break;
      }
    }
    if (!chosen) {
      // fallback to any English locale
      const anyEn = langs.find(l => l.toLowerCase().startsWith('en'));
      if (anyEn) chosen = anyEn;
    }
    if (chosen) selectedLang = chosen;
  }
  
  if (selectedLang) languageSelect.value = selectedLang;
}

// Create human-friendly label for locale like "English (United States)"
function formatLocaleLabel(locale) {
  try {
    const [lang, region] = locale.split(/[-_]/);
    const languageDisplay = new Intl.DisplayNames(['en'], { type: 'language' });
    const regionDisplay = new Intl.DisplayNames(['en'], { type: 'region' });
    const langName = languageDisplay.of(lang) || lang;
    const regionName = region ? regionDisplay.of(region.toUpperCase()) : '';
    const pretty = regionName ? `${capitalize(langName)} (${regionName})` : capitalize(langName);
    return pretty;
  } catch {
    return locale;
  }
}

function capitalize(s) {
  return typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Load voices when they become available
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}

function getVoice() {
  if (voices.length === 0) return null;
  const langFiltered = selectedLang
    ? voices.filter(v => v.lang === selectedLang)
    : voices;

  // Common female voice names to exclude when man is selected
  const femaleNames = ['female', 'samantha', 'karen', 'susan', 'victoria', 'kate', 'zira', 'hazel', 'linda', 'lisa', 'maria', 'nancy', 'sarah'];
  // Common male voice names to exclude when woman is selected
  const maleNames = ['male', 'david', 'alex', 'daniel', 'thomas', 'james', 'john', 'mark', 'richard', 'michael', 'paul', 'steve'];

  // Try to find gender-specific voices
  const filteredVoices = langFiltered.filter(v => {
    const name = v.name.toLowerCase();
    if (selectedVoice === 'man') {
      return name.includes('male') ||
             name.includes('david') ||
             name.includes('alex') ||
             name.includes('daniel') ||
             name.includes('thomas') ||
             name.includes('james') ||
             name.includes('john') ||
             name.includes('mark') ||
             name.includes('richard') ||
             name.includes('michael');
    } else {
      return name.includes('female') ||
             name.includes('samantha') ||
             name.includes('karen') ||
             name.includes('susan') ||
             name.includes('victoria') ||
             name.includes('kate') ||
             name.includes('zira') ||
             name.includes('hazel');
    }
  });

  // If we found specific voices, use the first one
  if (filteredVoices.length > 0) return filteredVoices[0];
  
  // If no specific match, filter out opposite gender voices
  const oppositeGenderFiltered = langFiltered.filter(v => {
    const name = v.name.toLowerCase();
    if (selectedVoice === 'man') {
      // Exclude female voices
      return !femaleNames.some(femaleName => name.includes(femaleName));
    } else {
      // Exclude male voices
      return !maleNames.some(maleName => name.includes(maleName));
    }
  });

  // Use first voice that's not the opposite gender
  if (oppositeGenderFiltered.length > 0) return oppositeGenderFiltered[0];
  
  // If no voices match the gender preference after filtering, try searching broader language scope
  if (selectedLang && voices.length > 0) {
    const langCode = selectedLang.split('-')[0]; // e.g., 'en' from 'en-AU'
    
    // First try: same language family (e.g., en-US, en-GB if en-AU selected)
    const sameLangFamily = voices.filter(v => {
      if (!v.lang.startsWith(langCode + '-')) return false;
      const name = v.name.toLowerCase();
      if (selectedVoice === 'man') {
        return !femaleNames.some(femaleName => name.includes(femaleName));
      } else {
        return !maleNames.some(maleName => name.includes(maleName));
      }
    });
    
    if (sameLangFamily.length > 0) {
      return sameLangFamily[0];
    }
    
    // Second try: any language with matching gender
    const allFilteredByGender = voices.filter(v => {
      const name = v.name.toLowerCase();
      if (selectedVoice === 'man') {
        return !femaleNames.some(femaleName => name.includes(femaleName));
      } else {
        return !maleNames.some(maleName => name.includes(maleName));
      }
    });
    
    if (allFilteredByGender.length > 0) {
      return allFilteredByGender[0];
    }
  }
  
  // Last resort: if still nothing matching gender, don't use opposite gender voice
  // Return null to let browser use its default, or the first non-excluded voice if needed
  // This prevents explicitly using Karen when man is selected
  return null;
}

function stopSpeech() {
  // Clear all pending timeouts
  speechTimeouts.forEach(timeout => clearTimeout(timeout));
  speechTimeouts = [];
  
  // Cancel any ongoing speech
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

function spellWord(word) {
  if (!('speechSynthesis' in window)) {
    alert('Sorry, your browser does not support speech synthesis.');
    return;
  }
  
  // Stop any ongoing speech first
  stopSpeech();
  
  // Process input based on mode
  const processedText = processInputForSpelling(word, spellingMode);
  const voice = getVoice();
  
  // Debug: log selected voice and voice being used
  console.log('Selected voice type:', selectedVoice);
  console.log('Voice being used:', voice ? voice.name : 'none');
  console.log('Spelling mode:', spellingMode);
  
  let delay = 0;
  const characters = processedText.split('');
  
  characters.forEach(char => {
    // Handle spaces with a pause
    if (char === ' ') {
      // Add extra delay for space (pause)
      delay += 500; // Small pause for space
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(char);
    
    // Adjust rate: slower for woman voice
    // if (selectedVoice === 'woman') {
    //   utterance.rate = 1; // Slower rate for female voice
    // } else {
    //   utterance.rate = 0.8; // Normal rate for male voice
    // }
    
    // Always set the voice if we have one
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = selectedLang || (voice && voice.lang) || '';
    
    // Adjust pitch for gender difference (default pitch is 1.0)
    if (selectedVoice === 'man') {
      utterance.pitch = 1; // Lower pitch for male voice
    } else {
      utterance.pitch = 1; // Higher pitch for female voice
    }
    
    const timeout = setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, delay);
    speechTimeouts.push(timeout);
    delay += 700; // Delay between letters
  });
}

manVoiceBtn.addEventListener('click', () => {
  selectedVoice = 'man';
  manVoiceBtn.classList.add('active');
  womanVoiceBtn.classList.remove('active');
});

womanVoiceBtn.addEventListener('click', () => {
  selectedVoice = 'woman';
  womanVoiceBtn.classList.add('active');
  manVoiceBtn.classList.remove('active');
});

languageSelect.addEventListener('change', () => {
  selectedLang = languageSelect.value;
});

// Mode toggle handlers
if (fullModeBtn) {
  fullModeBtn.addEventListener('click', () => {
    spellingMode = 'full';
    fullModeBtn.classList.add('active');
    minimalModeBtn.classList.remove('active');
  });
}

if (minimalModeBtn) {
  minimalModeBtn.addEventListener('click', () => {
    spellingMode = 'minimal';
    minimalModeBtn.classList.add('active');
    fullModeBtn.classList.remove('active');
  });
}

button.addEventListener('click', () => {
  const word = sanitizeInput(input.value);
  if (word) spellWord(word);
});

stopBtn.addEventListener('click', () => {
  stopSpeech();
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') button.click();
});

// Focus input on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (input) input.focus();
  });
} else {
  if (input) input.focus();
}


