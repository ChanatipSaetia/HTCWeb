FROM node:8.9.3

# Install yarn
RUN npm i -g yarn

RUN mkdir -p /app

WORKDIR /app

ADD . .
RUN yarn install --quiet
CMD ls
# EXPOSE 3000

# CMD [ "yarn", "install" ]