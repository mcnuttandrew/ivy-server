# Ivy Server

This is the backend to the Ivy application described in our paper "Ivy: An Integrated Visualization Editor via Parameterized Declarative Templates". In consists of a simple express wrapper over postgres that enables sharing of templates and template thumbnails.

## Setup

Please have node version >=9 installed (12 preferred). Install the deps as typically for a js project:

```
yarn
```

Next have postgres installed in the usual way. Connect to it and create the database like 
```
CREATE DATABASE ivy;
```
Then compose your DATABASE_URL, which will be something like DATABASE_URL=postgresql://username:password@localhost:5432/ivy . Finally run:

```
DATABASE_URL=postgresql://username:password@localhost:5432/ivy yarn migrate up
```


Finally run the server:

```sh

yarn start

```

And that should be it!