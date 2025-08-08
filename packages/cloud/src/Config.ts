// Production constants
export const PRODUCTION_CLERK_BASE_URL = "https://app.roocode.com"
export const PRODUCTION_NEIRA_CODER_API_URL = "https://app.roocode.com"
export const PRODUCTION_ROO_CODE_API_URL = "https://app.roocode.com"

// Functions with environment variable fallbacks
export const getClerkBaseUrl = () => process.env.CLERK_BASE_URL || PRODUCTION_CLERK_BASE_URL
export const getResearcherryCoderApiUrl = () => process.env.NEIRA_CODER_API_URL || PRODUCTION_NEIRA_CODER_API_URL
