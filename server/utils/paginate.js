// codewizards/server/utils/paginate.js
//
// Opt-in pagination: only activates when both `page` and `limit` are present in the
// query string, so any existing caller that never sends them keeps getting the full,
// unpaginated array exactly as before.
const parsePagination = (query) => {
  const page = parseInt(query.page, 10);
  const limitRaw = parseInt(query.limit, 10);
  const active = Number.isInteger(page) && page > 0 && Number.isInteger(limitRaw) && limitRaw > 0;
  const limit = active ? Math.min(limitRaw, 100) : 0;

  return {
    active,
    page: active ? page : 1,
    limit,
    skip: active ? (page - 1) * limit : 0,
  };
};

module.exports = { parsePagination };
