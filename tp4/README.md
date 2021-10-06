## Introduction à Google Kubernetes Engine 

Kubernetes Engine est un environnement géré et prêt à l'emploi pour le déploiement d'applications en conteneur. Il regroupe les dernières innovations de Google en matière de productivité des développeurs, d'efficacité des ressources, d'automatisation des opérations et de flexibilité Open Source pour accélérer le temps de production.

### 1. Premier projet GKE
<hr>

Avant de commencer un projet GKE, vous devez installer le composant **kubctl** avec le SDK.

<pre>gcloud components install kubectl</pre>

On configure la zone et la région par default de notre projet si ce n'est pas fait.

```
gcloud config set compute/zone europe-west-a
gcloud config set compute/region europe-west
gcloud config list
```

### 2. Création du cluster GKE

Un cluster GKE comprend au moins un Master et plusieurs noeuds. Les noeuds sont représentés par des instances Compute Engine qui lancent les processus Kubernetes nécessaires pour les inclures au cluster. Théoriquement, on déploie une application sur des clusters et elles sont exécutées sur les noeuds.

Pour créer un cluster :

<pre>gcloud container clusters create [CLUSTER_NAME]</pre>

### 3. Obtenir les infos d'authentification

Après avoir créer votre cluster, vous aurez besoin des infos d'authentification pour pouvoir intéragir avec lui.

<pre>gcloud container clusters get-credentials [CLUSTER_NAME]</pre>

La commande configure **kubctl** pour qu'il utilise le cluster créé.

### 4. Déployer

On est maintenant prêt à déployer une application conteneurisée sur notre cluster. GKE utilise des objets Kubernetes pour créer et gérer les ressources de vos clusters. L'objet **Deployment** permet de déployer une application sans état comme un serveur web. Les objets **Service** définissent quant à eux les règles et le load balancing pour accéder à votre application.

On créé donc un Deployment.

```
kubectl run nginx --image=nginx --replicas=3
```

Cela créé une réplique de controller pour faire tourner 3 pods, chaque pod exécute un container nginx.

<pre>kubectl get pods -owide</pre>

Pour voir l'état des pods.
On voit que tous les pods fonctionnent dans un noeud différent.
On peut donc exposer le cluster nginx comme service externe.

### 5. Exposer

On peut exposer une application en créant un **Service**. Cette ressource Kubernetes expose l'application au traffic externe.
Pour exposer l'application déployer, on lance la commande : 

```
kubectl expose deployment nginx --port=80 --target-port=80 \
    --type=LoadBalancer
``` 

Le flag **--type** LoadBalancer créé un load balancer Compute Engine pour notre conteneur. Attention néanmoins, les load balancers sont payant.

**--port** initialise le port 80 et **--target-port** redirige le traffic vers le port 80 de l'application.

### 6. Inspecter

Pour voir votre application fonctionner on doit inspecter le Service hello-server pour retrouver l'adresse du load balancer

<pre>kubectl get service nginx</pre>

L'output de la commande vous donner l'IP externe du Service.
C'est avec cette IP que vous aurez accès à l'appli sur un navigateur.

<hr>

Voilà, vous venez de déployer votre première application conteneurisée. On oublie pas de clean le projet pour ne pas payer de frais supplémentaires.

<pre>kubectl delete service nginx</pre>

La commande supprime le load balancer Compute Engine qu'on a créé en exposant le deploiment.

<pre> kubectl delete deployment nginx </pre>

On supprime aussi le cluster créé plus tôt

<pre>gcloud container clusters delete [CLUSTER_NAME]</pre>


### Note

Toutes les manipulations auraient aussi pu être écrites dans un fichier au format **yaml** et être exécutées par **kubectl** :

<pre> kubectl apply -f specs.yaml</pre>

Dans la suite du TP, cette option sera préférée.
