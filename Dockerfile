FROM fedora

COPY Tor.repo /etc/yum.repos.d/Tor.repo

RUN dnf update -y && dnf install -y tor
