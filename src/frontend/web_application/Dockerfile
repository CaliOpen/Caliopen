# This file creates a container that runs a {package} caliopen frontend
# Important:
# Author: Caliopen
# Date: 2016-01-05

FROM node:12 as builder
MAINTAINER Caliopen

ADD . /srv/caliopen/frontend/
WORKDIR /srv/caliopen/frontend/
RUN yarn install
RUN yarn run release

FROM node:12-alpine
MAINTAINER Caliopen

WORKDIR /srv/caliopen/frontend/
COPY --from=builder /srv/caliopen/frontend/dist ./dist
COPY --from=builder /srv/caliopen/frontend/bin ./bin
COPY --from=builder /srv/caliopen/frontend/public ./public
COPY --from=builder /srv/caliopen/frontend/package.json .
COPY --from=builder /srv/caliopen/frontend/yarn.lock .
ENV NODE_ENV=production
RUN yarn install

EXPOSE 4000

CMD ["yarn", "run", "start:prod"]
