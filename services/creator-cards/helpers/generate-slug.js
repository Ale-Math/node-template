function randomSuffix() {
  return Math.random().toString(36).substring(2, 8);
}

function generateSlug(title) {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');

  if (slug.length < 5) {
    slug = `${slug}-${randomSuffix()}`;
  }

  return slug;
}

module.exports = generateSlug;
