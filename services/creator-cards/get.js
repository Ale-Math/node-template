/**
 * Public card retrieval flow.
 *
 * Access order:
 * 1. NF01 - not found
 * 2. NF02 - draft
 * 3. AC03 - missing access code
 * 4. AC04 - invalid access code
 * 5. return card
 */

const { throwAppError } = require('@app-core/errors');

const CreatorCard = require('@app/repository/creator-card');

const serialize = require('./serialize');

async function get(serviceData) {
  const { slug } = serviceData;

  const accessCode = serviceData.access_code;

  const card = await CreatorCard.findOne({
    query: {
      slug,
    },
  });

  /*
  ------------------------

  NF01

  ------------------------
  */

  if (!card) {
    throwAppError(
      'Creator card not found',

      'NF01'
    );
  }

  /*
  ------------------------

  DELETED

  ALSO NF01

  ------------------------
  */

  if (card.deleted) {
    throwAppError(
      'Creator card not found',

      'NF01'
    );
  }

  /*
  ------------------------

  NF02

  ------------------------
  */

  if (card.status === 'draft') {
    throwAppError(
      'Card exists but is a draft',

      'NF02'
    );
  }

  /*
  ------------------------

  AC03

  ------------------------
  */

  if (card.access_type === 'private' && !accessCode) {
    throwAppError(
      'This card is private. An access code is required',

      'AC03'
    );
  }

  /*
  ------------------------

  AC04

  ------------------------
  */

  if (card.access_type === 'private' && card.access_code !== accessCode) {
    throwAppError(
      'Invalid access code',

      'AC04'
    );
  }

  return serialize(
    card,

    false
  );
}

module.exports = get;
