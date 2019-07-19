Interface web pour le serveur ExtensiveAutomation
=====================================

Introduction
------------

L'interface web permet de piloter le serveur ExtensiveAutomation à travers son API REST.
Le but est de remplacer à terme le client lourd.

Installation depuis les sources
-------------------------------

1. Cloner ce dépôt sur votre serveur

        git clone https://github.com/ExtensiveAutomation/extensiveautomation-webclient.git

2. Installer les  paquets `npm` and `nodejs v10`, ensuite exécuter la commande suivante:

        cd extensiveautomation-webclient/
        npm install 
        
3. Démarrer le serveur on mode développement

        npm run serve
        
        
Construction depuis les sources
-------------------------------

1. Exécuter la commande pour construire l'interface

        npm run build
        
2. Le résultat est disponible dans le répertoire `dist`. Ces fichiers peuvent être déployé sur un serveur web. Un exemple de configuration pour apache est disponible dans le répertoire `reverseproxy\extensiveautomation_web.conf`.

        Listen 443
        
        <VirtualHost *:443>

          SSLEngine on

          SSLCertificateFile /etc/pki/tls/certs/localhost.crt
          SSLCertificateKeyFile /etc/pki/tls/private/localhost.key

          LogLevel warn
          ErrorLog  /var/log/extensiveautomation_web_error_ssl_rp.log
          CustomLog /var/log/extensiveautomation_web_access_ssl_rp.log combined

          DocumentRoot /var/www/extensiveautomation
          
          <Directory "/var/www/extensiveautomation">
            <IfModule mod_rewrite.c>
              RewriteEngine On
              RewriteBase /
              RewriteRule ^index\.html$ - [L]
              RewriteCond %{REQUEST_FILENAME} !-f
              RewriteCond %{REQUEST_FILENAME} !-d
              RewriteRule . /index.html [L]
            </IfModule>
           </Directory>

        </VirtualHost>

    L'interface est disponible sur le port tcp/443 en mode tls
    
     
Auteur
-------

Logiciel crée par *Denis MACHARD*
 