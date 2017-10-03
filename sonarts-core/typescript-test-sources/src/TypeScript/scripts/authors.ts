import fs = require('fs');
import path = require('path');
import child_process = require("child_process");

type Author = {
    displayNames: string[];
    preferedName?: string;
    emails: string[];
};

type AuthorMap = { [s: string]: Author };

type Command = {
    (...arg: string[]): void;
    description?: string;
};

const mailMapPath = path.resolve("../.mailmap");
const authorsPath = path.resolve("../AUTHORS.md");

function getKnownAuthors(): Author[] {
    const segmentRegExp = /\s?([^<]+)\s+<([^>]+)>/g;
    const preferedNameRegeExp = /\s?#\s?([^#]+)$/;
    const knownAuthors: Author[] = [];

    if (!fs.existsSync(mailMapPath)) {
        throw new Error(`Could not load known users form .mailmap file at: ${mailMapPath}`);
    }

    const mailMap = fs.readFileSync(mailMapPath).toString();

    for (const line of mailMap.split("\r\n")) {
        const author: Author = { displayNames: [], emails: [] };
        let match: RegExpMatchArray | null;

        while (match = segmentRegExp.exec(line)) {
            author.displayNames.push(match[1]);
            author.emails.push(match[2]);
        }
        if (match = preferedNameRegeExp.exec(line)) {
            author.preferedName = match[1];
        }
        if (!author.emails) continue;
        knownAuthors.push(author);
        if (line.indexOf("#") > 0 && !author.preferedName) {
            throw new Error("Could not match prefered name for: " + line);
        }
        // console.log("===> line: " + line);
        // console.log(JSON.stringify(author, undefined, 2));
    }
    return knownAuthors;
}

function getAuthorName(author: Author) {
    return author.preferedName || author.displayNames[0];
}

function getKnownAuthorMaps() {
    const knownAuthors = getKnownAuthors();
    const authorsByName: AuthorMap = {};
    const authorsByEmail: AuthorMap = {};
    knownAuthors.forEach(author => {
        author.displayNames.forEach(n => authorsByName[n] = author);
        author.emails.forEach(e => authorsByEmail[e.toLocaleLowerCase()] = author);
    });
    return {
        knownAuthors,
        authorsByName,
        authorsByEmail
    };
}

function deduplicate<T>(array: T[]): T[] {
    let result: T[] = []
    if (array) {
        for (const item of array) {
            if (result.indexOf(item) < 0) {
                result.push(item);
            }
        }
    }
    return result;
}

function log(s: string) {
    console.log(`   ${s}`);
}

function sortAuthors(a: string, b: string) {
    if (a.charAt(0) === "@") a = a.substr(1);
    if (b.charAt(0) === "@") b = b.substr(1);
    if (a.toLocaleLowerCase() < b.toLocaleLowerCase()) {
        return -1;
    }
    else {
        return 1;
    }
}

namespace Commands {
    export const writeAuthors: Command = function () {
        const output = deduplicate(getKnownAuthors().map(getAuthorName).filter(a => !!a)).sort(sortAuthors).join("\r\n* ");
        fs.writeFileSync(authorsPath, "TypeScript is authored by:\r\n* " + output);
    };
    writeAuthors.description = "Write known authors to AUTHORS.md file.";

    export const listKnownAuthors: Command = function () {
        deduplicate(getKnownAuthors().map(getAuthorName)).filter(a => !!a).sort(sortAuthors).forEach(log);
    };
    listKnownAuthors.description = "List known authors as listed in .mailmap file.";

    export const listAuthors: Command = function (...specs:string[]) {
        const cmd = "git shortlog -se " + specs.join(" ");
        console.log(cmd);
        const outputRegExp = /\d+\s+([^<]+)<([^>]+)>/;
        const tty = process.platform === 'win32' ? 'CON' : '/dev/tty';
        const authors: { name: string, email: string, knownAuthor?: Author }[] = [];
        child_process.exec(`${cmd} < ${tty}`, { cwd: path.resolve("../") }, function (error, stdout, stderr) {
            if (error) {
                console.log(stderr.toString());
            }
            else {
                const output = stdout.toString();
                const lines = output.split("\n");
                lines.forEach(line => {
                    if (line) {
                        let match: RegExpExecArray | null;
                        if (match = outputRegExp.exec(line)) {
                            authors.push({ name: match[1], email: match[2] });
                        }
                        else {
                            throw new Error("Could not parse output: " + line);
                        }
                    }
                });

                const maps = getKnownAuthorMaps();

                const lookupAuthor = function ({name, email}: { name: string, email: string }) {
                    return maps.authorsByEmail[email.toLocaleLowerCase()] || maps.authorsByName[name];
                };

                const knownAuthors = authors
                    .map(lookupAuthor)
                    .filter(a => !!a)
                    .map(getAuthorName);
                const unknownAuthors = authors
                    .filter(a => !lookupAuthor(a))
                    .map(a => `${a.name} <${a.email}>`);

                if (knownAuthors.length) {
                    console.log("\r\n");
                    console.log("Found known authors: ");
                    console.log("=====================");
                    deduplicate(knownAuthors).sort(sortAuthors).forEach(log);
                }

                if (unknownAuthors.length) {
                    console.log("\r\n");
                    console.log("Found unknown authors: ");
                    console.log("=====================");
                    deduplicate(unknownAuthors).sort(sortAuthors).forEach(log);
                }
            }
        });
    };
    listAuthors.description = "List known and unknown authors for a given spec";
}

var args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: node authors.js [command]');
    console.log('List of commands: ');
    Object.keys(Commands).forEach(k => console.log(`     ${k}: ${(Commands as any)[k]['description']}`));
} else {
    var cmd: Function = (Commands as any)[args[0]];
    if (cmd === undefined) {
        console.log('Unknown command ' + args[1]);
    } else {
        cmd.apply(undefined, args.slice(1));
    }
}
