## Double Stage for Static Build
# ##Stage 1: Build ##
# FROM node:16-alpine as buildImage
# WORKDIR /
# COPY . .
# RUN npm install
# ENV REACT_APP_API_HOST http://192.168.1.12
# ENV REACT_APP_API_PORT 5000
# RUN npm run build

# ##Stage 2: Static React Image
# FROM nginx:1.21.6-alpine
# COPY ./nginx.conf /etc/nginx/nginx.conf
# COPY --from=buildImage ./build /usr/share/nginx/html
# EXPOSE 80

FROM node:16-alpine
WORKDIR /
COPY . .
RUN npm install
ENV REACT_APP_API_HOST http://192.168.1.12
ENV REACT_APP_API_PORT 5000
CMD ["npm","start"]


