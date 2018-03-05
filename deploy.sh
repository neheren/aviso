#!/bin/bash

docker build -t docker.bitkompagniet.dk/nikolaj/smsthing .
docker push docker.bitkompagniet.dk/nikolaj/smsthing

# ssh root@138.68.190.80
# docker stop aviso
# docker rm aviso
# docker rmi docker.bitkompagniet.dk/nikolaj/smsthing

# docker run --name aviso -p 3000:3000 -it  docker.bitkompagniet.dk/nikolaj/smsthing

# ssh -A root@nitrogen.qloud.dk ./deploy-sms-thing.sh

