#!/usr/bin/env bash
set -e

kubectl apply -f k8s/services.yml
kubectl apply -f k8s/api-gateway-deployment.yml
kubectl apply -f k8s/emergency-service-deployment.yml
kubectl apply -f k8s/insurance-service-deployment.yml
kubectl apply -f k8s/legal-service-deployment.yml
kubectl apply -f k8s/ingress.yml
