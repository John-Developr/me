-- ============================================================
-- Skills & Technologies: extra fields + seed from the current site
-- Requires 20261106000200_portfolio_content.sql. Safe to re-run:
-- the seed only runs while there are no categories, so admin edits
-- are never overwritten.
--
-- skill_categories.icon  — icon key for the "Full Toolkit." card
-- skills.description     — one line shown for Core Stack tools
-- skills.core_order      — order within Core Stack (is_core = true)
-- skills.is_current      — shown in "Right Now" on /tech-stack
--
-- Seeded from src/containers/tech-stack-page/techStackData.ts and
-- src/config/techLogos.ts. "React / React Native" is a core tool with no
-- category (the toolkit lists React and React Native separately).
--
-- Rollback:
--   alter table public.skill_categories drop column if exists icon;
--   alter table public.skills drop column if exists description,
--     drop column if exists core_order, drop column if exists is_current;
--   -- seeded rows: delete from public.skills; delete from public.skill_categories;
-- ============================================================

alter table public.skill_categories
  add column if not exists icon text not null default 'category'
    check (icon in ('category', 'settings', 'phone', 'document', 'sync', 'chat', 'edit', 'link', 'lock', 'briefcase', 'star'));

alter table public.skills
  add column if not exists description text    check (char_length(description) <= 160),
  add column if not exists core_order  integer not null default 0,
  add column if not exists is_current  boolean not null default false;

create index if not exists skills_core_idx on public.skills (is_core, core_order);
create index if not exists skill_categories_sort_idx on public.skill_categories (sort_order);

-- A name can't appear twice without a category either.
create unique index if not exists skills_uncategorized_name_key
  on public.skills (lower(name)) where category_id is null;

