## Presence

![screenshot](https://www.evernote.com/shard/s17/sh/e74d3ddd-63db-498b-9341-0db532cff488/08bc91fe7edf8b24d65fa5379819d792/deep/0/Presence.png "Screenshot")

### Setup
1. Setup Firebase:
    1. [Sign up](https://www.firebase.com) for a Firebase account and create a database.
    2. Go to "Security Rules" tab, click "Load Rules" button and select `rules.json` file.
    3. Go to "Data" tab and add users. You can check required schema in `users.json` file. You can add them by hand or modify `users.json` file and import it by clicking "Import JSON" button.
    4. Take note of your database URL and its secret, which can be found in "Secrets" tab.
3. Run `npm install` to install all dependencies.
4. Run `grunt setup` - this will ask you a for Firebase URL and its secret and generate the app into `dist` folder.
5. Setup scanning script on your server:
    1. Copy `dist/scan_macs.sh` file to your server:

    `scp dist/scan_macs.sh your-server:/usr/local/bin/`

    2. SSH to your server and change owner of the script:

    `sudo chown root:root scan_macs.sh`

    3. Setup cron by running `sudo crontab -e`. It should be ok to run the script every minute:

    `* * * * * /usr/local/bin/scan_macs.sh`
6. Open `dist/index.html` file in your favorite browser and you're done!

The configuration is saved into `config.json` file. You can change your database URL or authentication token there and then run `grunt build` to regenerate the app using the new configuration.

### Deployment
It doesn't need any server - once you generate the app you can simply open `dist/index.html` file in your browser and it will work. However, you probably want to host it somewhere, so that it's available for others too. You can use e.g. [GitHub Pages](http://pages.github.com/) for that. Just fork this repo, run `grunt setup`, copy contents of generated `dist` folder to `gh-pages` branch and push it to GitHub.
