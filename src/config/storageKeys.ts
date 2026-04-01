export const storageKeys = {

  // localStorage — persists across sessions
  local: {
    theme:    "theme_preference",
    welcome:  "welcome_last_shown",
  },

  // sessionStorage — clears when tab closes
  session: {},

  // cookies
  cookie: {
    convo:    "ai_conversation",
  },

} as const;