module.exports = {
    root: __dirname,
    
    modules: ['build', 'examples', 'src', 'test'],
    statics: 'app/statics',
    uploads: 'app/uploads',
    routes: 'app/routes',
    views: 'app/views',
    projects: 'app/statics/projects',
    debug: true,
    port: 80, // 18080

    dbconf: {
        host     : 'sqld.duapp.com',
        port     : '4050',
        user     : 'CWFmhvQWO8zYjTtLfKdXrtbn',
        password : 'OTzSbRAiGMx2D9Ng2yaTpQbN5qPN5rKG',
        database : 'drKjRDMdLVdXBiMFrzbO'
    }
}