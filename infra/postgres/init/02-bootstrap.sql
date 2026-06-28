CREATE TABLE IF NOT EXISTS bootstrap_metadata (
    id SERIAL PRIMARY KEY,
    initialized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

INSERT INTO bootstrap_metadata (notes)
SELECT 'Initial PostgreSQL bootstrap scripts executed.'
WHERE NOT EXISTS (SELECT 1 FROM bootstrap_metadata);
