FROM node:17
WORKDIR /
COPY . .
RUN npm install -g npm@8.5.0
RUN npm install
ENV DB_HOST = http://192.168.1.12
ENV DB_PORT = 5000
ENV DB_USER = stevengez
ENV DB_PASS = Keyuser95
EXPOSE 5000
CMD ["node","index.js"]