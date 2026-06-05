-- TABLE 5: event_outfits
-- Friend-submitted outfit links on Event Mode share pages
CREATE TABLE event_outfits (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid        REFERENCES items(id) ON DELETE CASCADE, -- the original Stash link
  submitter_id text        NOT NULL, -- anonymous visitor ID (localStorage)
  created_at   timestamptz DEFAULT now(),
  product_url  text        NOT NULL, -- the outfit link they are sharing
  caption      text        -- optional note like 'thinking this one?? help'
);

ALTER TABLE event_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an outfit"
  ON event_outfits FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view outfits"
  ON event_outfits FOR SELECT USING (true);

-- Event Mode columns on existing items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS event_name  text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS hide_price  boolean DEFAULT false;
