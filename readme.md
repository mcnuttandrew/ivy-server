# Ivy Server

This is the backend to the Ivy application described in our paper "Ivy: An Integrated Visualization Editor via Parameterized Declarative Templates". In consists of a simple express wrapper over postgres that enables sharing of templates and template thumbnails.

## Setup

Please have node version >=9 installed (12 preferred). Next install MongoDB, installation instructions will vary based on operating system please consult https://docs.mongodb.com/manual/installation/. Next to get the server running, in a new terminal tab run the following commands to turn on mongodb:

```sh
mongod
```

In a final tab run the following commands to install the server deps and run the server:

```sh

# if using yarn
yarn
yarn start

# or if using npm
npm install
npm run start
```
