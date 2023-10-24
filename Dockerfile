FROM fedora

EXPOSE 9001

COPY Tor.repo /etc/yum.repos.d/Tor.repo
COPY torrc-defaults /etc/tor/torrc-defaults
COPY entrypoint.sh /entrypoint.sh

RUN dnf update -y && dnf install -y tor && \
    chmod ugo+rx /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
