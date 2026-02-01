-- Denormalized view for Algolia search indexing
-- Run this in Supabase SQL Editor or as a migration

CREATE OR REPLACE VIEW searchable_listings AS
SELECT
  l.id,
  l.title,
  l.description,
  l.slug,
  l.price,
  l.currency,
  l.type,
  l.status,
  l.quantity,
  l."createdAt",
  l."updatedAt",
  a.id as "agentId",
  a.name as "agentName",
  a."avatarUrl" as "agentAvatarUrl",
  c.id as "categoryId",
  c.name as "categoryName",
  c.slug as "categorySlug",
  loc.id as "locationId",
  loc.name as "locationName",
  loc.slug as "locationSlug",
  (SELECT url FROM "MediaAsset" WHERE "listingId" = l.id ORDER BY "sortOrder" LIMIT 1) as "imageUrl"
FROM "Listing" l
LEFT JOIN "Agent" a ON l."agentId" = a.id
LEFT JOIN "Category" c ON l."categoryId" = c.id
LEFT JOIN "Location" loc ON l."locationId" = loc.id
WHERE l.status = 'ACTIVE';

-- Verify the view works
-- SELECT * FROM searchable_listings LIMIT 5;
