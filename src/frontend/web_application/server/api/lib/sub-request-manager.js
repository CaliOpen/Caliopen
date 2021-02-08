const CALIOPEN_SUBREQUEST = 'X-Caliopen-SSR';
const CALIOPEN_SUBREQUEST_VALUE = 'SSR';

export const getSubRequestHeaders = () => ({
  [CALIOPEN_SUBREQUEST]: CALIOPEN_SUBREQUEST_VALUE,
});

export const isSubRequest = (req) =>
  req.headers[CALIOPEN_SUBREQUEST] === CALIOPEN_SUBREQUEST_VALUE;
