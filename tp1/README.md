# Introduction à Google Compute Engine

### Objectifs
<hr>

Le but de ce TP est de prendre la création d'instance et le déploiement d'un service à l'aide de GCE.
Les tâches suivantes sont demandées : 

- Créer un projet GCP
- Créer une instance à l’aide d’un template (f1-micro)
- Créer une image de l’instance
- Créer un template de cette image
- Créer une autre instance utilisant le template
- Lancer un service simple (nginx, nodejs …)
- Le rendre disponible (IP/Pare-feu/Port?)
- Terminer et nettoyer 


### 1. Création du projet GCP
<hr>

La commande pour créer un projet GCP avec le SDK est la suivante : 

```
gcloud projects create [PROJECT_ID] [--enable-cloud-apis] [--name=NAME] [--set-as-default] ...
```

**--enable-cloud-apis** Rend la cloud API disponible lors de la création. En mode "disponible" par default, utiliser **--no-enable-cloud-apis** pour rendre ne pas utiliser la cloud API. <br>
**--name=NAME** Nom du projet. Si il est non spécifié le nom du projet sera le Project_ID.<br>
**--set-as-default** Permet d'utiliser le projet comme projet par défault lorsque des commandes via le sdk sont exécutées.

Pour que tout le monde ait la même chose :

```
gcloud projects create iaas-ccm --enable-cloud-apis
```

Vous pouvez aussi mettre à jour les composants du SDK après création du projet : 

```
gcloud components update
```

### 2. Création d'une instance f1-micro
<hr>
GCE propose un type d'instances standards et un type d'instances préemptives. Les instances préemptives sont des instances à faible durée de vie qui ont l'avantage d'être bien moins chères que les autres instances et leur prix reste fixe (pratique quand on oublie d'éteindre nos VMs).

### 3. Création simple d'une instance
<hr>

On peut créer une instance standard avec la commande suivante.

```
gcloud compute instances create INSTANCE_NAMES
```

Pour créer une instance de type préemtive on rajoute un flag.

```
gcloud compute instances create INSTANCE_NAMES --preemptible
```

Le nom de l'instance est le seul argument obligatoire, on va néanmoins choisir nous même l'image à partir de laquelle lancer notre VM, ainsi que les ressources à lui allouer.
Pour avoir la liste des images disponibles dans GCE on tape :

```
gcloud compute images list
```

Pour connaître le type de machine à utiliser en fonction des ressources dont on a besoin :

```
gcloud compute machine-types list
```

On va donc créer une instance à 1 CPU de type **standard** dans une zone géographique proche pour éviter les problèmes de latence.

```
gcloud compute instances create tp-1-instance \
    --machine-type f1-micro
--zone europe-west4-a
```

On vérifie si l'instance est prête.

```
gcloud compute instances list
```

On peut alors si connecter par SSH si besoin.

```
gcloud compute ssh tp-1-instance
```

Une autre chose pratique, on peut donner à l'instance un script à exécuter à son démarrage en utilisant le flag :

<pre>--metadata-from-file startup-script=my_script.sh</pre>


### 4. Création d'une image à partir d'une instance
<hr>

Créer des images personnalisées peut permettre d'obtenir des groupes d'instances partageant les même fonctionnalités logicielles. La création d'instance par l'utilisation d'image est aussi une méthode permettant d'assurer la scalabilité d'un projet.

Pour créer une image à partir d'une instance existante il faut tout d'abord arrêter l'image pour qu'elle arrête l'écriture sur son disque persistant.

```
gcloud compute instances stop tp-1-instance
```

On utilise la commande suivante pour créer une image personnalisée : 

```
gcloud compute images create [IMAGE_NAME] \ 
    --source-disk [SOURCE_DISK] \ 
    --source-disk-zone [ZONE] \
```

Dans notre cas on créé une image de l'instance créée plus tôt : 

```
gcloud compute images create tp-1-image \ 
    --source-disk tp-1-instance \ 
    --source-disk-zone europe-west4-a
```

Le source disk est le disk persistent appartenant à l'instance dont vous souhaitez récupérer l'image.<br>
Vous avez aussi la possibilité de créer une image perso en utilisant une image déjà existante.

```
gcloud compute images create [IMAGE_NAME] \ 
    --source-image [SOURCE_IMAGE] \ 
    --source-image-project [IMAGE_PROJECT]
```

### 5. Création d'un template d'instance
<hr>

Il arrive qu'on ait besoin de dupliquer une instance pour des raisons de test ou de load balancing (par exemple). GCE offre la possibilité de créer des templates d'instance pour permettre de lancer des VMs partageant des configurations similaires. En créant un template on peut alors récréer des VMs sans spécifier une liste de paramètres à chaque fois.

Pour créer un template d'instance :

```
gcloud compute instance-templates create template-1 --source-instance=tp-1-instance --source-instance-zone=europe-west4-a
```

Si aucun paramètre n'est spécifié, le template prend les valeurs par défaut suivantes en tant que config des instances créées en suivant son modèle :

- **Type de machine :** n1-standard-1
- **Image :** image la plus récente de Debian
- **Disque de démarrage :** un nouveau disque de démarrage standard nommé d'après l'instance
- **Réseau :** le réseau VPC default
- **Adresse IP :** une adresse IP externe éphémère

Maintenant le template créé on peut par exemple l'utiliser pour créer une instance.

```
gcloud compute instances create tp-1-instance-2 \ 
    --source-instance-template tp-1-template
```

### 6. Création d'un groupe d'instance
<hr>

Dans le cas ou vous souhaiteriez apporter une modification à plusieurs de vos instances sans les traiter une par une, les rattacher à un groupe d'instance peut vous faire gagner énormément de temps. Il existe deux types de groupes d'instances : géré et non-géré. Le groupe d'instance géré contient des instances identiques et permet dont plusieurs choses :

- Lorsque vos applications nécessitent des ressources de calcul supplémentaires, les groupes d'instances gérés peuvent automatiquement adapter le nombre d'instances du groupe.
- Les groupes d'instances gérés utilisent des services d'équilibrage de charge pour répartir le trafic entre toutes les instances du groupe.
- Si une instance du groupe s'arrête, plante ou est supprimée par une action différente des commandes des groupes d'instances, le groupe d'instances géré recréé automatiquement l'instance afin de pouvoir reprendre ses tâches de traitement. L'instance recréée utilise le même nom et le même modèle d'instance que l'instance précédente, même si le groupe référence un modèle d'instance différent.
-Les groupes d'instances gérés peuvent automatiquement identifier et recréer des instances défectueuses dans un groupe afin d'optimiser en permanence l'exécution de toutes les instances.

Pour créer un groupe d'instance géré :

```
gcloud compute instance-groups managed create tp-1-grp --base-instance-name tp-1-instance --size 3 --template tp-1-template
```

On peut lister les groupes gérés ou obtenir des informations les concernant.

```
gcloud compute instance-groups managed list
gcloud compute instance-groups managed describe [INSTANCE_GROUP] \
    --zone [ZONE]
```

### 7. Lancer un service simple (nginx, nodejs …)
<hr>

Pour ce travail, deux solutions s'offrent à vous : 
- Vous connecter à une instance et installer le serveur à la mano
- Créer une instance avec un startup script

On choisira la deuxième option pour des raisons évidentes ... ;)

