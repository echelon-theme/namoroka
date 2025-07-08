/**
 * Provides a interface to check for updates and restart on update via GitHub.
 */


export class NamorokaUpdateChecker
{
    static DO_NOT_UPDATE_PREF = "Namoroka.Updates.Disabled";
    static GITHUB_REPOSITORY = "echelon-theme/namoroka";
    static GITHUB_REPOSITORY_BRANCH = "main";
    static BUILD_FILE_PATH_REMOTE = "Namoroka/Profile Folder/chrome/version.json";
    static BUILD_FILE_PATH_LOCAL = "chrome://userchrome/content/version.json";
    
    static #window = null;

    static setWindow(window)
    {
        this.#window = window;
    }
    
    static async #fetchRemoteBuildData()
    {
        let response = await fetch(
            `https://raw.githubusercontent.com/${this.GITHUB_REPOSITORY}/${this.GITHUB_REPOSITORY_BRANCH}/${this.BUILD_FILE_PATH_REMOTE}`, 
            { cache: "reload" }
        );
        if (response.status != 200)
        {
            throw new Error(`Remote server returned ${response.status} when attempting to get version.`);
        }

        let build = await response.json();

        return build;
    }

    static async #fetchLocalBuildData()
    {
        let response = await fetch(
            this.BUILD_FILE_PATH_LOCAL, 
            { cache: "reload" }
        );

        let build = await response.json();

        return build;
    }

    static async getBuildData(distrib) {
        let dataResponse = null;

        switch (distrib) {  
            case "local":
                dataResponse = await this.#fetchLocalBuildData();
                break;
            case "local":
                dataResponse = await this.#fetchRemoteBuildData();
                break;
        }

        return dataResponse;
    }
    
    static async checkForUpdate()
    {
        try {
            let localNamorokaChannel = (await NamorokaUpdateChecker.getBuildData("local"))?.channel;

            let localNamorokaBuild = (await NamorokaUpdateChecker.getBuildData("local"))?.build;
            let remoteNamorokaBuild = (await NamorokaUpdateChecker.getBuildData("remote"))?.build;

            let localNamorokaVersion = (await NamorokaUpdateChecker.getBuildData("local"))?.version;
            let remoteNamorokaVersion = (await NamorokaUpdateChecker.getBuildData("remote"))?.version;

            let isUpdateAvailable = false;

            switch (localNamorokaChannel) {
                case "nightly":
                    if (localNamorokaBuild != remoteNamorokaBuild) {
                        isUpdateAvailable = true;
                    }
                    break;
                case "release":
                    if (localNamorokaVersion != remoteNamorokaVersion) {
                        isUpdateAvailable = true;
                    }
                    break;
            }

            return isUpdateAvailable;
        }
        catch {e} {}
    }
}