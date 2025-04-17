#!/usr/bin/env node

if(process.argv.length < 4) {
	console.log("Transform log4j logger content into content size");
	console.log("Usage: "+process.argv[0]+" "+process.argv[1]+" <prefix regex> <file.og> [file.log.1] ... [file.log.N]");
	console.log(" e.g.: "+process.argv[0]+" "+process.argv[1]+" '[^ ]* (TRACE|DEBUG|INFO|WARN|ERROR) [ ]*-' <file.og> [file.log.1] ... [file.log.N]");
	process.exit();
}

const fs = require('fs');
const readline = require('readline');

let prefix = '';
let contentLength = '';

async function processFile(prefixRE, fileName) {
	const fileStream = fs.createReadStream(fileName);

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	for await (const line of rl) {
		const match = line.match(prefixRE);
		if(!match) {
			contentLength += line.length;
			continue;
		}

		if('' != prefix) {
			console.log(`${prefix} ${contentLength}`);
		}

		prefix = match[1];
		contentLength = match[match.length-1].length;
	}
	console.log(`${prefix} ${contentLength}`);
}

async function main() {
	const prefixRE = new RegExp('('+process.argv[2]+')(.*)$');

	for(let i = 3; i < process.argv.length; i++) {
		await processFile(prefixRE, process.argv[i]);
	}
}

main();
