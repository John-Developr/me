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
    // Contact links, social links and project URLs are content now:
    // edit them in /admin/profile and /admin/projects.

    // Own API Routes
    CONTACT_FORM_API: "/api/contact",
    BLOG_API: "/api/blog",
    BLOG_RECENT_API: "/api/blog/recent",
    BLOG_DETAIL_API: (slug: string) => "/api/blog/" + slug,
    PAGE_VIEW_API: "/api/p",

    // Admin API Routes (require an admin session)
    ADMIN_LOGIN_API: "/api/admin/auth/login",
    ADMIN_LOGOUT_API: "/api/admin/auth/logout",
    ADMIN_TRAFFIC_API: "/api/admin/analytics/traffic",
    ADMIN_PROJECTS_API: "/api/admin/projects",
    ADMIN_PROJECT_API: (id: string) => "/api/admin/projects/" + id,
    ADMIN_PROFILE_API: "/api/admin/profile",
    ADMIN_SITE_SETTINGS_API: "/api/admin/site-settings",
    ADMIN_SKILLS_API: "/api/admin/skills",
    ADMIN_SKILL_API: (id: string) => "/api/admin/skills/" + id,
    ADMIN_SKILL_CATEGORIES_API: "/api/admin/skill-categories",
    ADMIN_SKILL_CATEGORY_API: (id: string) => "/api/admin/skill-categories/" + id,
    ADMIN_MEDIA_API: "/api/admin/media",
    ADMIN_MEDIA_ITEM_API: (id: string) => "/api/admin/media/" + id,
    ADMIN_MEDIA_IMPORT_API: "/api/admin/media/import",
    ADMIN_EXPERIENCES_API: "/api/admin/experiences",
    ADMIN_EXPERIENCE_API: (id: string) => "/api/admin/experiences/" + id,
    ADMIN_MESSAGE_API: (id: string) => "/api/admin/messages/" + id,
    ADMIN_BLOGS_API: "/api/admin/blogs",
    ADMIN_BLOG_API: (id: number) => "/api/admin/blogs/" + id,
    ADMIN_BLOG_GENERATE_API: "/api/admin/blogs/generate",
    ADMIN_ACCOUNT_API: "/api/admin/account",
    ADMIN_PASSWORD_API: "/api/admin/account/password",
    ADMIN_SIGN_OUT_OTHERS_API: "/api/admin/account/sign-out-others",
} as const;
  