set dotenv-load

IMAGE_PREFIX := "chat-app"

default:
  just --list

image-build:
  docker compose build

k3s-import:
  docker save {{IMAGE_PREFIX}}-api-gateway:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-user:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-guild:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-message:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-realtime:latest | sudo k3s ctr images import -
  docker save {{IMAGE_PREFIX}}-media:latest | sudo k3s ctr images import -

k3s-helm:
  helm repo add bitnami https://charts.bitnami.com/bitnami
  helm repo add grafana https://grafana.github.io/helm-charts
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo add minio https://charts.min.io/
  helm repo update
  helm install postgres bitnami/postgresql -f k8s/helm/postgres.yaml --set auth.password=$DATABASE_PASSWORD
  helm install redis bitnami/redis -f k8s/helm/redis.yaml
  helm install minio minio/minio -f k8s/helm/minio.yaml --set rootUser=$RUSTFS_ACCESS_KEY --set rootPassword=$RUSTFS_SECRET_KEY
  helm install prometheus prometheus-community/prometheus -f k8s/helm/prometheus.yaml
  helm install loki grafana/loki -f k8s/helm/loki.yaml
  helm install tempo grafana/tempo -f k8s/helm/tempo.yaml
  helm install grafana grafana/grafana -f k8s/helm/grafana.yaml
  helm install alloy grafana/alloy -f k8s/helm/alloy.yaml

k3s-deploy:
  kubectl kustomize k8s/base/ --load-restrictor LoadRestrictionsNone | kubectl apply -f -

k3s-up: k3s-helm k3s-import k3s-deploy

k3s-down:
  kubectl kustomize k8s/base/ --load-restrictor LoadRestrictionsNone | kubectl delete -f - || true
  helm uninstall postgres redis minio prometheus loki tempo grafana alloy || true