Pour cet exemple on reprend le startup script fourni par Google pour la mise en place d'un serveur NodeJS.
Vous trouverez ce script dans le repo sous **tp1**.

```
gcloud compute instances create nginx-instance \
	--image-family=debian-9 \
    --image-project=debian-cloud \
    --machine-type=g1-small \
    --metadata app-location=europe-west4-a \
    --metadata-from-file startup-script=nginx-startup.sh \
    --zone europe-west4-a \
    --tags http-server
```

Cette commande nous permet donc d'avoir une instance de type f1-micro prenant un startup script qui lance un serveur nodejs. Le flag **tags** permet à d'autre service GCP comme **Network** d'identifier la machine. <br>

On peut maintenant regarder si tout va bien en affichant les logs.

```
gcloud compute instances get-serial-port-output nodeapp-instance --zone europe-west4-a
```

### 8. Rendre un service disponible
<hr>

Pour pouvoir autoriser le traffic sur notre instance, nous avons maintenant besoin de créer une règle de pare-feu.

```
gcloud compute firewall-rules create default-allow-http-8080 \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --target-tags http-server
```

Le target-tags représente le tag donné à l'instance plus haut. La création de la règle de pare-feu permet alors d'exposer la ressource sur le port 8080. <br>
Vous pouvez maintenant récupérer l'adresse de la machine et la voir dans un navigateur.

```
gcloud compute instances list

# Dans un navigateur
http://YOUR_INSTANCE_IP:8080
```

Notez que par défault cet adresse IP est dite éphémère, lors du redémarrage de l'instance elle changera donc.<br>
GCP nous permet de réserver des adresses statiques et les attribuées à nos VMs (Payant bien sûr ...).
Dans le cas de notre VM, puisqu'une adresse est déjà attribuée on va en créer une autre et modifier la configuration d'accès à la machine.

On commence par créer l'adresse : 

```
gcloud compute addresses create [ADDRESS_NAME] \ 
    [--region [REGION] | --global ] \ 
    [--ip-version [IPV4 | IPV6]]
```

Évidemment si vous avez créé cette adresse avant la création de l'instance vous pouvez la donner à l'instance lors de sa création ...

```
gcloud compute instances create [INSTANCE_NAME] --address [IP_ADDRESS]
```

Une instance ne peut avoir qu'une seule configuration d'accès. Avant d'essayer d'attribuer une nouvelle configuration d'accès avec une nouvelle IP, vérifiez si votre instance dispose d'une configuration d'accès.

```
gcloud compute instances describe nodeapp-instance
```

La config existe, on la supprime : 

```
gcloud compute instances delete-access-config [INSTANCENAME] \
    --access-config-name "[ACCESSCONFIG_NAME]"
```

L'instance peut maintenant prendre une nouvelle configuratio d'accès. On en créé une en renseignant l'adresse créée plus haut.

```
gcloud compute instances add-access-config [INSTANCE_NAME] \ 
    --access-config-name "[ACCESS_CONFIG_NAME]" 
    --address [IP_ADDRESS]
```

L'adresse donnée est alors statique et servira pour les connections à l'instance et à votre application donc.

### 9. Terminer et supprimer

On peut maintenant nettoyer le projet en supprimant nos instances, template etc ...

```
gcloud compute images delete tp-1-image

gcloud compute instance-templates delete tp-1-template

gcloud compute instances stop nodeapp-instance
gcloud compute instances delete nodeapp-instance --delete-disks all

gcloud compute instances stop tp-1-instance
gcloud compute instances delete tp-1-instance --delete-disks all
```

# Conclusion du TP

Dans ce TP vous avez pu jouer un peu avec le sdk GCE et le manipuler pour créer des instances vides ou portant un serveur de votre choix. <br>
Vous êtes désormais capable de déployer n'importe quelle application et la rendre disponible, GG !
Le déploiement d'application avec GCE correspond au modèle Infrastructure-as-a-Service des services de Cloud computing.
L'étape suivante consiste à déployer votre même application à l'aide d'un modèle SaaS.