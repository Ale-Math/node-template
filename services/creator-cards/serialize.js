function serialize(card, showAccessCode = false) {
  const data = typeof card.toObject === 'function' ? card.toObject() : { ...card };

  data.id = data._id;

  delete data._id;

  if (!showAccessCode) {
    delete data.access_code;
  }

  return data;
}

module.exports = serialize;
