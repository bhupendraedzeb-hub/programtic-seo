CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    seo_checks JSONB DEFAULT '{"min_words":300,"title_length":[50,60],"meta_description_length":[140,160]}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_variables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (template_id, name)
);

CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    meta_description VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    storage_url VARCHAR(500) NOT NULL,
    word_count INTEGER DEFAULT 0,
    seo_score INTEGER DEFAULT 0,
    seo_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    is_bulk BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bulk_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    csv_filename VARCHAR(255),
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'queued',
    result_urls JSONB DEFAULT '[]',
    errors JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_user_slug ON pages(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_user_id ON bulk_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_status ON bulk_jobs(status);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can access their templates'
    ) THEN
        CREATE POLICY "Users can access their templates"
            ON templates FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can access their template variables'
    ) THEN
        CREATE POLICY "Users can access their template variables"
            ON template_variables FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM templates
                    WHERE templates.id = template_variables.template_id
                    AND templates.user_id = auth.uid()
                )
            );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can access their pages'
    ) THEN
        CREATE POLICY "Users can access their pages"
            ON pages FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can access their bulk jobs'
    ) THEN
        CREATE POLICY "Users can access their bulk jobs"
            ON bulk_jobs FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END$$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-pages', 'generated-pages', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public read for generated pages'
    ) THEN
        CREATE POLICY "Public read for generated pages"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'generated-pages');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload generated pages'
    ) THEN
        CREATE POLICY "Users can upload generated pages"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'generated-pages'
                AND (auth.uid()::text = (storage.foldername(name))[1])
            );
    END IF;
END$$;
