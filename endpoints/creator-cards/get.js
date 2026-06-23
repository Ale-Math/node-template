const { createHandler } = require('@app-core/server');

const getService = require('@app/services/creator-cards/get');

module.exports = createHandler({
  path: '/creator-cards/:slug',

  method: 'get',

  middlewares: [],

  async handler(
    rc,

    helpers
  ) {
    const response = await getService({
      slug: rc.params.slug,

      access_code: rc.query.access_code,
    });

    return {
      status: helpers.http_statuses.HTTP_200_OK,

      data: response,
    };
  },
});
