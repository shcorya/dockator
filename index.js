"use strict";

const fs = require ('fs');
const { execSync, spawn } = require('node:child_process');
const DateFormat = require ('fast-date-format');
const { Etcd3 } = require('etcd3');

// set date format for logging
const dateFormat = new DateFormat ('MMM HH[:]mm[:]ss.SSS');

// initialize etcd client
const etcd = new Etcd3 ({
    hosts: process.env.DOCKATOR_ETCD_HOSTS.split (',')
});

// for keeping track of the tor process
let tor = null; // will be set as a subprocces when prudent

(async () => {
    // get this node's fingerprint
    let myFingerprint = execSync (`sudo -u toranon tor --list-fingerprint --quiet`).toString ();
    myFingerprint = myFingerprint.substring (myFingerprint.indexOf (' ')).replaceAll (' ', '').trim (); // isolate the fingerprint
    console.log (dateFormat.format (new Date ()), '[node]', 'Generated (or read) fingerprint', myFingerprint);

    // pull the fingerprints and standardize the array
    let etcdResponse = await etcd.get ('/ator/fingerprints').exec (); // calling exec gets the revision
    let revision = etcdResponse.header.revision; // where we need to start watching
    let familyMembers = []; // handle the cases where no family members are found
    if (etcdResponse.kvs > 0) {
        familyMembers = JSON.parse (etcdResponse.kvs[0].value); // parse array object from raw response
    }
    console.log (dateFormat.format (new Date ()), '[node]', 'Found', familyMembers.length, 'fingerprints in etcd.');

    // put this node in the family if not already
    if (!familyMembers.includes (myFingerprint)) { // prevent duplicate array entries
        familyMembers.push (myFingerprint); // include ourselves in the family
        familyMembers = familyMembers.sort (); // standardize
        etcd.put('/ator/fingerprints').value (familyMembers.toString());
        // this will trigger a restart of other nodes
    }

    // generate a config based on the members read from etcd and write to disk
    fs.writeFileSync ('/etc/tor/torrc', generateConfig (familyMembers));
    console.log (dateFormat.format (new Date ()), '[node]', 'Updated torrc file.');

    // start the tor process
    tor = startTor ();

    // watch etcd for further changes
    etcd.watch ().key('/ator/fingerprints').startRevision (revision).create().then (watcher => {
        watcher.on('put', res => {
            console.log (dateFormat.format (new Date ()), '[node]', 'Got new fingerprint(s) from etcd.');
            let newFamily = JSON.parse (res.value);
            let oldFamily = getFamilyFromConfig ();
            // if new family is not equal to family read from torrc
            if (newFamily.toString () != oldFamily.toString ()) {
                // update the config first so that if multiple updates happen after SIGINT is sent we will see all updates
                fs.writeFileSync ('/etc/tor/torrc', generateConfig (newFamily)); // update the config on disk
                console.log (dateFormat.format (new Date ()), '[node]', 'Updated torrc file.');
                // we need to generate an updated torrc and restart the process
                if (tor && !tor.killed) { // tor is running and hasn't been sent SIGINT already
                    tor.kill ('SIGINT');
                    console.log (dateFormat.format (new Date ()), '[node]', 'Sent SIGINT to tor process.');
                    tor.once ('close', function restartTor () {
                        tor = startTor ();
                    });
                }
            }
        })
    });

}) ();

// return an array of family members from the current torrc
function getFamilyFromConfig () {
    let torrc = fs.readFileSync ('/etc/tor/torrc').toString (); // torrc is owned by root
    let torrcLines = torrc.split ('\n'); // read line by line
    torrcLines.forEach ((line) => { //analyze each line
        if (line.startsWith ('MyFamily')) {
            // get the format fingerprint0,fingerprint1,...
            return line.replace ('MyFamily', '').trim ().split (',');
        }
    });
}

// generate an updated config given family members as a sorted array
function generateConfig (familyMembers) {
    let torrc = fs.readFileSync ('/etc/tor/torrc').toString (); // torrc is owned by root
    let torrcLines = torrc.split ('\n'); // read line by line
    torrcLines.forEach ((line, index) => { //analyze each line
        if (line.startsWith ('MyFamily')) {
            torrcLines[index] = `MyFamily ${familyMembers.toString ()}`; // replace the relevent line
        }
    });
    return torrcLines.join ('\n');; // an updated torrc file
}

function startTor () { // call tor = startTor ()
    return spawn ('sudo', ['-u', 'toranon', 'tor'], { stdio: ['ignore', 'inherit', 'inherit']});
}
