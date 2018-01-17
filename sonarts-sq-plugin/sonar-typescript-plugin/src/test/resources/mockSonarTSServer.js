#!/usr/bin/env node

const net = require('net');

const server = net.createServer( (c) => {
    console.log('client connected');
});

server.listen(55555, '127.0.0.1', () => {
    console.log("server bound");
});
