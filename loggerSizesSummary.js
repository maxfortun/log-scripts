#!/usr/bin/env node
// To produce sorted results:
// jq -r 'to_entries[] | .key + " " + (.value.sum | tostring) + " " + (.value.count | tostring)' | sort -k3n

if(process.argv.length < 4) {
	console.log("Transform log4j logger content into content size");
	console.log("Usage: "+process.argv[0]+" "+process.argv[1]+" <prefix regex> <file.og> [file.log.1] ... [file.log.N]");
	console.log(" e.g.: "+process.argv[0]+" "+process.argv[1]+" '[^ ]* (TRACE|DEBUG|INFO|WARN|ERROR) -' <file.og> [file.log.1] ... [file.log.N]");
	process.exit();
}

const fs = require('fs');
const readline = require('readline');

const prefixes = {};

async function processFile(prefixRE, fileName) {
	const fileStream = fs.createReadStream(fileName);

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	for await (const line of rl) {
		const match  = line.match(prefixRE);
		const prefix = match[1];
		const size   = parseInt(match[match.length-1]);

		let prefixInfo = prefixes[prefix];
		if(!prefixInfo) {
			prefixInfo = prefixes[prefix] = {
				count: 0,
				sum: 0
			};
		}
		prefixInfo.count ++;
		prefixInfo.sum += size;
	}
}

async function main() {
	const prefixRE = new RegExp('('+process.argv[2]+')(.*)$');
	for(let i = 3; i < process.argv.length; i++) {
		await processFile(prefixRE, process.argv[i]);
	}
	console.log(JSON.stringify(prefixes));
}

main();

