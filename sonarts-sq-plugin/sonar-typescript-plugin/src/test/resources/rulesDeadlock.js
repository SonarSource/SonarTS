#!/usr/bin/env node

let errorMessage = "abcd";

for (let i = 0; i < 20; i++) {
  errorMessage += errorMessage;
}
throw errorMessage;
