FROM node:16.4.2 AS development

ENV CI=true
ENV PORT=3000

USER node

WORKDIR /src

# don't think any modules use this folder
ENV PATH /src/node_modules/.bin:$PATH

# By default root takes ownership of copied files, the chown argument avoids this
COPY --chown=node:node package.json ./
#package-lock.json ./

# RUN npm ci
RUN npm install

# Only needed when using volumes -> refactor so exclusive to development build?
# RUN chown -R node:node node_modules

COPY . .

CMD [ "npm", "start" ]

FROM development AS builder

RUN npm run build

FROM nginx:1.21.1

# Don't think this image comes with a non-root user so need to
# add one then add a --chown user:user argument to the below if
# I want to run as non-root

COPY --from=builder /src/build /usr/share/nginx/html