do $$
begin
  if exists (select 1 from public.skill_categories) then
    return;
  end if;

  insert into public.skill_categories (slug, name, description, icon, sort_order) values
    ('frontend', 'Frontend', 'Interfaces for the web, from components to full apps.', 'category', 0),
    ('backend', 'Backend', 'APIs, servers, and business logic.', 'settings', 1),
    ('mobile', 'Mobile', 'Native and cross-platform apps.', 'phone', 2),
    ('databases', 'Databases', 'Relational, document, and key-value stores.', 'document', 3),
    ('cloud-devops', 'Cloud & DevOps', 'Infrastructure, containers, and delivery.', 'sync', 4),
    ('ai-ml', 'AI & Machine Learning', 'Models, frameworks, and LLM tooling.', 'chat', 5),
    ('cms', 'CMS & E-commerce', 'Content platforms and online stores.', 'edit', 6),
    ('integrations', 'APIs & Integrations', 'Payments, real-time features, and third-party services.', 'link', 7),
    ('security', 'Security', 'Authentication, access control, and encryption.', 'lock', 8),
    ('tools', 'Developer Tools', 'Everyday tools for building and shipping.', 'briefcase', 9);

  insert into public.skills (category_id, name, logo_url, is_core, description, core_order, is_current, sort_order)
  select c.id, s.name, s.logo_url, s.is_core, s.description, s.core_order, s.is_current, s.sort_order
  from (values
    ('frontend', 'JavaScript', null, false, null, 0, false, 0),
    ('frontend', 'TypeScript', '/images/tech/typescript.png', false, null, 0, false, 1),
    ('frontend', 'React', '/images/tech/react.png', false, null, 0, false, 2),
    ('frontend', 'Next.js', '/images/tech/next.png', true, 'React framework for fast, SEO-friendly web.', 1, true, 3),
    ('frontend', 'Vue.js', null, false, null, 0, false, 4),
    ('frontend', 'AngularJS', null, false, null, 0, false, 5),
    ('frontend', 'Tailwind CSS', null, false, null, 0, false, 6),
    ('frontend', 'SCSS', null, false, null, 0, false, 7),
    ('frontend', 'HTML', null, false, null, 0, false, 8),
    ('frontend', 'jQuery', null, false, null, 0, false, 9),
    ('backend', 'Node.js', '/images/tech/node.png', true, 'APIs, servers, and real-time apps.', 2, false, 0),
    ('backend', 'Express.js', null, false, null, 0, false, 1),
    ('backend', 'NestJS', null, false, null, 0, false, 2),
    ('backend', 'PHP', null, false, null, 0, false, 3),
    ('backend', 'Laravel', null, false, null, 0, false, 4),
    ('backend', 'CakePHP', null, false, null, 0, false, 5),
    ('backend', 'CodeIgniter', null, false, null, 0, false, 6),
    ('backend', 'Python', null, false, null, 0, false, 7),
    ('backend', 'Java', null, false, null, 0, false, 8),
    ('mobile', 'Swift', null, false, null, 0, true, 0),
    ('mobile', 'SwiftUI', null, false, null, 0, true, 1),
    ('mobile', 'Objective-C', null, false, null, 0, true, 2),
    ('mobile', 'React Native', null, false, null, 0, false, 3),
    ('mobile', 'Flutter', null, false, null, 0, false, 4),
    ('mobile', 'Kotlin', null, false, null, 0, false, 5),
    ('mobile', 'Java (Android)', null, false, null, 0, false, 6),
    ('databases', 'PostgreSQL', null, false, null, 0, false, 0),
    ('databases', 'MySQL', null, false, null, 0, false, 1),
    ('databases', 'MongoDB', null, false, null, 0, false, 2),
    ('databases', 'DynamoDB', null, false, null, 0, false, 3),
    ('databases', 'Redis', null, false, null, 0, false, 4),
    ('databases', 'Supabase', '/images/tech/supabase.png', true, 'Postgres backend with database and auth.', 3, true, 5),
    ('databases', 'Firebase', '/images/tech/firebase.png', true, 'Google''s app platform for data and auth.', 4, false, 6),
    ('cloud-devops', 'AWS', null, false, null, 0, false, 0),
    ('cloud-devops', 'Docker', null, false, null, 0, false, 1),
    ('cloud-devops', 'Kubernetes', null, false, null, 0, false, 2),
    ('cloud-devops', 'GitHub Actions', null, false, null, 0, false, 3),
    ('cloud-devops', 'Terraform', null, false, null, 0, false, 4),
    ('cloud-devops', 'Vercel', null, false, null, 0, false, 5),
    ('ai-ml', 'Google Gemini', null, false, null, 0, true, 0),
    ('ai-ml', 'OpenAI', '/images/tech/chatgpt.png', true, 'AI models for assistants and coding.', 7, false, 1),
    ('ai-ml', 'LangChain', null, false, null, 0, false, 2),
    ('ai-ml', 'Transformers', null, false, null, 0, false, 3),
    ('ai-ml', 'TensorFlow', null, false, null, 0, false, 4),
    ('ai-ml', 'PyTorch', null, false, null, 0, false, 5),
    ('cms', 'WordPress', null, false, null, 0, false, 0),
    ('cms', 'Shopify', null, false, null, 0, false, 1),
    ('cms', 'PrestaShop', null, false, null, 0, false, 2),
    ('cms', 'Contentful', null, false, null, 0, false, 3),
    ('cms', 'Wix', null, false, null, 0, false, 4),
    ('integrations', 'REST APIs', null, false, null, 0, false, 0),
    ('integrations', 'Socket.io', null, false, null, 0, false, 1),
    ('integrations', 'PayPal', null, false, null, 0, false, 2),
    ('integrations', 'Authorize.net', null, false, null, 0, false, 3),
    ('integrations', 'Square', null, false, null, 0, false, 4),
    ('integrations', 'Google Maps', null, false, null, 0, false, 5),
    ('security', 'OAuth', null, false, null, 0, false, 0),
    ('security', 'JWT', null, false, null, 0, false, 1),
    ('security', 'AWS IAM', null, false, null, 0, false, 2),
    ('security', 'AES', null, false, null, 0, false, 3),
    ('security', 'RSA', null, false, null, 0, false, 4),
    ('tools', 'Git', null, false, null, 0, false, 0),
    ('tools', 'GitHub', null, false, null, 0, false, 1),
    ('tools', 'VS Code', null, false, null, 0, false, 2),
    ('tools', 'Xcode', '/images/tech/xcode.png', true, 'Apple''s IDE for building iOS apps.', 5, false, 3),
    ('tools', 'Android Studio', null, false, null, 0, false, 4),
    ('tools', 'Docker Compose', null, false, null, 0, false, 5),
    ('tools', 'Postman', null, false, null, 0, false, 6),
    ('tools', 'Jira', null, false, null, 0, false, 7),
    ('tools', 'Figma', '/images/tech/figma.png', true, 'Collaborative design tool for UI/UX.', 6, false, 8),
    (null, 'React / React Native', '/images/tech/react.png', true, 'Scalable web and native applications.', 0, false, 0)
  ) as s(category_slug, name, logo_url, is_core, description, core_order, is_current, sort_order)
  left join public.skill_categories c on c.slug = s.category_slug;
end;
$$;
