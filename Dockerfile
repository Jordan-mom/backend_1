FROM node:12
WORKDIR /home/node/app
COPY /website-backend-main/Catalog . 
RUN npm install
EXPOSE 5252
CMD [ "node", "Catalog.js" ]
