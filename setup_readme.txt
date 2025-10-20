Create a new config file under /etc/httpd/conf.d/:

sudo nano /etc/httpd/conf.d/el.local.conf

<VirtualHost *:80>
    ServerName el.local
    DocumentRoot "/home/magnusolsen/Documents/solpulsen edit/el/backend-php"

    <Directory "/home/magnusolsen/Documents/solpulsen edit/el/backend-php">
        AllowOverride All
        Require all granted
        Options Indexes FollowSymLinks
    </Directory>

    ErrorLog /var/log/httpd/solpulsen_error.log
    CustomLog /var/log/httpd/solpulsen_access.log combined
</VirtualHost>


sudo chcon -R -t httpd_sys_rw_content_t "/home/magnusolsen/Documents/solpulsen edit/el/backend-php"
chmod -R 755 "/home/magnusolsen/Documents/solpulsen edit/el/backend-php"

sudo nano /etc/hosts
127.0.0.1   el.local

sudo systemctl restart httpd
sudo journalctl -xeu httpd

http://el.local


sudo chown -R apache:magnusolsen "/home/magnusolsen/Documents/solpulsen edit/el/backend-php"
sudo chmod -R 775 "/home/magnusolsen/Documents/solpulsen edit/el/backend-php"




