# Deploiement d'une application multi-conteneurs

Dans la partie précédente, on a déployer une application sur un cluster Kubernetes en la conteneurisant grâce à un Dockerfile.
Mais qu'en est-il pour des applications divisées en micro-services?

Si la description de votre application est disponible sous format docker-compose, Kubernetes propose un outil appelé **Kompose**. Kompose vous permet soit de générer les fichiers yaml des différents services et déploiements lié à vos micro-services, soit de directement créé les ressources à votre place. Puisqu'on travaille avec des images locales et qu'on aura des modifications à faire sur les objets Deployment on choisit la première option.

### 1. Docker-compose
<hr>

Pour faire un simple test local, on commence par créé les Dockerfile à build pour chacun des services.
Une fois ces Dockerfile prêt on peut écrire un docker-compose.yaml qui contiendra la définition des conteneurs.
Voici un exemple de docker-compose pour déployer une stack MEVN : 

```
version: '3'
services:
  mongo-db:
    image: mongo
    ports:
      - '27017:27017'
  back:
    build: back
    image: back
    ports:
      - '3000:3000'
    links:
      - mongo-db
  front:
    build: front
    image: front
    ports:
      - '80:80'
```

Pour exécuter les conteneurs on lance : 

<pre>docker-compose up</pre>

La commande build les images et run les conteneurs.
Vos services sont maintenant disponible à leurs adresse locales respectives.

### 2. Kompose
<hr>

On peut utiliser la même stratégie avec Kompose. Avec le même fichier, on exécute : 

```
kompose convert
```

Cette commande fera apparaître les manifest de chaque ressource Kubernetes liées au déploiement des services que l'on a définit dans le docker-compose.<br>
On doit alors apporter une modification à ces manifest et ajouter la propriété **imagePullPolicy: IfNotPresent**.

### 3. Déploiement

Avant de lancer ce déploiement, tout comme pour le TP précédent, on doit build chacune des images par l'intermédiaire du daemon docker minikube.

```
docker build -t back path_to_back
docker build -t front path_to_front
```

Une fois les images build on peut créer toutes les ressources Kube : 

```
kubectl apply -f mongo-db-deployment.yaml,mongo-db-service.yaml,\
    back-deployment.yaml,back-service.yaml,\
    front-deployment.yaml,front-service.yaml
```

Vos micro-services devraient maintenant être disponible, on le vérifie :

```
minikube service list
```

Et pour avoir accès à l'un des services

```
minikube service service_name
```

### 4. Gestion des variables d'environnement


