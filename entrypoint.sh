#!/bin/bash

set -e

env | grep '^TOR_' | tr "=" " " | cut -c 5- > /etc/tor/torrc

sudo -u toranon tor
