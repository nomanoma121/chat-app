set dotenv-load

IMAGE_PREFIX := "chat-app"

default:
  just --list

image-build:
  docker compose build

image-import:
  docker save {{IMAGE_PREFIX}}-api-gateway:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-user:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-guild:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-message:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-realtime:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-media:latest | sudo k3s ctr images import -

argocd-secrets:
  kubectl create namespace chat-app-local --dry-run=client -o yaml | kubectl apply -f -
  kubectl create namespace storage --dry-run=client -o yaml | kubectl apply -f -
  kubectl create namespace database --dry-run=client -o yaml | kubectl apply -f -
  kubectl create secret generic app-secrets \
    --from-env-file=k8s/overlays/local/.env \
    -n chat-app-local \
    --dry-run=client -o yaml | kubectl apply -f -
  kubectl create secret generic minio-secret \
    --from-literal=rootUser=$RUSTFS_ACCESS_KEY \
    --from-literal=rootPassword=$RUSTFS_SECRET_KEY \
    -n storage \
    --dry-run=client -o yaml | kubectl apply -f -
  kubectl create secret generic postgres-secret \
    --from-literal=password=$DATABASE_PASSWORD \
    -n database \
    --dry-run=client -o yaml | kubectl apply -f -
