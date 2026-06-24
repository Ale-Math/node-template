/**
 * Soft deletes creator card.
 *
 * Sets deleted timestamp and returns
 * deleted card payload.
 */

const validator = require('@app-core/validator');

const { throwAppError } = require('@app-core/errors');

const CreatorCard = require('@app/repository/creator-card');

const serialize = require('./serialize');

const spec = `root {
  creator_reference string<length:20>
  slug string
}`;

const parsedSpec = validator.parse(spec);

async function remove(serviceData) {
  const data = validator.validate(serviceData, parsedSpec);

  const { slug } = data;

  const card = await CreatorCard.findOne({
    query: {
      slug,
    },
  });

  /*
  -----------------------

  NF01

  -----------------------
  */

  if (!card || card.deleted) {
    throwAppError(
      'Creator card not found',

      'NF01'
    );
  }

  /*
  -----------------------

  SOFT DELETE

  -----------------------
  */

  const now = Date.now();

  await CreatorCard.updateOne({
    query: {
      slug,
    },

    updateValues: {
      deleted: now,

      updated: now,
    },
  });

  card.deleted = now;

  card.updated = now;

  return serialize(
    card,

    false
  );
}

module.exports = remove;
