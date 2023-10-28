FROM fedora:38

WORKDIR /usr/src/dockator


EXPOSE 9001

COPY Tor.repo /etc/yum.repos.d/Tor.repo
COPY torrc /etc/tor/torrc

RUN dnf update -y && dnf install -y tor nyx && \
    dnf install https://rpm.nodesource.com/pub_20.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm -y && \
    dnf install -y npm

COPY package*.json ./

RUN npm install

COPY index.js .


ENTRYPOINT ["node", "index.js"]
