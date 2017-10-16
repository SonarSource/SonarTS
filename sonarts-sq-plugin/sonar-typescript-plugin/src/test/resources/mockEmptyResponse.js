
process.stdin.on('data', function () {
 // needed for 'end' to be sent
});

process.stdin.on('end', function () {
    process.stderr.write("Some error message");
});
