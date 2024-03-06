const path = require('path');
const SwaggerParser = require('@apidevtools/swagger-parser');

class CheckApiDoc {
    /**
     * 
     * @param {import("serverless")} serverless 
     * @param {*} options 
     */
    constructor(serverless, options, { log }) {
        /** @type {import("serverless")} */
        this.serverless = serverless;
        this.options = options;
        this.log = log;

        this.commands = {
            'check-api': {
                lifecycleEvents: ['run']
            }
        };

        this.hooks = {
            'check-api:run': async () => this.checkApiDoc()
        };
    }

    async checkApiDoc() {
        const apiDocPath = this.serverless.service.custom?.checkApiDoc?.apiDocPath || 'openapi.json'
        const exclude = this.serverless.service.custom?.checkApiDoc?.exclude || []
        const api = await SwaggerParser.dereference(path.resolve(apiDocPath));

        const missMatch = Object.keys(this.serverless.service.functions).filter(fnName =>{
            const funct = this.serverless.service.functions[fnName]
            const missMatchEvent = funct.events.filter(event=>{
                if(!event.http){
                    return false;
                }

                if(exclude.find(path => this.matchPath(event.http.path,path))){
                    return false;
                }

                const display = event.http.method.toUpperCase() + " " + event.http.path;

                const match = Object.keys(api.paths).find(path => this.matchPath(event.http.path,path));
                
                if(!match){
                    this.log.error(display);
                    return true;
                }

                const methodMatch = Object.keys(api.paths[match]).find(method => method.toUpperCase() === event.http.method.toUpperCase());

                if(!methodMatch){
                    this.log.error(display);
                    return true;
                }

                this.log.success(display);
                return false;

            });
            return missMatchEvent.length > 0;
        });
        if(missMatch.length > 0){
            throw new this.serverless.classes.Error('One or more endpoints were not documented');
        }
    }

    /**
     * 
     * @param {string} path 
     * @returns {RegExp}
     */
    matchPath(path, path2) {
        const reg = '^/?'+path.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/[{][^/\\]+[}]/g, '\\{[^/\\\\]+\\}')+'$';
        // console.log(path, path2, reg)
        return path2.match(new RegExp(reg));
    }
}

module.exports = CheckApiDoc;