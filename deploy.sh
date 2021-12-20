docker build -t levond/multi-nginx:latest -t levond/multi-nginx:$SHA ./nginx
docker build -t levond/multi-client:latest -t levond/multi-client:$SHA -f Dockerfile.client.prod .
docker build -t levond/multi-server:latest -t levond/multi-server:$SHA --build-arg BUILD_CONTEXT=server .
docker build -t levond/multi-worker:latest -t levond/multi-worker:$SHA --build-arg BUILD_CONTEXT=worker .
  # Take those images and push them to docker hub
docker push levond/multi-client:latest
docker push levond/multi-nginx:latest
docker push levond/multi-server:latest
docker push levond/multi-worker:latest

docker push levond/multi-client:$SHA
docker push levond/multi-nginx:$SHA
docker push levond/multi-server:$SHA
docker push levond/multi-worker:$SHA
