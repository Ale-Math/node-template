const { throwAppError } = require('@app-core/errors');

const CreatorCard = require('@app/repository/creator-card');

const generateSlug = require('./helpers/generate-slug');

const serialize = require('./serialize');

async function create(serviceData) {
  const payload = {
    ...serviceData,
  };

  if (!payload.title) {
    throwAppError('title is required');
  }

  if (payload.title.length < 3 || payload.title.length > 100) {
    throwAppError('title must be between 3 and 100 characters');
  }

  if (payload.description && payload.description.length > 500) {
    throwAppError('description must not exceed 500 characters');
  }

  if (!payload.creator_reference) {
    throwAppError('creator_reference is required');
  }

  if (payload.creator_reference.length !== 20) {
    throwAppError('creator_reference must be exactly 20 characters');
  }

  if (!payload.status) {
    throwAppError('status is required');
  }

  /*
  --------------------------------
  DEFAULT ACCESS TYPE
  --------------------------------
  */

  payload.access_type = payload.access_type || 'public';

  /*
  --------------------------------
  STATUS ENUM
  --------------------------------
  */

  if (!['draft', 'published'].includes(payload.status)) {
    throwAppError('status must be draft or published');
  }

  /*
  --------------------------------
  ACCESS TYPE ENUM
  --------------------------------
  */

  if (!['public', 'private'].includes(payload.access_type)) {
    throwAppError('access_type must be public or private');
  }

  /*
  --------------------------------
  AC01
  --------------------------------
  */

  if (payload.access_type === 'private' && !payload.access_code) {
    throwAppError(
      'access_code is required when access_type is private',

      'AC01'
    );
  }

  /*
  --------------------------------
  AC05
  --------------------------------
  */

  if (payload.access_type === 'public' && payload.access_code) {
    throwAppError(
      'access_code can only be set on private cards',

      'AC05'
    );
  }

  /*
  --------------------------------
  ACCESS CODE FORMAT
  --------------------------------
  */

  if (payload.access_code && !/^[A-Za-z0-9]{6}$/.test(payload.access_code)) {
    throwAppError('access_code must be exactly 6 alphanumeric characters');
  }

  /*
--------------------------------
SLUG
--------------------------------
*/

  let { slug } = payload;

  const userProvidedSlug = !!payload.slug;

  if (!slug) {
    slug = generateSlug(payload.title);
  }

  /*
--------------------------------
SHORT AUTO SLUG

APPEND SUFFIX
--------------------------------
*/

  if (!userProvidedSlug && slug.length < 5) {
    const suffix = Math.random()

      .toString(36)

      .substring(2, 8);

    slug = `${slug}-${suffix}`;
  }

  /*
--------------------------------
CHECK SLUG EXISTS
--------------------------------
*/

  const existingCard = await CreatorCard.findOne({
    query: {
      slug,
    },
  });

  /*
--------------------------------
USER PROVIDED

-> SL02
--------------------------------
*/

  if (userProvidedSlug && existingCard) {
    throwAppError(
      'Slug is already taken',

      'SL02'
    );
  }

  /*
--------------------------------
AUTO GENERATED

APPEND SUFFIX
--------------------------------
*/

  if (!userProvidedSlug && existingCard) {
    const suffix = Math.random()

      .toString(36)

      .substring(2, 8);

    slug = `${slug}-${suffix}`;
  }
  /*
  --------------------------------
  LINKS
  --------------------------------
  */

  if (payload.links) {
    const validLinks = payload.links.every(
      (link) =>
        link.title &&
        link.title.length >= 1 &&
        link.title.length <= 100 &&
        link.url &&
        link.url.length <= 200 &&
        (link.url.startsWith('http://') || link.url.startsWith('https://'))
    );

    if (!validLinks) {
      throwAppError('invalid links');
    }
  }

  /*
  --------------------------------
  SERVICE RATES
  --------------------------------
  */

  if (payload.service_rates) {
    const {
      currency,

      rates,
    } = payload.service_rates;

    if (!['NGN', 'USD', 'GBP', 'GHS'].includes(currency)) {
      throwAppError('invalid currency');
    }

    if (!Array.isArray(rates) || rates.length === 0) {
      throwAppError('rates must not be empty');
    }

    const validRates = rates.every(
      (rate) =>
        rate.name &&
        rate.name.length >= 3 &&
        rate.name.length <= 100 &&
        Number.isInteger(rate.amount) &&
        rate.amount > 0 &&
        (!rate.description || rate.description.length <= 250)
    );

    if (!validRates) {
      throwAppError('invalid rates');
    }
  }

  /*
  --------------------------------
  SAVE
  --------------------------------
  */

  const now = Date.now();

  const createdCard = await CreatorCard.create({
    ...payload,

    slug,

    created: now,

    updated: now,

    deleted: null,
  });

  return serialize(
    createdCard,

    true
  );
}

module.exports = create;
