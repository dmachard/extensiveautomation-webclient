FROM httpd:2.4-alpine

COPY ./dist/ /usr/local/apache2/htdocs/
COPY ./apache/extensiveautomation_httpd.conf /usr/local/apache2/conf/extra/

RUN echo "Include conf/extra/extensiveautomation_httpd.conf" >> conf/httpd.conf; \
    sed -i -e 's/^#\(LoadModule .*mod_rewrite.so\)/\1/' conf/httpd.conf;

