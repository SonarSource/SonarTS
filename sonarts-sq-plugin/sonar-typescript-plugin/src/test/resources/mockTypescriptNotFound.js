#!/usr/bin/env node

process.stdin.on('data', function () {
 // needed for 'end' to be sent
});

process.stdin.on('end', function () {
  console.error("Error: Cannot find module 'typescript'");
});




