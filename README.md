"# Smart Healthcare Platform

## Overview

This repository contains a microservice-based healthcare platform with the following services:

- `api-gateway/`
- `auth-service/`
- `appointment-service/`
- `doctor-service/`
- `patient-service/`
- `payment-service/`
- `notification-service/`
- `telemedicine-service/`
- `AISymptomChecker-service/`
- `frontend/`
- `k8s/`

## Prerequisites

- Node.js installed
- Docker and Docker Compose installed (optional, for containerized deployment)
- npm available on your PATH

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Smart-Healthcare-Platform
   ```

2. Install root dependencies:

   ```bash
   npm install
   ```

3. Install service dependencies if needed (services may also contain their own `package.json` files):

   ```bash
   cd auth-service && npm install
   cd ../api-gateway && npm install
   cd ../appointment-service && npm install
   cd ../doctor-service && npm install
   cd ../notification-service && npm install
   cd ../patient-service && npm install
   cd ../payment-service && npm install
   cd ../telemedicine-service && npm install
   cd ../frontend && npm install
   ```

## Running Locally

### Start selected services with npm

From the repository root, run:

```bash
npm run start:all
```

This starts the `auth-service` and `api-gateway` together using the workspace script defined in the root `package.json`.

### Start with Docker Compose

If you want to run the platform in containers, use:

```bash
docker-compose up --build
```

## Kubernetes Deployment

Deployment manifests are available in the `k8s/` folder.

1. Create the namespace and config objects:

   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configMap.yaml
   kubectl apply -f k8s/secrets.yaml
   ```

2. Deploy each service manifest:

   ```bash
   kubectl apply -f k8s/auth-service.yaml
   kubectl apply -f k8s/api-gateway.yaml
   kubectl apply -f k8s/appointment-service.yaml
   kubectl apply -f k8s/doctor-service.yaml
   kubectl apply -f k8s/notification-service.yaml
   kubectl apply -f k8s/patient-service.yaml
   kubectl apply -f k8s/payment-service.yaml
   kubectl apply -f k8s/symptom-checker-service.yaml
   kubectl apply -f k8s/telemedicine-service.yaml
   ```

## Project Structure

- `api-gateway/`: central API gateway and routing layer
- `auth-service/`: authentication and user management
- `appointment-service/`: appointment scheduling
- `doctor-service/`: doctor profiles and prescriptions
- `patient-service/`: patient records and uploads
- `payment-service/`: payment handling
- `notification-service/`: email/SMS notifications
- `telemedicine-service/`: virtual session handling
- `AISymptomChecker-service/`: AI symptom checker model and prediction API
- `frontend/`: web client application

## Notes

- Each service typically includes its own `Dockerfile` and `package.json`.
- Use the `k8s/` manifests for container orchestration in Kubernetes.
- Adjust environment variables and ports per service as needed.
" 

