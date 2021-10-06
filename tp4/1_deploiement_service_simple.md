# Deploiement d'un service

Dans cette partie du TP on cherche à conteneuriser une app NodeJS pour la déployer sur un cluster Kubernetes.<br>
Pour commencer à travailler avec Kubernetes, on utilise l'outil Minikube.

### 1. Minikube
<hr>

Minikube est un outil facilitant l’exécution locale de Kubernetes. Minikube exécute un cluster Kubernetes à nœud unique dans une machine virtuelle (VM) de votre ordinateur pour les utilisateurs qui souhaitent essayer Kubernetes ou le développer au quotidien.
Puisqu'il est pratique pour les tests, cet outil nous permet donc d'aborder tranquillement, et sans rien casser, l'environnement Kubernetes.

Pour lancer un cluster :

```
minikube start
```

Plusieurs flags peuvent être alignés à cette commande pour donner à minikube plus de capacité de stockage ou lui permettre d'utiliser plus de ressource CPU etc ... La configuration du cluster par défaut nous suffit.<br>
Une fois le cluster démarré on peut vérifier son état et commencer à travailler.

```
kubectl cluster-info
```
> **kubectl** est l'outil qui nous permet d'intéragir avec le cluster.

### 2. Préparer l'image docker
<hr>

Avant de préparer les ressources de déploiement il faut build l'image docker localement. Par défault, Minikube cherchera votre image sur le Docker Hub ou le Docker Registry, puisqu'on travaille entièrement en local il y a quelques manipulations à faire pour l'autoriser à pull des images locales.<br>

La première manipulation est d'exécuter le build de l'image par l'intermédiaire du daemon docker à l'intérieur de Minikube. Pour utiliser ce daemon on exécute : 

```
eval $(minikube docker-env)
```

Vous pouvez maintenant voir qu'on utilise bien le bon daemon :

```
docker ps -a
```

On peut alors build notre image :

```
docker build -t node-server example-docker/
```

### 3. Déployer
<hr>

Maintenant que l'image est disponible, on créé le Deployment dans le fichier example-docker/deployment.yaml

```
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: node-server
  name: node-server
spec:
  replicas: 5
  selector:
    matchLabels:
      app: node-server
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: node-server
    spec:
      containers:
      - image: node-server
        name: node-server
        imagePullPolicy: IfNotPresent
        resources: {}
        ports:
          - containerPort: 3000
status: {}
```

Ce fichier définit le déploiement, l'image qu'il utilise, le conteneur qu'il créé ...<br>
Puisqu'on pull une image locale la propriété **imagePullPolicy: IfNotPresent** est ici très importante. Elle permet à minikube de savoir que si l'image n'est pas disponible sur le Docker Hub, il doit la cherher localement.

On peut alors créer le déploiement et vérifier qu'il existe bien :

```
kubectl apply -f example-docker/deployment.yaml
kubectl get deployments
```

Pour avoir accès à notre serveur node on doit l'exposer. Pour cela on utilise un Service.

```
kubectl create expose deployment node-server --type=NodePort --port=3000
```

Ce service devrait maintenant être disponible sur le cluster, on vérifie : 

```
minikube service list
```

On peut alors demander à minikube de nous le montrer :

```
minikube service node-server
```