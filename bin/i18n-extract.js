'use strict';

const fs   = require('fs');
const path = require('path');

const source = './src/js';
const templates  = './src/i18n';
const regexp = /Locale\.t\((["'])((?:(?=(\\?))\3.)*?)\1, ?(["'])((?:(?=(\\?))\6.)*?)\4/gm;

const entries = {};

const walkSync = function(dir){
    let files = [];

    fs.readdirSync(dir).forEach((file) => {
        let file_path = path.join(dir, file);

        if(fs.lstatSync(file_path).isDirectory()){
            files = files.concat(walkSync(file_path));
        }
        else{
            files.push(file_path);
        }
    });

    return files;
};

// Parse all files
walkSync(source).forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let match;

    while ((match = regexp.exec(content)) !== null) {
        entries[match[2]] = match[5];
    }
});

// Merge entries with each template and save output to destination
walkSync(templates).forEach((file) => {
    let template = JSON.parse(fs.readFileSync(file, "utf8"));
    let content = {};

    Object.keys(entries).sort().forEach(function(key) {
        content[key] = key in template ? template[key] : entries[key];
    });

    fs.writeFileSync(file, JSON.stringify(content, null, '\t'));
});