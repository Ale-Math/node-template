/**
 * Converts MongoDB document to API response.
 *
 * Maps:
 * _id -> id
 *
 * Removes:
 * access_code from public retrieval responses
 */

function serialize(card, showAccessCode = false) {
  const data = typeof card.toObject === 'function' ? card.toObject() : { ...card };

  data.id = String(data._id);

  delete data._id;

  if (!showAccessCode) {
    delete data.access_code;
  }

  return data;
}

module.exports = serialize;
