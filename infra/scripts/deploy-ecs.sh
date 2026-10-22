#!/usr/bin/env sh
set -eu

environment="$1"
image_tag="$2"
cluster="anime-search-${environment}"
service="anime-search-web-${environment}"
task_family="anime-search-web-${environment}"

aws ecs describe-task-definition \
  --region "$AWS_REGION" \
  --task-definition "$task_family" \
  --query taskDefinition > current-task-definition.json

jq --arg image "${WEB_IMAGE}:${image_tag}" '
  .containerDefinitions |= map(if .name == "web" then .image = $image else . end) |
  del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)
' current-task-definition.json > next-task-definition.json

task_definition_arn="$(aws ecs register-task-definition \
  --region "$AWS_REGION" \
  --cli-input-json file://next-task-definition.json \
  --query taskDefinition.taskDefinitionArn \
  --output text)"

aws ecs update-service \
  --region "$AWS_REGION" \
  --cluster "$cluster" \
  --service "$service" \
  --task-definition "$task_definition_arn" >/dev/null

aws ecs wait services-stable \
  --region "$AWS_REGION" \
  --cluster "$cluster" \
  --services "$service"

echo "Deployed ${service} using release ${image_tag}"
