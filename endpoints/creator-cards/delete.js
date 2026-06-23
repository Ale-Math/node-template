const { createHandler } = require('@app-core/server');

const deleteService = require('@app/services/creator-cards/delete');

module.exports = createHandler({
  path: '/creator-cards/:slug',

  method: 'delete',

  middlewares: [],

  async handler(
    rc,

    helpers
  ) {
    const response = await deleteService({
      slug: rc.params.slug,
    });

    return {
      status: helpers.http_statuses.HTTP_200_OK,

      data: response,
    };
  },
});
