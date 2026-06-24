const { throwAppError } = require('@app-core/errors');

const CreatorCard = require('@app/repository/creator-card');

const serialize = require('./serialize');

async function remove(serviceData) {
  const { slug } = serviceData;

  const card = await CreatorCard.findOne({
    query: {
      slug,
    },
  });

  if (!serviceData.creator_reference) {
    throwAppError('creator_reference is required');
  }

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
