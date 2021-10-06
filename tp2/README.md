# Déploiement App Engine

Bien que ce TP ne concerne pas directement le module IaaS, puisque App Engine est un modèle Software-as-a-Service, il est intéressant de bien visualiser la différence de mise en place entre les deux modèles.<br>

### Objectifs
<hr>

La but de ce TP est d'utiliser un modèle SaaS le plus simplement possible pour le déploiement d'une application.
Les tâches demandées sont les suivantes : 
- Déployer un hello world
- Développer un CRUD en local
- Le déployer en utilisant une cloud database

### 1. Déploiement d'une app nodejs
<hr>

Pour cela on va donc reprendre une application simple NodeJS et la déployer avec Google App Engine.

Vous trouverez le code du serveur node dans le fichier app.js. C'est un serveur expressjs qui renvoie 'Hello world' sur la route '/' de l'application, rien de plus simple pour le moment.

On commence par initialiser le projet avec les commandes suivantes :  

```
npm init
npm install express
```

Cela fera apparaître un **package.json** comportant quelques specs de l'application nodejs et un répertoire node_modules contenant les dépendances installer et utiliser par l'app. <br>
Vous pouvez exécuter **node app.js** pour vérifier que le serveur tourne en local.<br>

On est maintenant prêt à déployer sur App Engine. Pour cela, il faut créer un fichier au format **yaml** qui contiendra les paramètres de l'environnement d'exécution du service déployé. Pas de fichier de déploiement = pas de déploiement. <br>

La version minimale de ce fichier ce trouve dans le répo. En commentaire vous trouverez quelques options possible de paramètrage. Pour un exemple simple on a juste besoin de spécifier le runtime de l'application.

Enfin pour déployer avec les paramètres du fichier et voir son exécution dans un navigateur : 

```
gcloud app deploy
gcloud app browse
```

### 2. Connection à une DB
<hr>

L'exemple du dessus est simple. On a maintenant développer un CRUD et besoin de se connecter à une DB distante pour le déployer. Pour ça, deux solutions, on peut installer notre DB sur une instance compute engine ou utiliser une solution Cloud Storage. J'utiliserai ici la première solution.

L'api présente dans ce répo utilise une MongoDB, on créé donc un startup script pour installer et exposer notre MongoDB sur une instance.

```
#! /bin/bash
sudo apt-get update
sudo apt-get install mongodb -y
sudo service mongodb stop
sudo mkdir $HOME/db
sudo pkill -9 mongod
sudo mongod --dbpath $HOME/db --port 80 --fork --logpath /var/tmp/mongodb
EOF
```

Une fois la DB lancer on peut utiliser l'addresse IP Externe de l'instance pour remplacer la connexion localhost sur notre api.