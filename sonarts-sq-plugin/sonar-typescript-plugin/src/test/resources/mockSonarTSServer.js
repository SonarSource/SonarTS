#!/usr/bin/env node

const net = require('net');

const server = net.createServer( (c) => {
    console.log('client connected');
});

server.listen(55555, 'localhost', () => {
    console.log("server bound");
});
