# vwatch 

<p align="left">
  <img width="150" src="https://github.com/rajatsc/vwatch/blob/master/public/img/logo/logo.png">
</p>

[![Build Status](https://travis-ci.com/rajatsc/vwatch.svg?branch=master)](https://travis-ci.com/rajatsc/vwatch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

vwatch let's you watch youtube videos in sync with others. You can create permanent rooms, add your friends to these rooms, organize videos into playlist, and chat while enjoying a stream of youtube videos together. It is built using Node.js, Express, Mongoose and Socket.io. [Try vwatch](https://vwatch0.herokuapp.com)


## Features

* Uses [Express](https://expressjs.com) as the application Framework
* Manages Sessions using [express-session](https://github.com/expressjs/session)
* Video Synchronization and chat is achieved through real time communication between client and server using [Socket.io](https://socket.io/)
* Authenticates via email and password using [Passport](http://www.passportjs.org/)
* Uses [MongoDB](https://www.mongodb.com/) as database and [mongoose](https://mongoosejs.com/) as object document modeler (ODM) to interact with MongoDB
* Stores session in MongoDB using [connect-mongo](https://github.com/jdesboeufs/connect-mongo); a MongoDB-based session store
* Uses [Youtube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) to embed videos and control playback
