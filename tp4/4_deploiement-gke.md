# Déploiement avec kubectl

### Objectifs

L'objectif de ce TP est de déployer une application dans un conteneur K8s en utilisant kubectl.

Les tâches demandées sont les suivantes : 
- Conteneuriser votre API et la push sur gcr.io
- Déployer l'API sur le cluster K8s
- Mettre en place l'intégration continue de votre application
- Déployer un front sur le cluster et le connecter à l'API
- Répéter avec Helm

### 1. Préparer et déployer un conteneur
<hr>

La première étape du TP consiste à conteneuriser votre application et la rendre disponible sur le registry gcr.io pour que kubernetes puisse la déployer.

#### 1.1 Conteneurisation

Pour cela on commence par créer un **Dockerfile** et un **.dockerignore**. Ces deux fichiers sont disponible sur le repo dans le répertoire **tp4/example-docker/**. Le Dockerfile définit une liste de commande pour la construction du conteneur. Le .dockerignore permet d'extraire des fichiers de dépendances du build docker.<br>
À l'intérieur du répertoire contenant les deux fichiers on build en spécifiant le flat **-t** pour donner un nom à l'image créée.

<pre>docker build -t gcr.io/${PROJECT_ID}/node-app:v1 .</pre>

Le tag comporte 2 informations importantes, le nom du registry sur lequel on poussera l'image (gcr.io) et l'ID du projet GCP correspondant (PROJECT_ID). Bien évidemment il vous faut d'abord enregistrer PROJECT_ID comme variable d'environnement sur votre système.

Vous devriez voir votre image en exécutant :

<pre>docker images</pre>

Vous pouvez alors tester votre build en exécutant l'image localement : 

<pre>docker run -p 49160:8080 -d gcr.io/${PROJECT_ID}/node-app:v1</pre>

Le flag -p permet de rediriger le traffic d'un port public vers un port privé. Le flag -d signifie **detached** et permet l'exécution du conteneur en tâche de fond. <br>
Si votre serveur est bien écrit, vous y avez maintenant accès sur l'url http://localhost:49160

Maintenant que vous êtes sur que votre build est correctement fait vous pouvez configurer Docker pour qu'il se connecte au gcr.io et push votre image sur le registry.

<pre>
gcloud auth configure-docker
docker push gcr.io/${PROJECT_ID}/node-app:v1
</pre>

#### 1.2 Déploiement K8s

On commence par créé un conteneur K8s

<pre>gcloud container clusters create tp4-cluster</pre>

Kubernetes représentes les applications déployer sous forme de pods. Comme vu en cours, un pod est un groupe d’un ou plusieurs conteneurs possédant les specs sur la manière de les exécuter. Ils sont créés lors d’un **Deployment**.

On doit donc créer un déploiement K8s pour exécuter notre api sur le cluster. 

<pre>kubectl create deployment node-app-deployment --image=gcr.io/${PROJECT_ID}/node-app:v1</pre>

Si vous voulez changer l'image déployer vous pouvez ensuite exécuter la commande suivante : 

<pre>kubectl set image deployment/node-app npde-app=gcr.io/${PROJECT_ID}/new-app:v1</pre>

Pour permettre le load balancing parmis nos pods on peut rescale le deploiement pour créer des replicas des pods et spécifier quel type de scaling nous voulons. Pour cet exemple on prendra un **autoscaler** qui fera passer le nombre de replicas de 2 à un nombre compris entre le nombre de replicas minimum et le maximum donné en commande.

<pre> 
kubectl scale deployment node-app-deployment --replicas=2 
kubectl autoscale deployment node-app-deployment --cpu-percent=60 --min=2 --max=4
</pre>

On peut alors vérifier que le nombre de pods disponibles est le bon :

<pre> kubectl get pods </pre>

#### 1.3 Exposition du service

Bien que des adresses IP individuelles soient attribuées aux pods, ces adresses IP ne sont accessibles qu'à partir de votre cluster. En outre, les pods GKE sont conçus pour être éphémères, et démarrer ou s'arrêter en fonction des besoins du scaling. Et lorsqu'un pod se bloque en raison d'une erreur, GKE le redéploie automatiquement en lui attribuant une nouvelle adresse IP à chaque fois.

Cela signifie que pour tout déploiement, l'ensemble d'adresses IP correspondant à l'ensemble actif de pods est dynamique. Nous avons besoin d'un moyen de 1) regrouper les pods sous un nom d'hôte statique et 2) d'exposer un groupe de pods à l'extérieur du cluster, sur Internet.

Les services Kubernetes permettent de résoudre ces deux problèmes. Les services regroupent les pods sous une seule adresse IP statique, accessible depuis n'importe quel pod du cluster. GKE attribue également un nom d'hôte DNS à cette adresse IP statique, par exemple : hello-app.default.svc.cluster.local.

Le type de service par défaut dans GKE est appelé ClusterIP, où le service obtient une adresse IP accessible uniquement à partir du cluster. Pour exposer un service Kubernetes en dehors du cluster, créez un service de type LoadBalancer. Ce type de service génère une adresse IP d'équilibreur de charge externe pour un ensemble de pods, accessible via Internet.

<pre>
kubectl expose deployment node-app --name=node-app-service --type=LoadBalancer --port 80 --target-port 8080
kubectl get service
</pre>

L'External IP donné par le service est alors l'adresse à laquelle votre application est disponible.


### 2. Préparer et déployer plusieurs econteneurs

Vous savez maintenant comment déployer une application sur un cluster K8s, mais qu'en est-il pour des applications divisées en micro-services?

Si la description de votre application est disponible sous format docker compose, Kubernetes propose un outil appelé **Kompose**. Kompose vous permet donc soit de générer les fichiers yaml des différents services et déploiements lié à vos micro-services, soit de directement créé les ressources à votre place. On verra donc les deux méthodes.

#### 2.1 Docker-compose

Pour faire un simple test local, on commence par créé les Dockerfile à build pour chacun des services.
Une fois ces Dockerfile prêt on peut écrire un docker-compose.yaml qui contiendra la définition des conteneurs.

<pre>
version: '3'
services:
  mongo-db:
    image: mongo
    ports:
      - '27017:27017'
  back:
    build: back
    image: bradawk/back
    ports:
      - '3000:3000'
    links:
      - mongo-db
  front:
    build: front
    image: bradawk/front
    ports:
      - '80:80'
</pre>

Pour exécuter les conteneurs on lance : 

<pre>docker-compose up</pre>

Vos services sont maintenant disponible à leurs adresse locales respectives.

#### 2.2 Déploiement avec Kompose

On peut faire la même manipulation pour déployer les services sur un cluster Kubernetes grâce à Kompose.
À l'emplacement du docker-compose.yaml : 

<pre>kompose up</pre>

Cette commande créée toutes les ressources K8s dont on a besoin pour exposer les services et les déploiements automatiquement.

Pour plus de visibilité on peut lancer :

<pre>kompose convert</pre>

Vous verrez alors la création de plusieurs fichier yaml qui contiennent les descriptions des ressources kubernetes associées au déploiement de vos services. Pour les ajouter au cluster :

<pre>kubectl apply -f *.yaml</pre>

