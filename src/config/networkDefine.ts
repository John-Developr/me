/**
 * ============================
 * Network Define (API Routes)
 * ============================
 * 
 * This object serves as a centralized registry for all external and internal API endpoints used
 * throughout the application. By declaring all network-related URLs in one place, we ensure:
 * 
 * - Easier maintainability and readability
 * - Avoidance of hardcoded URLs scattered across files
 * - Better support for environment-based switching (dev, prod, etc.)
 * - Cleaner and more consistent naming conventions for API endpoints
 */

export const networkDefine = {
    // External URL
    GEMINI_GENERATE_CONTENT_URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
    CALENDLY_URL: "https://calendly.com/johncarlo-fullstackdev/30min",

    MAIL_TO: "mailto:johncarlo.fullstackdev@gmail.com",
    RESUME_URL: "/documents/resume.pdf",

    // PROJECTS URL
    GORDON_PROJECTS_URL: "https://www.gordonbostic.com/",
    GORDON_GITHUB_URL: "https://github.com/John-Developr/gordon-bostic",

    // My Socials Links
    LINKEDIN_URL: "https://ph.linkedin.com/in/johncarlo-fullstackdev",
    FACEBOOK_URL: "https://www.facebook.com/johncarlo.devolpr",

    // Own API Routes
    CONTACT_FORM_API: "/api/contact",
    BLOG_API: "/api/blog"
};
  