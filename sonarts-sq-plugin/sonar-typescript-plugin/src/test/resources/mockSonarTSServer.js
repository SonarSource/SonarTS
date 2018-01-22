#!/usr/bin/env node

const net = require('net');

net.createConnection(process.argv[2], () => {
    console.log('client connected');
});
