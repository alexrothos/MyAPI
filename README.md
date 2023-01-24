# bids_monitoring_api v2.3

Server application for managing the commands from the users, receving 
data from media players, inserting and updating data to a Postgres database.


## Structure :

    .
    ├── auth:
    │    └── auth.js
    ├── conf:
    │    ├── config.json
    │    └── log4js.json
    ├── docs:
    │    └── bids_api.drawio
    ├── msg_handlers:
    │    └── sg_handlers.js
    ├── stompf:
    │    └── stompf.js
    └── app.js


> note: this is an application that needs Node.JS to run it, all the 
>       dependencies are in package.json file and you must install all 
>       of them in the folder of the app.

## Installation of dependencies:
Use the Node.js package manager [npm](https://nodejs.org/en/download/)

```bash
npm install
```

## Running the project:
```bash
node app.js
```

## app.js

This app creates a server for interacting with media players and with 
the user's web app.

Services to the media players:
-Accept json objects with commands and parameters and creates the messages that are send through ActiveMQ.

Services to the users:

    - Sending media players current state
    - Sending users information table
    - Create new user
    - Update user
    - Delete user
    - Login & Authentication services

## Auth folder:

 This folder contains the auth.js file that is responsible for the user's
authorization and is imported at main app as a middleware for the authorization
at the endpoints.

## Conf folder:

This folder contains the configurations for the server and the log files 
in separate files.

### config.json

 This file contains the setup for ActiveMQ's ip, port and the topics for 
 communication for commands and replies.

### log4js.json

 This file contains the setup for Log4js.

## Docs folder:

 This folder contains a flow diagram of the app's functionality

## Msg_handlers folder:

 This folder contains the msg_handlers.js file with the functions addMsg,
 addPlayer and sender.

### addMsg function:

 This function is adding the response with the results to a command, that
was requested, to the database tables *responses* and *user_commands*.

 
### addPlayer function:

 This function adds or updates the media player data. Everytime a media
player communicate with the server, the data for this player are updated.

### sender function:

 This function is used when a command is received. Then a message is 
created containing the data and send to command topic from where the 
media players are receiving the command.

## Old_versions folder:
 
 This folder is for quick reference to older versions. The structure and 
the contained files are unimportand for the application.

## Stompf folder:
 
 this folder contains the stompf.js file that estamblish a connection 
using the *stomp-client* module, for the use of message broker ActiveMQ.
The configuration about the client topics and queues are in the config
file.

<h3 align="left">Languages and Tools:</h3>
<p align="left"> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> </a> <a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </a> <a href="https://www.postgresql.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg" alt="postgresql" width="40" height="40"/> </a> </p>